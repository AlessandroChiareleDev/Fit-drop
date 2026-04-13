from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Review(BaseModel):
    __tablename__ = "reviews"

    session_id: Mapped[uuid.UUID] = mapped_column(
        String(36), ForeignKey("sessions.id"), nullable=False, unique=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )
    trainer_id: Mapped[uuid.UUID] = mapped_column(
        String(36), ForeignKey("trainers.id"), nullable=False
    )

    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5
    comment: Mapped[str | None] = mapped_column(Text)
    experience_tags: Mapped[list] = mapped_column(
        JSON, server_default="[]", nullable=False
    )

    # relationships
    session: Mapped["Session"] = relationship(back_populates="review")  # noqa: F821
    user: Mapped["User"] = relationship(back_populates="reviews")  # noqa: F821
    trainer: Mapped["Trainer"] = relationship(back_populates="reviews")  # noqa: F821
