from __future__ import annotations

import uuid
from datetime import date, datetime, time

from sqlalchemy import Date, DateTime, ForeignKey, String, Text, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.enums import (
    LeadSource,
    Modality,
    SessionRequestStatus,
    Urgency,
    VenueType,
)
from app.models.base import BaseModel


class SessionRequest(BaseModel):
    __tablename__ = "session_requests"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )

    # when / where / what
    requested_date: Mapped[date] = mapped_column(Date, nullable=False)
    requested_time_start: Mapped[time] = mapped_column(Time, nullable=False)
    requested_time_end: Mapped[time] = mapped_column(Time, nullable=False)
    neighborhood: Mapped[str] = mapped_column(String(100), nullable=False)
    venue_type: Mapped[VenueType] = mapped_column(nullable=False)
    venue_details: Mapped[str | None] = mapped_column(Text)
    modality: Mapped[Modality] = mapped_column(nullable=False)
    urgency: Mapped[Urgency] = mapped_column(default=Urgency.STANDARD, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text)

    # acquisition
    lead_source: Mapped[LeadSource] = mapped_column(nullable=False)
    lead_channel: Mapped[str | None] = mapped_column(String(100))

    # lifecycle
    status: Mapped[SessionRequestStatus] = mapped_column(
        default=SessionRequestStatus.SUBMITTED, nullable=False
    )
    matched_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    cancellation_reason: Mapped[str | None] = mapped_column(String(500))

    # relationships
    user: Mapped["User"] = relationship(back_populates="session_requests")  # noqa: F821
    matches: Mapped[list["Match"]] = relationship(back_populates="session_request")  # noqa: F821
    session: Mapped["Session | None"] = relationship(back_populates="session_request", uselist=False)  # noqa: F821
