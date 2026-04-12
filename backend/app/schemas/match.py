import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.enums import MatchStatus


class MatchCreate(BaseModel):
    request_id: uuid.UUID
    trainer_id: uuid.UUID
    attempt_number: int = 1
    score: float = 0
    score_breakdown: dict | None = None
    operated_by: str | None = None


class MatchUpdateStatus(BaseModel):
    status: MatchStatus


class MatchRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    request_id: uuid.UUID
    trainer_id: uuid.UUID
    attempt_number: int
    score: float
    score_breakdown: dict | None
    status: MatchStatus
    offered_at: datetime | None
    responded_at: datetime | None
    response_deadline: datetime | None
    operated_by: str | None
    created_at: datetime
    updated_at: datetime
