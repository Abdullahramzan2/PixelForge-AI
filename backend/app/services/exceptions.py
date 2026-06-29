class ImageGenerationError(Exception):
    """Base error for image generation failures."""


class ProviderNotConfiguredError(ImageGenerationError):
    """Raised when the selected provider has no API key configured."""


class ModelLoadingError(ImageGenerationError):
    """Raised when an external model is still loading."""


class ProviderAPIError(ImageGenerationError):
    """Raised when an external provider returns an error."""


class ProviderConnectionError(ImageGenerationError):
    """Raised when the provider cannot be reached."""
