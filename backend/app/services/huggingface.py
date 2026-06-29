import asyncio
import io

from huggingface_hub import InferenceClient
from huggingface_hub.utils import HfHubHTTPError

from app.core.config import settings
from app.services.exceptions import (
    ModelLoadingError,
    ProviderAPIError,
    ProviderConnectionError,
    ProviderNotConfiguredError,
)


def _image_to_bytes(image) -> bytes:
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def _generate_with_client(prompt: str) -> bytes:
    client = InferenceClient(
        api_key=settings.HUGGINGFACE_API_TOKEN,
        provider=settings.HUGGINGFACE_PROVIDER,
    )
    image = client.text_to_image(prompt, model=settings.HUGGINGFACE_MODEL_ID)
    return _image_to_bytes(image)


async def generate_image(prompt: str) -> bytes:
    if not settings.HUGGINGFACE_API_TOKEN:
        raise ProviderNotConfiguredError("Hugging Face API token is not configured")

    try:
        return await asyncio.to_thread(_generate_with_client, prompt)
    except HfHubHTTPError as exc:
        status_code = exc.response.status_code if exc.response is not None else None
        detail = str(exc)
        if status_code == 503:
            raise ModelLoadingError(detail or "Model is loading, please retry shortly") from exc
        raise ProviderAPIError(f"Hugging Face API error: {detail}") from exc
    except OSError as exc:
        raise ProviderConnectionError(
            "Unable to reach Hugging Face. Check your internet connection and try again."
        ) from exc
    except Exception as exc:
        message = str(exc)
        if "getaddrinfo failed" in message or "ConnectError" in message:
            raise ProviderConnectionError(
                "Unable to reach Hugging Face. Check your internet connection and try again."
            ) from exc
        raise ProviderAPIError(f"Hugging Face API error: {message}") from exc
