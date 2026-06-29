from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.db.models.user import User
from app.schemas.product import (
    EnhanceProductRequest,
    ProductImageListResponse,
    ProductImageResponse,
)
from app.services.exceptions import (
    BackgroundRemovalError,
    ImageGenerationError,
    ModelLoadingError,
    ProviderAPIError,
    ProviderConnectionError,
    ProviderNotConfiguredError,
)
from app.services.image_pipeline import resolve_provider
from app.services.product_pipeline import (
    ALLOWED_CONTENT_TYPES,
    create_product_upload,
    enhance_product_image,
    get_user_product,
    list_user_products,
)
from app.services.storage import resolve_image_path, resolve_upload_path

router = APIRouter()


def _to_response(product) -> ProductImageResponse:
    enhanced_url = (
        f"/api/v1/products/{product.id}/enhanced"
        if product.enhanced_path
        else None
    )
    return ProductImageResponse(
        id=product.id,
        status=product.status,
        style=product.style,
        provider=product.provider,
        scene_prompt=product.scene_prompt,
        error_message=product.error_message,
        original_url=f"/api/v1/products/{product.id}/original",
        enhanced_url=enhanced_url,
        created_at=product.created_at,
        updated_at=product.updated_at,
    )


@router.post("/upload", response_model=ProductImageResponse, status_code=status.HTTP_201_CREATED)
async def upload_product(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload a product photo for enhancement."""
    content_type = file.content_type or ""
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPEG, PNG, and WebP images are supported",
        )

    file_bytes = await file.read()
    try:
        product = create_product_upload(db, current_user, file_bytes, content_type)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return _to_response(product)


@router.post("/enhance", response_model=ProductImageResponse)
async def enhance_product(
    payload: EnhanceProductRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Enhance an uploaded product image with background removal and a styled scene."""
    try:
        resolve_provider(payload.provider)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    try:
        product = await enhance_product_image(
            db=db,
            user=current_user,
            product_id=payload.product_id,
            style=payload.style,
            scene_prompt=payload.scene_prompt,
            provider=payload.provider,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except ProviderNotConfiguredError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except BackgroundRemovalError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    except ModelLoadingError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except ProviderConnectionError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except ProviderAPIError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    except ImageGenerationError as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc

    return _to_response(product)


@router.get("/history", response_model=ProductImageListResponse)
def product_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List past product uploads and enhancements for the authenticated user."""
    products = list_user_products(db, current_user.id)
    items = [_to_response(product) for product in products]
    return ProductImageListResponse(items=items, total=len(items))


@router.get("/{product_id}/original")
def get_original_image(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the original uploaded product image."""
    product = get_user_product(db, current_user.id, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    image_path = resolve_upload_path(product.original_path)
    if not image_path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image file not found")

    media_type = "image/jpeg" if image_path.suffix.lower() in {".jpg", ".jpeg"} else "image/png"
    return FileResponse(path=Path(image_path), media_type=media_type)


@router.get("/{product_id}/enhanced")
def get_enhanced_image(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the enhanced product image."""
    product = get_user_product(db, current_user.id, product_id)
    if product is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    if not product.enhanced_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enhanced image not available yet",
        )

    image_path = resolve_image_path(product.enhanced_path)
    if not image_path.is_file():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Image file not found")

    return FileResponse(path=Path(image_path), media_type="image/png")
