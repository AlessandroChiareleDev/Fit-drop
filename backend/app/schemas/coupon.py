import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CouponCreate(BaseModel):
    gym_id: uuid.UUID
    code: str
    description: str | None = None
    discount_type: str = "percentage"
    discount_value: float = Field(gt=0)
    min_price: float | None = None
    max_uses: int | None = None
    valid_from: datetime | None = None
    valid_until: datetime | None = None
    is_active: bool = True


class CouponUpdate(BaseModel):
    description: str | None = None
    discount_type: str | None = None
    discount_value: float | None = None
    min_price: float | None = None
    max_uses: int | None = None
    valid_from: datetime | None = None
    valid_until: datetime | None = None
    is_active: bool | None = None


class CouponRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    gym_id: uuid.UUID
    code: str
    description: str | None
    discount_type: str
    discount_value: float
    min_price: float | None
    max_uses: int | None
    used_count: int
    valid_from: datetime | None
    valid_until: datetime | None
    is_active: bool
    created_at: datetime
    updated_at: datetime
