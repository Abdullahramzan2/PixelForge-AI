from datetime import datetime

from pydantic import BaseModel, Field, field_validator

from app.schemas.generation import ProviderLiteral, StyleLiteral


class EnhanceProductRequest(BaseModel):
    product_id: int = Field(..., gt=0)
    style: StyleLiteral
    scene_prompt: str | None = Field(
        None,
        max_length=500,
        description="Optional description of the desired background scene",
    )
    provider: ProviderLiteral | None = None

    @field_validator("scene_prompt")
    @classmethod
    def validate_scene_prompt(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip()
        return stripped or None


class ProductImageResponse(BaseModel):
    id: int
    status: str
    style: str | None
    provider: str | None
    scene_prompt: str | None
    error_message: str | None
    original_url: str
    enhanced_url: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ProductImageListResponse(BaseModel):
    items: list[ProductImageResponse]
    total: int
