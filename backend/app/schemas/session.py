import uuid
from datetime import date, datetime, time

from pydantic import BaseModel, ConfigDict

from app.enums import SessionStatus, VenueType


class SessionCreate(BaseModel):
    """Created internally when payment is confirmed — not directly by API user."""

    request_id: uuid.UUID
    match_id: uuid.UUID
    user_id: uuid.UUID
    trainer_id: uuid.UUID
    scheduled_date: date
    scheduled_time_start: time
    scheduled_time_end: time
    venue_type: VenueType
    venue_name: str | None = None
    venue_address: str | None = None
    venue_notes: str | None = None
    gross_amount: float
    platform_fee_amount: float
    convenience_fee_amount: float
    trainer_payout_amount: float


class SessionUpdateStatus(BaseModel):
    status: SessionStatus
    cancellation_reason: str | None = None
    cancelled_by: str | None = None


class SessionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    request_id: uuid.UUID
    match_id: uuid.UUID
    user_id: uuid.UUID
    trainer_id: uuid.UUID
    scheduled_date: date
    scheduled_time_start: time
    scheduled_time_end: time
    venue_type: VenueType
    venue_name: str | None
    venue_address: str | None
    venue_notes: str | None
    gross_amount: float
    platform_fee_amount: float
    convenience_fee_amount: float
    trainer_payout_amount: float
    status: SessionStatus
    checked_in_at: datetime | None
    started_at: datetime | None
    completed_at: datetime | None
    cancelled_at: datetime | None
    cancellation_reason: str | None
    cancelled_by: str | None
    created_at: datetime
    updated_at: datetime
