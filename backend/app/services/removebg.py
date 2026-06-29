import httpx

from app.core.config import settings
from app.services.exceptions import (
    BackgroundRemovalError,
    ProviderConnectionError,
    ProviderNotConfiguredError,
)

REMOVEBG_URL = "https://api.remove.bg/v1.0/removebg"


async def remove_background(image_bytes: bytes) -> bytes:
    if not settings.REMOVEBG_API_KEY:
        raise ProviderNotConfiguredError("remove.bg API key is not configured")

    headers = {"X-Api-Key": settings.REMOVEBG_API_KEY}
    files = {"image_file": ("product.png", image_bytes, "image/png")}
    data = {"size": "auto", "format": "png"}

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(REMOVEBG_URL, headers=headers, files=files, data=data)
    except httpx.ConnectError as exc:
        raise ProviderConnectionError(
            "Unable to reach remove.bg. Check your internet connection and try again."
        ) from exc

    if response.status_code >= 400:
        detail = response.text
        try:
            detail = response.json().get("errors", [{}])[0].get("title", detail)
        except (ValueError, IndexError, AttributeError):
            pass
        raise BackgroundRemovalError(f"remove.bg error: {detail}")

    return response.content
