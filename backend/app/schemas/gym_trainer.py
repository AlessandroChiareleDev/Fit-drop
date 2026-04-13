import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class GymTrainerCreate(BaseModel):
    gym_id: uuid.UUID
    trainer_id: uuid.UUID
    status: str = "active"
    notes: str | None = None


class GymTrainerRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    gym_id: uuid.UUID
    trainer_id: uuid.UUID
    status: str
    notes: str | None
    created_at: datetime
    updated_at: datetime
