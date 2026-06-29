from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models.product import ProductImage
from app.db.models.user import User
from app.services import exceptions as generation_errors
from app.services.image_pipeline import PROVIDERS, resolve_provider
from app.services.removebg import remove_background
from app.services.storage import (
    composite_product_on_background,
    delete_product_files,
    resolve_upload_path,
    save_generation_image,
    save_upload_image,
)
from app.services.styles import build_scene_prompt

ALLOWED_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def create_product_upload(
    db: Session,
    user: User,
    file_bytes: bytes,
    content_type: str,
) -> ProductImage:
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise ValueError(f"Unsupported file type: {content_type}")

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(file_bytes) > max_bytes:
        raise ValueError(f"File exceeds maximum size of {settings.MAX_UPLOAD_SIZE_MB}MB")

    extension = ALLOWED_CONTENT_TYPES[content_type]
    original_path = save_upload_image(file_bytes, user.id, extension)

    product = ProductImage(
        user_id=user.id,
        original_path=original_path,
        status="uploaded",
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


async def enhance_product_image(
    db: Session,
    user: User,
    product_id: int,
    style: str,
    scene_prompt: str | None,
    provider: str | None,
) -> ProductImage:
    product = get_user_product(db, user.id, product_id)
    if product is None:
        raise ValueError("Product image not found")

    if product.status == "processing":
        raise ValueError("Product enhancement is already in progress")

    selected_provider = resolve_provider(provider)
    product.status = "processing"
    product.style = style
    product.provider = selected_provider
    product.scene_prompt = scene_prompt.strip() if scene_prompt else None
    product.error_message = None
    db.commit()

    try:
        original_path = resolve_upload_path(product.original_path)
        original_bytes = original_path.read_bytes()

        cutout_bytes = await remove_background(original_bytes)
        scene = build_scene_prompt(style, scene_prompt)

        generate_fn = PROVIDERS[selected_provider]
        background_bytes = await generate_fn(scene)
        enhanced_bytes = composite_product_on_background(cutout_bytes, background_bytes)
        enhanced_path = save_generation_image(enhanced_bytes, user.id)

        product.enhanced_path = enhanced_path
        product.status = "completed"
        db.commit()
        db.refresh(product)
        return product
    except (generation_errors.ImageGenerationError, ValueError) as exc:
        product.status = "failed"
        product.error_message = str(exc)
        db.commit()
        db.refresh(product)
        raise


def list_user_products(db: Session, user_id: int) -> list[ProductImage]:
    return list(
        db.scalars(
            select(ProductImage)
            .where(ProductImage.user_id == user_id)
            .order_by(ProductImage.created_at.desc())
        )
    )


def get_user_product(db: Session, user_id: int, product_id: int) -> ProductImage | None:
    return db.scalar(
        select(ProductImage).where(
            ProductImage.id == product_id,
            ProductImage.user_id == user_id,
        )
    )


def delete_user_product(db: Session, user_id: int, product_id: int) -> bool:
    product = get_user_product(db, user_id, product_id)
    if product is None:
        return False

    delete_product_files(product.original_path, product.enhanced_path)
    db.delete(product)
    db.commit()
    return True
