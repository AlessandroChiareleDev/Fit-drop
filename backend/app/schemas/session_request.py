import uuid
from datetime import date, datetime, time

from pydantic import BaseModel, ConfigDict

from app.enums import (
    LeadSource,
    Modality,
    SessionRequestStatus,
    Urgency,
    VenueType,
)


class SessionRequestCreate(BaseModel):
    user_id: uuid.UUID
    requested_date: date
    requested_time_start: time
    requested_time_end: time
    neighborhood: str
    venue_type: VenueType
    venue_details: str | None = None
    modality: Modality
    urgency: Urgency = Urgency.STANDARD
    notes: str | None = None
    lead_source: LeadSource
    lead_channel: str | None = None


class SessionRequestUpdateStatus(BaseModel):
    status: SessionRequestStatus
    cancellation_reason: str | None = None


class SessionRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    requested_date: date
    requested_time_start: time
    requested_time_end: time
    neighborhood: str
    venue_type: VenueType
    venue_details: str | None
    modality: Modality
    urgency: Urgency
    notes: str | None
    lead_source: LeadSource
    lead_channel: str | None
    status: SessionRequestStatus
    matched_at: datetime | None
    confirmed_at: datetime | None
    completed_at: datetime | None
    cancelled_at: datetime | None
    cancellation_reason: str | None
    created_at: datetime
    updated_at: datetime
