from pathlib import Path
from typing import Annotated

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict
BACKEND_DIR = Path(__file__).resolve().parents[2]
PROJECT_ROOT = BACKEND_DIR.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(BACKEND_DIR / ".env", PROJECT_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "PixelForge AI"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "change-me"

    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    CORS_ORIGINS: Annotated[list[str], NoDecode] = ["http://localhost:3000"]

    POSTGRES_USER: str = "pixelforge"
    POSTGRES_PASSWORD: str = "pixelforge"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "pixelforge"
    DATABASE_URL: str = ""

    HUGGINGFACE_API_TOKEN: str = ""
    REPLICATE_API_TOKEN: str = ""
    STABILITY_API_KEY: str = ""
    REMOVEBG_API_KEY: str = ""

    DEFAULT_IMAGE_PROVIDER: str = "huggingface"

    UPLOAD_DIR: str = "./uploads"
    GENERATED_DIR: str = "./generated"
    MAX_UPLOAD_SIZE_MB: int = 10

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @property
    def database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )


settings = Settings()
