from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.enums import PayoutStatus
from app.models.base import BaseModel


class Payout(BaseModel):
    __tablename__ = "payouts"

    session_id: Mapped[uuid.UUID] = mapped_column(
        String(36), ForeignKey("sessions.id"), nullable=False, unique=True
    )
    trainer_id: Mapped[uuid.UUID] = mapped_column(
        String(36), ForeignKey("trainers.id"), nullable=False
    )

    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[PayoutStatus] = mapped_column(
        default=PayoutStatus.PENDING, nullable=False
    )

    scheduled_date: Mapped[date] = mapped_column(Date, nullable=False)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    approved_by: Mapped[str | None] = mapped_column(String(200))

    # relationships
    session: Mapped["Session"] = relationship(back_populates="payout")  # noqa: F821
    trainer: Mapped["Trainer"] = relationship(back_populates="payouts")  # noqa: F821
