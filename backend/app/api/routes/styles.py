from fastapi import APIRouter

router = APIRouter()

STYLE_PRESETS = [
    {"id": "luxury", "name": "Luxury", "description": "Premium, high-end aesthetic"},
    {"id": "minimal", "name": "Minimal", "description": "Clean, simple, modern look"},
    {"id": "outdoor", "name": "Outdoor", "description": "Natural, lifestyle outdoor setting"},
]


@router.get("/")
async def list_styles():
    """Return available style presets."""
    return {"styles": STYLE_PRESETS}
