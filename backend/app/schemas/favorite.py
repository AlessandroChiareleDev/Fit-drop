import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class FavoriteCreate(BaseModel):
    user_id: uuid.UUID
    target_type: str  # "trainer" | "gym"
    target_id: uuid.UUID


class FavoriteRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    target_type: str
    target_id: uuid.UUID
    created_at: datetime
