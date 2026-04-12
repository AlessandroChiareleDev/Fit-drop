import uuid
from datetime import date, datetime, time

from pydantic import BaseModel, ConfigDict

from app.enums import CrefStatus, RecurrenceType, TrainerOperationalStatus


class TrainerCreate(BaseModel):
    name: str
    phone: str
    email: str | None = None
    cref_number: str
    bio: str | None = None
    specialties: list[str] = []
    city: str
    coverage_neighborhoods: list[str] = []
    max_travel_radius_km: float | None = None
    base_price_per_session: float


class TrainerUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    email: str | None = None
    bio: str | None = None
    specialties: list[str] | None = None
    city: str | None = None
    coverage_neighborhoods: list[str] | None = None
    max_travel_radius_km: float | None = None
    base_price_per_session: float | None = None
    cref_status: CrefStatus | None = None
    operational_status: TrainerOperationalStatus | None = None


class TrainerRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    phone: str
    email: str | None
    cref_number: str
    cref_status: CrefStatus
    cref_verified_at: datetime | None
    bio: str | None
    specialties: list[str]
    city: str
    coverage_neighborhoods: list[str]
    max_travel_radius_km: float | None
    base_price_per_session: float
    operational_status: TrainerOperationalStatus
    avg_rating: float
    acceptance_rate: float
    attendance_rate: float
    total_sessions: int
    activated_at: datetime | None
    created_at: datetime
    updated_at: datetime


# ── Availability ──────────────────────────────────────────────────


class TrainerAvailabilityCreate(BaseModel):
    day_of_week: int  # 0-6
    start_time: time
    end_time: time
    recurrence_type: RecurrenceType = RecurrenceType.WEEKLY
    valid_from: date
    valid_until: date | None = None


class TrainerAvailabilityRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    trainer_id: uuid.UUID
    day_of_week: int
    start_time: time
    end_time: time
    recurrence_type: RecurrenceType
    valid_from: date
    valid_until: date | None
    created_at: datetime
