import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.enums import PayoutStatus


class PayoutCreate(BaseModel):
    session_id: uuid.UUID
    trainer_id: uuid.UUID
    amount: float
    scheduled_date: date


class PayoutUpdateStatus(BaseModel):
    status: PayoutStatus
    approved_by: str | None = None


class PayoutRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    session_id: uuid.UUID
    trainer_id: uuid.UUID
    amount: float
    status: PayoutStatus
    scheduled_date: date
    paid_at: datetime | None
    approved_by: str | None
    created_at: datetime
    updated_at: datetime
