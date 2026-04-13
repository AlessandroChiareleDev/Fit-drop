from __future__ import annotations

import uuid
from datetime import date, time

from sqlalchemy import Date, ForeignKey, Integer, String, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.enums import RecurrenceType
from app.models.base import BaseModel


class TrainerAvailability(BaseModel):
    __tablename__ = "trainer_availabilities"

    trainer_id: Mapped[uuid.UUID] = mapped_column(
        String(36), ForeignKey("trainers.id"), nullable=False
    )
    day_of_week: Mapped[int] = mapped_column(
        Integer, nullable=False
    )  # 0=Mon … 6=Sun
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    recurrence_type: Mapped[RecurrenceType] = mapped_column(
        default=RecurrenceType.WEEKLY, nullable=False
    )
    valid_from: Mapped[date] = mapped_column(Date, nullable=False)
    valid_until: Mapped[date | None] = mapped_column(Date)

    # relationships
    trainer: Mapped["Trainer"] = relationship(back_populates="availabilities")  # noqa: F821
