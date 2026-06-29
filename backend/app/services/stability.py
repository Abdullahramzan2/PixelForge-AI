import httpx

from app.core.config import settings
from app.services.exceptions import ProviderAPIError, ProviderConnectionError, ProviderNotConfiguredError

STABILITY_URL = (
    "https://api.stability.ai/v1/generation/{engine_id}/text-to-image"
)


async def generate_image(prompt: str) -> bytes:
    if not settings.STABILITY_API_KEY:
        raise ProviderNotConfiguredError("Stability AI API key is not configured")

    url = STABILITY_URL.format(engine_id=settings.STABILITY_ENGINE_ID)
    headers = {
        "Authorization": f"Bearer {settings.STABILITY_API_KEY}",
        "Accept": "application/json",
    }
    payload = {
        "text_prompts": [{"text": prompt, "weight": 1}],
        "cfg_scale": 7,
        "height": 1024,
        "width": 1024,
        "samples": 1,
        "steps": 30,
    }

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(url, headers=headers, json=payload)
    except httpx.ConnectError as exc:
        raise ProviderConnectionError(
            "Unable to reach Stability AI. Check your internet connection and try again."
        ) from exc

    if response.status_code >= 400:
        detail = response.text
        try:
            detail = response.json().get("message", detail)
        except ValueError:
            pass
        raise ProviderAPIError(f"Stability AI API error: {detail}")

    data = response.json()
    artifacts = data.get("artifacts", [])
    if not artifacts:
        raise ProviderAPIError("Stability AI returned no image artifacts")

    import base64

    return base64.b64decode(artifacts[0]["base64"])
