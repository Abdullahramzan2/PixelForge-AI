from fastapi import APIRouter

router = APIRouter()


@router.post("/text-to-image")
async def text_to_image():
    """Generate an image from a text prompt."""
    return {"message": "Not implemented"}


@router.get("/history")
async def generation_history():
    """List past generations for the current user."""
    return {"items": []}
