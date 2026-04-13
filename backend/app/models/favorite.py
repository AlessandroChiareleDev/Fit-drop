from __future__ import annotations

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel


class Favorite(BaseModel):
    __tablename__ = "favorites"

    user_id: Mapped[str] = mapped_column(String(36), nullable=False)
    target_type: Mapped[str] = mapped_column(String(20), nullable=False)  # "trainer" | "gym"
    target_id: Mapped[str] = mapped_column(String(36), nullable=False)
