import io
import uuid
from pathlib import Path

from PIL import Image

from app.core.config import settings

ALLOWED_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


def ensure_storage_dirs() -> None:
    Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
    Path(settings.GENERATED_DIR).mkdir(parents=True, exist_ok=True)


def save_upload_image(file_bytes: bytes, user_id: int, extension: str) -> str:
    ensure_storage_dirs()
    filename = f"{user_id}_{uuid.uuid4().hex}{extension}"
    path = Path(settings.UPLOAD_DIR) / filename
    path.write_bytes(file_bytes)
    return str(path)


def save_generation_image(image_bytes: bytes, user_id: int) -> str:
    ensure_storage_dirs()
    filename = f"{user_id}_{uuid.uuid4().hex}.png"
    path = Path(settings.GENERATED_DIR) / filename
    path.write_bytes(image_bytes)
    return str(path)


def resolve_upload_path(image_path: str) -> Path:
    path = Path(image_path)
    if not path.is_absolute():
        path = Path(settings.UPLOAD_DIR) / path.name
    return path.resolve()


def resolve_image_path(image_path: str) -> Path:
    path = Path(image_path)
    if not path.is_absolute():
        path = Path(settings.GENERATED_DIR) / path.name
    return path.resolve()


def delete_generation_file(image_path: str) -> None:
    path = resolve_image_path(image_path)
    if path.is_file():
        path.unlink()


def delete_upload_file(image_path: str) -> None:
    path = resolve_upload_path(image_path)
    if path.is_file():
        path.unlink()


def delete_product_files(original_path: str, enhanced_path: str | None) -> None:
    delete_upload_file(original_path)
    if enhanced_path:
        delete_generation_file(enhanced_path)


def composite_product_on_background(cutout_bytes: bytes, background_bytes: bytes) -> bytes:
    background = Image.open(io.BytesIO(background_bytes)).convert("RGBA")
    product = Image.open(io.BytesIO(cutout_bytes)).convert("RGBA")

    max_width = int(background.width * 0.65)
    max_height = int(background.height * 0.65)
    product.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)

    x = (background.width - product.width) // 2
    y = (background.height - product.height) // 2 + int(background.height * 0.05)

    composed = background.copy()
    composed.paste(product, (x, y), product)

    buffer = io.BytesIO()
    composed.convert("RGB").save(buffer, format="PNG")
    return buffer.getvalue()
