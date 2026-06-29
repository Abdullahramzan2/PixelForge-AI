import asyncio

import httpx
import replicate as replicate_sdk  # pylint: disable=import-error

from app.core.config import settings
from app.services.exceptions import ProviderAPIError, ProviderConnectionError, ProviderNotConfiguredError


async def generate_image(prompt: str) -> bytes:
    if not settings.REPLICATE_API_TOKEN:
        raise ProviderNotConfiguredError("Replicate API token is not configured")

    try:
        output = await asyncio.to_thread(
            replicate_sdk.run,
            settings.REPLICATE_MODEL_ID,
            input={"prompt": prompt},
            api_token=settings.REPLICATE_API_TOKEN,
        )
    except Exception as exc:
        message = str(exc)
        if isinstance(exc, httpx.ConnectError) or "getaddrinfo failed" in message:
            raise ProviderConnectionError(
                "Unable to reach Replicate. Check your internet connection and try again."
            ) from exc
        raise ProviderAPIError(f"Replicate API error: {message}") from exc

    image_url = _extract_image_url(output)
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.get(image_url)
            response.raise_for_status()
            return response.content
    except httpx.ConnectError as exc:
        raise ProviderConnectionError(
            "Unable to download image from Replicate. Check your internet connection."
        ) from exc


def _extract_image_url(output: object) -> str:
    if isinstance(output, str):
        return output
    if isinstance(output, list) and output:
        first = output[0]
        if isinstance(first, str):
            return first
        if hasattr(first, "url"):
            return str(first.url)
    if hasattr(output, "url"):
        return str(output.url)
    raise ProviderAPIError("Unexpected response format from Replicate")
