from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, generation
from app.core.config import settings
from app.services.storage import ensure_storage_dirs


@asynccontextmanager
async def lifespan(_: FastAPI):
    ensure_storage_dirs()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    description="PixelForge AI — image generation and authentication API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(generation.router, prefix="/api/v1/generation", tags=["generation"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
