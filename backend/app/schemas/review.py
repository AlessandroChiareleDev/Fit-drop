import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
    session_id: uuid.UUID
    user_id: uuid.UUID
    trainer_id: uuid.UUID
    rating: int = Field(ge=1, le=5)
    comment: str | None = None
    experience_tags: list[str] = []


class ReviewRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    session_id: uuid.UUID
    user_id: uuid.UUID
    trainer_id: uuid.UUID
    rating: int
    comment: str | None
    experience_tags: list[str]
    created_at: datetime
