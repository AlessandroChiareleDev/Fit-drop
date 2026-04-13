import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import transition
from app.database import get_db
from app.enums import PaymentStatus
from app.models.payment import Payment
from app.schemas.payment import PaymentCreate, PaymentRead, PaymentUpdateStatus

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("", response_model=PaymentRead, status_code=201)
async def create_payment(body: PaymentCreate, db: AsyncSession = Depends(get_db)):
    data = {k: str(v) if isinstance(v, uuid.UUID) else v for k, v in body.model_dump().items()}
    payment = Payment(**data)
    db.add(payment)
    await db.flush()
    await db.refresh(payment)
    return payment


@router.get("", response_model=list[PaymentRead])
async def list_payments(
    status: PaymentStatus | None = None,
    session_id: uuid.UUID | None = None,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    q = select(Payment).order_by(Payment.created_at.desc())
    if status:
        q = q.where(Payment.status == status)
    if session_id:
        q = q.where(Payment.session_id == str(session_id))
    result = await db.execute(q.offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/{payment_id}", response_model=PaymentRead)
async def get_payment(payment_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    payment = await db.get(Payment, str(payment_id))
    if not payment:
        raise HTTPException(404, "Payment not found")
    return payment


@router.patch("/{payment_id}/status", response_model=PaymentRead)
async def update_payment_status(
    payment_id: uuid.UUID,
    body: PaymentUpdateStatus,
    db: AsyncSession = Depends(get_db),
):
    payment = await db.get(Payment, str(payment_id))
    if not payment:
        raise HTTPException(404, "Payment not found")

    try:
        new_status = transition(payment.status, body.status)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc

    now = datetime.now(timezone.utc)
    payment.status = new_status

    if new_status == PaymentStatus.PAID:
        payment.paid_at = now
    elif new_status == PaymentStatus.FAILED:
        payment.failed_at = now
    elif new_status == PaymentStatus.REFUNDED:
        payment.refunded_at = now
        if body.refund_amount is not None:
            payment.refund_amount = body.refund_amount

    if body.external_reference:
        payment.external_reference = body.external_reference

    await db.flush()
    await db.refresh(payment)
    return payment
