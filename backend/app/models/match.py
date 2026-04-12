from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Float, Integer, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.enums import MatchStatus
from app.models.base import BaseModel


class Match(BaseModel):
    __tablename__ = "matches"

    request_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("session_requests.id"), nullable=False
    )
    trainer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("trainers.id"), nullable=False
    )
    attempt_number: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    # scoring
    score: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    score_breakdown: Mapped[dict | None] = mapped_column(JSONB)

    # lifecycle
    status: Mapped[MatchStatus] = mapped_column(
        default=MatchStatus.CANDIDATE, nullable=False
    )
    offered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    responded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    response_deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # audit
    operated_by: Mapped[str | None] = mapped_column(String(200))

    # relationships
    session_request: Mapped["SessionRequest"] = relationship(back_populates="matches")  # noqa: F821
    trainer: Mapped["Trainer"] = relationship(back_populates="matches")  # noqa: F821
    session: Mapped["Session | None"] = relationship(back_populates="match", uselist=False)  # noqa: F821
