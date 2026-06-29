from collections.abc import Awaitable, Callable

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models.generation import Generation
from app.db.models.user import User
from app.services.exceptions import ImageGenerationError, ProviderNotConfiguredError
from app.services.huggingface import generate_image as huggingface_generate_image
from app.services.stability import generate_image as stability_generate_image
from app.services.storage import delete_generation_file, save_generation_image
from app.services.styles import build_styled_prompt

ProviderFunc = Callable[[str], Awaitable[bytes]]

PROVIDERS: dict[str, ProviderFunc] = {
    "huggingface": huggingface_generate_image,
    "stability": stability_generate_image,
}


def build_prompt(user_prompt: str, style: str | None) -> str:
    return build_styled_prompt(user_prompt, style)


def resolve_provider(provider: str | None) -> str:
    selected = (provider or settings.DEFAULT_IMAGE_PROVIDER).lower()
    if selected not in PROVIDERS:
        raise ValueError(f"Unsupported provider: {selected}")
    return selected


async def generate_text_to_image(
    db: Session,
    user: User,
    prompt: str,
    style: str | None,
    provider: str | None,
) -> Generation:
    selected_provider = resolve_provider(provider)
    full_prompt = build_prompt(prompt, style)

    generate_fn = PROVIDERS[selected_provider]
    try:
        image_bytes = await generate_fn(full_prompt)
    except ProviderNotConfiguredError:
        raise
    except ImageGenerationError:
        raise

    image_path = save_generation_image(image_bytes, user.id)

    generation = Generation(
        user_id=user.id,
        prompt=prompt.strip(),
        style=style,
        provider=selected_provider,
        image_path=image_path,
    )
    db.add(generation)
    db.commit()
    db.refresh(generation)
    return generation


def list_user_generations(db: Session, user_id: int) -> list[Generation]:
    return list(
        db.scalars(
            select(Generation)
            .where(Generation.user_id == user_id)
            .order_by(Generation.created_at.desc())
        )
    )


def get_user_generation(db: Session, user_id: int, generation_id: int) -> Generation | None:
    return db.scalar(
        select(Generation).where(
            Generation.id == generation_id,
            Generation.user_id == user_id,
        )
    )


def delete_user_generation(db: Session, user_id: int, generation_id: int) -> bool:
    generation = get_user_generation(db, user_id, generation_id)
    if generation is None:
        return False

    delete_generation_file(generation.image_path)
    db.delete(generation)
    db.commit()
    return True
