import uuid
from pathlib import Path

from app.core.config import settings


def ensure_storage_dirs() -> None:
    Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
    Path(settings.GENERATED_DIR).mkdir(parents=True, exist_ok=True)


def save_generation_image(image_bytes: bytes, user_id: int) -> str:
    ensure_storage_dirs()
    filename = f"{user_id}_{uuid.uuid4().hex}.png"
    path = Path(settings.GENERATED_DIR) / filename
    path.write_bytes(image_bytes)
    return str(path)


def resolve_image_path(image_path: str) -> Path:
    path = Path(image_path)
    if not path.is_absolute():
        path = Path(settings.GENERATED_DIR) / path.name
    return path.resolve()
