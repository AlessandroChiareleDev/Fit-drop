import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import transition
from app.database import get_db
from app.enums import PayoutStatus
from app.models.payout import Payout
from app.schemas.payout import PayoutCreate, PayoutRead, PayoutUpdateStatus

router = APIRouter(prefix="/payouts", tags=["payouts"])


@router.post("", response_model=PayoutRead, status_code=201)
async def create_payout(body: PayoutCreate, db: AsyncSession = Depends(get_db)):
    payout = Payout(**body.model_dump())
    db.add(payout)
    await db.flush()
    await db.refresh(payout)
    return payout


@router.get("", response_model=list[PayoutRead])
async def list_payouts(
    status: PayoutStatus | None = None,
    trainer_id: uuid.UUID | None = None,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    q = select(Payout).order_by(Payout.scheduled_date.desc())
    if status:
        q = q.where(Payout.status == status)
    if trainer_id:
        q = q.where(Payout.trainer_id == trainer_id)
    result = await db.execute(q.offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/{payout_id}", response_model=PayoutRead)
async def get_payout(payout_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    payout = await db.get(Payout, payout_id)
    if not payout:
        raise HTTPException(404, "Payout not found")
    return payout


@router.patch("/{payout_id}/status", response_model=PayoutRead)
async def update_payout_status(
    payout_id: uuid.UUID,
    body: PayoutUpdateStatus,
    db: AsyncSession = Depends(get_db),
):
    payout = await db.get(Payout, payout_id)
    if not payout:
        raise HTTPException(404, "Payout not found")

    try:
        new_status = transition(payout.status, body.status)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc

    now = datetime.now(timezone.utc)
    payout.status = new_status

    if new_status == PayoutStatus.APPROVED and body.approved_by:
        payout.approved_by = body.approved_by
    elif new_status == PayoutStatus.PAID:
        payout.paid_at = now

    await db.flush()
    await db.refresh(payout)
    return payout
