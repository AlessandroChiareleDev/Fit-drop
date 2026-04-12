from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.enums import IncidentImpact, IncidentStatus, IncidentType
from app.models.base import BaseModel


class Incident(BaseModel):
    __tablename__ = "incidents"

    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sessions.id"), nullable=False
    )

    reported_by: Mapped[str] = mapped_column(String(200), nullable=False)
    type: Mapped[IncidentType] = mapped_column(nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    resolution: Mapped[str | None] = mapped_column(Text)

    status: Mapped[IncidentStatus] = mapped_column(
        default=IncidentStatus.OPEN, nullable=False
    )
    impact_on_trainer: Mapped[IncidentImpact] = mapped_column(
        default=IncidentImpact.NONE, nullable=False
    )

    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # relationships
    session: Mapped["Session"] = relationship(back_populates="incidents")  # noqa: F821
