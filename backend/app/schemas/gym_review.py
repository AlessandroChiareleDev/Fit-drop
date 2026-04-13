import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class GymReviewCreate(BaseModel):
    gym_id: uuid.UUID
    user_id: uuid.UUID
    rating: int = Field(ge=1, le=5)
    comment: str | None = None


class GymReviewRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    gym_id: uuid.UUID
    user_id: uuid.UUID
    rating: int
    comment: str | None
    created_at: datetime
