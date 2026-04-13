from __future__ import annotations

from sqlalchemy import Float, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Gym(BaseModel):
    __tablename__ = "gyms"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    owner_id: Mapped[str] = mapped_column(String(36), nullable=False)
    cnpj: Mapped[str | None] = mapped_column(String(18))
    phone: Mapped[str | None] = mapped_column(String(20))
    email: Mapped[str | None] = mapped_column(String(254))
    description: Mapped[str | None] = mapped_column(String(2000))

    # location
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    neighborhood: Mapped[str] = mapped_column(String(100), nullable=False)
    address: Mapped[str | None] = mapped_column(String(500))
    lat: Mapped[float | None] = mapped_column(Float)
    lng: Mapped[float | None] = mapped_column(Float)

    # media
    photo_url: Mapped[str | None] = mapped_column(String(500))
    photos: Mapped[list] = mapped_column(JSON, server_default="[]", nullable=False)

    # operational
    operating_hours: Mapped[dict] = mapped_column(JSON, server_default="{}", nullable=False)
    amenities: Mapped[list] = mapped_column(JSON, server_default="[]", nullable=False)
    gym_type: Mapped[str] = mapped_column(String(30), server_default="gym", nullable=False)

    # metrics
    avg_rating: Mapped[float] = mapped_column(Float, server_default="0", nullable=False)
    total_reviews: Mapped[int] = mapped_column(Integer, server_default="0", nullable=False)

    # relationships
    coupons: Mapped[list["Coupon"]] = relationship(back_populates="gym")  # noqa: F821
    gym_trainers: Mapped[list["GymTrainer"]] = relationship(back_populates="gym")  # noqa: F821
    gym_reviews: Mapped[list["GymReview"]] = relationship(back_populates="gym")  # noqa: F821
