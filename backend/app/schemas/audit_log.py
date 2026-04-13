import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class AuditLogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    actor_id: uuid.UUID
    actor_name: str
    action: str
    entity_type: str
    entity_id: uuid.UUID | None
    details: dict | None
    ip_address: str | None
    created_at: datetime
