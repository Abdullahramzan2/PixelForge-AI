from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.db.models.user import User


class Generation(Base):
    __tablename__ = "generations"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    prompt: Mapped[str] = mapped_column(Text)
    style: Mapped[str | None] = mapped_column(String(50))
    provider: Mapped[str] = mapped_column(String(50))
    image_path: Mapped[str] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()")
    )

    user: Mapped["User"] = relationship(back_populates="generations")
