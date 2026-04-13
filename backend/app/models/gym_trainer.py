from __future__ import annotations

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class GymTrainer(BaseModel):
    """Association between a gym and a trainer — represents partnership."""
    __tablename__ = "gym_trainers"

    gym_id: Mapped[str] = mapped_column(String(36), ForeignKey("gyms.id"), nullable=False)
    trainer_id: Mapped[str] = mapped_column(String(36), ForeignKey("trainers.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), server_default="active", nullable=False)  # active | pending | removed
    notes: Mapped[str | None] = mapped_column(String(500))

    # relationships
    gym: Mapped["Gym"] = relationship(back_populates="gym_trainers")  # noqa: F821
    trainer: Mapped["Trainer"] = relationship()  # noqa: F821
