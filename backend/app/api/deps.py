from fastapi import APIRouter

from app.db.session import get_db

router = APIRouter()
__all__ = ["router", "get_db"]
