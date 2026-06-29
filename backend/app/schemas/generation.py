from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

StyleLiteral = Literal["luxury", "minimal", "outdoor"]
ProviderLiteral = Literal["huggingface", "stability"]


class TextToImageRequest(BaseModel):
    prompt: str = Field(..., min_length=3, max_length=2000)
    style: StyleLiteral | None = None
    provider: ProviderLiteral | None = None

    @field_validator("prompt")
    @classmethod
    def validate_prompt(cls, value: str) -> str:
        return value.strip()


class StylePresetResponse(BaseModel):
    id: str
    name: str
    description: str


class GenerationResponse(BaseModel):
    id: int
    prompt: str
    style: str | None
    provider: str
    image_url: str
    created_at: datetime

    model_config = {"from_attributes": True}


class GenerationListResponse(BaseModel):
    items: list[GenerationResponse]
    total: int
