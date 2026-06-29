from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.db.models.user import User
from app.schemas.generation import (
    GenerationListResponse,
    GenerationResponse,
    StylePresetResponse,
    TextToImageRequest,
)
from app.services.exceptions import (
    ImageGenerationError,
    ModelLoadingError,
    ProviderAPIError,
    ProviderConnectionError,
    ProviderNotConfiguredError,
)
from app.services.image_pipeline import (
    STYLE_PRESETS,
    generate_text_to_image,
    get_user_generation,
    list_user_generations,
    resolve_provider,
)
from app.services.storage import resolve_image_path

router = APIRouter()


def _to_response(generation) -> GenerationResponse:
    return GenerationResponse(
        id=generation.id,
        prompt=generation.prompt,
        style=generation.style,
        provider=generation.provider,
        image_url=f"/api/v1/generation/{generation.id}/image",
        created_at=generation.created_at,
    )


@router.get("/styles", response_model=list[StylePresetResponse])
def list_styles():
    """Return available style presets for text-to-image generation."""
    return [StylePresetResponse(**style) for style in STYLE_PRESETS]


@router.post(
    "/text-to-image",
    response_model=GenerationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def text_to_image(
    payload: TextToImageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate an image from a text prompt."""
    try:
        resolve_provider(payload.provider)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    try:
        generation = await generate_text_to_image(
            db=db,
            user=current_user,
            prompt=payload.prompt,
            style=payload.style,
            provider=payload.provider,
        )
    except ProviderNotConfiguredError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except ModelLoadingError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except ProviderConnectionError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except ProviderAPIError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc
    except ImageGenerationError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc

    return _to_response(generation)


@router.get("/history", response_model=GenerationListResponse)
def generation_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List past generations for the authenticated user."""
    generations = list_user_generations(db, current_user.id)
    items = [_to_response(generation) for generation in generations]
    return GenerationListResponse(items=items, total=len(items))


@router.get("/{generation_id}/image")
def get_generation_image(
    generation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the generated image file."""
    generation = get_user_generation(db, current_user.id, generation_id)
    if generation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Generation not found",
        )

    image_path = resolve_image_path(generation.image_path)
    if not image_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image file not found",
        )

    return FileResponse(path=Path(image_path), media_type="image/png")
