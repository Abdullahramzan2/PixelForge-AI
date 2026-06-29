from fastapi import APIRouter, UploadFile

router = APIRouter()


@router.post("/upload")
async def upload_product_image(file: UploadFile):
    """Upload a product photo for enhancement."""
    return {"message": "Not implemented", "filename": file.filename}


@router.post("/enhance")
async def enhance_product():
    """Enhance a product image with improved background and lighting."""
    return {"message": "Not implemented"}
