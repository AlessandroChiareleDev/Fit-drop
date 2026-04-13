from __future__ import annotations

from datetime import datetime

from sqlalchemy import Float, Integer, JSON, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.enums import CrefStatus, TrainerOperationalStatus
from app.models.base import BaseModel


class Trainer(BaseModel):
    __tablename__ = "trainers"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)
    email: Mapped[str | None] = mapped_column(String(254))

    # CREF verification
    cref_number: Mapped[str] = mapped_column(String(30), nullable=False, unique=True)
    cref_status: Mapped[CrefStatus] = mapped_column(
        default=CrefStatus.PENDING, nullable=False
    )
    cref_verified_at: Mapped[datetime | None] = mapped_column()

    # profile
    bio: Mapped[str | None] = mapped_column(String(1000))
    specialties: Mapped[list] = mapped_column(JSON, server_default="[]", nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    coverage_neighborhoods: Mapped[list] = mapped_column(
        JSON, server_default="[]", nullable=False
    )
    max_travel_radius_km: Mapped[float | None] = mapped_column(Float)

    # financial
    base_price_per_session: Mapped[float] = mapped_column(
        Numeric(10, 2), nullable=False
    )

    # operational
    operational_status: Mapped[TrainerOperationalStatus] = mapped_column(
        default=TrainerOperationalStatus.PENDING_REVIEW, nullable=False
    )

    # aggregated metrics (updated after each session)
    avg_rating: Mapped[float] = mapped_column(Float, server_default="0", nullable=False)
    acceptance_rate: Mapped[float] = mapped_column(Float, server_default="1", nullable=False)
    attendance_rate: Mapped[float] = mapped_column(Float, server_default="1", nullable=False)
    total_sessions: Mapped[int] = mapped_column(Integer, server_default="0", nullable=False)

    activated_at: Mapped[datetime | None] = mapped_column()

    # relationships
    availabilities: Mapped[list["TrainerAvailability"]] = relationship(back_populates="trainer")  # noqa: F821
    matches: Mapped[list["Match"]] = relationship(back_populates="trainer")  # noqa: F821
    sessions: Mapped[list["Session"]] = relationship(back_populates="trainer")  # noqa: F821
    payouts: Mapped[list["Payout"]] = relationship(back_populates="trainer")  # noqa: F821
    reviews: Mapped[list["Review"]] = relationship(back_populates="trainer")  # noqa: F821
