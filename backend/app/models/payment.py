from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.enums import PaymentMethod, PaymentStatus
from app.models.base import BaseModel


class Payment(BaseModel):
    __tablename__ = "payments"

    session_id: Mapped[uuid.UUID] = mapped_column(
        String(36), ForeignKey("sessions.id"), nullable=False, unique=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )

    amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    method: Mapped[PaymentMethod] = mapped_column(nullable=False)

    status: Mapped[PaymentStatus] = mapped_column(
        default=PaymentStatus.PENDING, nullable=False
    )
    external_reference: Mapped[str | None] = mapped_column(String(500))

    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    failed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    refunded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    refund_amount: Mapped[Decimal | None] = mapped_column(Numeric(10, 2))

    # relationships
    session: Mapped["Session"] = relationship(back_populates="payment")  # noqa: F821
    user: Mapped["User"] = relationship(back_populates="payments")  # noqa: F821
