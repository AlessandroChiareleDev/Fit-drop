from __future__ import annotations

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.enums import UserRole
from app.models.base import BaseModel


class User(BaseModel):
    __tablename__ = "users"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)
    email: Mapped[str | None] = mapped_column(String(254))
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    neighborhood: Mapped[str | None] = mapped_column(String(100))
    role: Mapped[str] = mapped_column(String(20), nullable=False, default=UserRole.STUDENT.value)
    password_hash: Mapped[str | None] = mapped_column(String(200))
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    trainer_id: Mapped[str | None] = mapped_column(String(36))

    # relationships
    session_requests: Mapped[list["SessionRequest"]] = relationship(back_populates="user")  # noqa: F821
    sessions: Mapped[list["Session"]] = relationship(back_populates="user")  # noqa: F821
    payments: Mapped[list["Payment"]] = relationship(back_populates="user")  # noqa: F821
    reviews: Mapped[list["Review"]] = relationship(back_populates="user")  # noqa: F821
