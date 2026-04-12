import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.enums import PaymentMethod, PaymentStatus


class PaymentCreate(BaseModel):
    session_id: uuid.UUID
    user_id: uuid.UUID
    amount: float
    method: PaymentMethod
    external_reference: str | None = None


class PaymentUpdateStatus(BaseModel):
    status: PaymentStatus
    external_reference: str | None = None
    refund_amount: float | None = None


class PaymentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    session_id: uuid.UUID
    user_id: uuid.UUID
    amount: float
    method: PaymentMethod
    status: PaymentStatus
    external_reference: str | None
    paid_at: datetime | None
    failed_at: datetime | None
    refunded_at: datetime | None
    refund_amount: float | None
    created_at: datetime
    updated_at: datetime
