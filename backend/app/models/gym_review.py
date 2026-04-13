from __future__ import annotations

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class GymReview(BaseModel):
    __tablename__ = "gym_reviews"

    gym_id: Mapped[str] = mapped_column(String(36), ForeignKey("gyms.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    comment: Mapped[str | None] = mapped_column(String(2000))

    # relationships
    gym: Mapped["Gym"] = relationship(back_populates="gym_reviews")  # noqa: F821
