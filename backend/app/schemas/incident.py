import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.enums import IncidentImpact, IncidentStatus, IncidentType


class IncidentCreate(BaseModel):
    session_id: uuid.UUID
    reported_by: str
    type: IncidentType
    description: str


class IncidentUpdate(BaseModel):
    status: IncidentStatus | None = None
    resolution: str | None = None
    impact_on_trainer: IncidentImpact | None = None


class IncidentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    session_id: uuid.UUID
    reported_by: str
    type: IncidentType
    description: str
    resolution: str | None
    status: IncidentStatus
    impact_on_trainer: IncidentImpact
    resolved_at: datetime | None
    created_at: datetime
    updated_at: datetime
