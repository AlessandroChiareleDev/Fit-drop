from __future__ import annotations

import uuid
from datetime import date, datetime, time

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Text, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.enums import SessionStatus, VenueType
from app.models.base import BaseModel


class Session(BaseModel):
    __tablename__ = "sessions"

    request_id: Mapped[uuid.UUID] = mapped_column(
        String(36), ForeignKey("session_requests.id"), nullable=False, unique=True
    )
    match_id: Mapped[uuid.UUID] = mapped_column(
        String(36), ForeignKey("matches.id"), nullable=False, unique=True
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        String(36), ForeignKey("users.id"), nullable=False
    )
    trainer_id: Mapped[uuid.UUID] = mapped_column(
        String(36), ForeignKey("trainers.id"), nullable=False
    )

    # schedule
    scheduled_date: Mapped[date] = mapped_column(Date, nullable=False)
    scheduled_time_start: Mapped[time] = mapped_column(Time, nullable=False)
    scheduled_time_end: Mapped[time] = mapped_column(Time, nullable=False)

    # venue (flat fields, not separate entity in Phase 0/1)
    venue_type: Mapped[VenueType] = mapped_column(nullable=False)
    venue_name: Mapped[str | None] = mapped_column(String(200))
    venue_address: Mapped[str | None] = mapped_column(String(500))
    venue_notes: Mapped[str | None] = mapped_column(Text)

    # financial
    gross_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    platform_fee_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    convenience_fee_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    trainer_payout_amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    # lifecycle
    status: Mapped[SessionStatus] = mapped_column(
        default=SessionStatus.CONFIRMED, nullable=False
    )
    checked_in_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    cancellation_reason: Mapped[str | None] = mapped_column(String(500))
    cancelled_by: Mapped[str | None] = mapped_column(String(50))

    # relationships
    session_request: Mapped["SessionRequest"] = relationship(back_populates="session")  # noqa: F821
    match: Mapped["Match"] = relationship(back_populates="session")  # noqa: F821
    user: Mapped["User"] = relationship(back_populates="sessions")  # noqa: F821
    trainer: Mapped["Trainer"] = relationship(back_populates="sessions")  # noqa: F821
    payment: Mapped["Payment | None"] = relationship(back_populates="session", uselist=False)  # noqa: F821
    payout: Mapped["Payout | None"] = relationship(back_populates="session", uselist=False)  # noqa: F821
    review: Mapped["Review | None"] = relationship(back_populates="session", uselist=False)  # noqa: F821
    incidents: Mapped[list["Incident"]] = relationship(back_populates="session")  # noqa: F821
