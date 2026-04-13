from __future__ import annotations

from datetime import datetime

from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel


class Coupon(BaseModel):
    __tablename__ = "coupons"

    gym_id: Mapped[str] = mapped_column(String(36), ForeignKey("gyms.id"), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(String(500))
    discount_type: Mapped[str] = mapped_column(String(20), nullable=False)  # "percentage" | "fixed"
    discount_value: Mapped[float] = mapped_column(Float, nullable=False)
    min_price: Mapped[float | None] = mapped_column(Float)
    max_uses: Mapped[int | None] = mapped_column(Integer)
    used_count: Mapped[int] = mapped_column(Integer, server_default="0", nullable=False)
    valid_from: Mapped[datetime | None] = mapped_column()
    valid_until: Mapped[datetime | None] = mapped_column()
    is_active: Mapped[bool] = mapped_column(server_default="1", nullable=False)

    # relationships
    gym: Mapped["Gym"] = relationship(back_populates="coupons")  # noqa: F821
