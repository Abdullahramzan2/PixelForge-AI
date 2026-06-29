from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import generation, products, styles
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    description="Intelligent image generation and product enhancement API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generation.router, prefix="/api/v1/generation", tags=["generation"])
app.include_router(products.router, prefix="/api/v1/products", tags=["products"])
app.include_router(styles.router, prefix="/api/v1/styles", tags=["styles"])


@app.get("/health")
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
