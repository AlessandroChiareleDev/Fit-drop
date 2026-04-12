import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.enums import CrefStatus, TrainerOperationalStatus
from app.models.trainer import Trainer
from app.models.trainer_availability import TrainerAvailability
from app.schemas.trainer import (
    TrainerAvailabilityCreate,
    TrainerAvailabilityRead,
    TrainerCreate,
    TrainerRead,
    TrainerUpdate,
)

router = APIRouter(prefix="/trainers", tags=["trainers"])


@router.post("", response_model=TrainerRead, status_code=201)
async def create_trainer(body: TrainerCreate, db: AsyncSession = Depends(get_db)):
    trainer = Trainer(**body.model_dump())
    db.add(trainer)
    await db.flush()
    await db.refresh(trainer)
    return trainer


@router.get("", response_model=list[TrainerRead])
async def list_trainers(
    status: TrainerOperationalStatus | None = None,
    cref_status: CrefStatus | None = None,
    city: str | None = None,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    q = select(Trainer)
    if status:
        q = q.where(Trainer.operational_status == status)
    if cref_status:
        q = q.where(Trainer.cref_status == cref_status)
    if city:
        q = q.where(Trainer.city.ilike(f"%{city}%"))
    result = await db.execute(q.offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/{trainer_id}", response_model=TrainerRead)
async def get_trainer(trainer_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    trainer = await db.get(Trainer, trainer_id)
    if not trainer:
        raise HTTPException(404, "Trainer not found")
    return trainer


@router.patch("/{trainer_id}", response_model=TrainerRead)
async def update_trainer(
    trainer_id: uuid.UUID, body: TrainerUpdate, db: AsyncSession = Depends(get_db)
):
    trainer = await db.get(Trainer, trainer_id)
    if not trainer:
        raise HTTPException(404, "Trainer not found")

    data = body.model_dump(exclude_unset=True)

    # Side-effects on status changes
    if "cref_status" in data and data["cref_status"] == CrefStatus.VERIFIED:
        data["cref_verified_at"] = datetime.now(timezone.utc)
    if "operational_status" in data and data["operational_status"] == TrainerOperationalStatus.ACTIVE:
        if not trainer.activated_at:
            data["activated_at"] = datetime.now(timezone.utc)

    for field, value in data.items():
        setattr(trainer, field, value)
    await db.flush()
    await db.refresh(trainer)
    return trainer


# ── Availability sub-resource ─────────────────────────────────────


@router.post(
    "/{trainer_id}/availabilities",
    response_model=TrainerAvailabilityRead,
    status_code=201,
)
async def create_availability(
    trainer_id: uuid.UUID,
    body: TrainerAvailabilityCreate,
    db: AsyncSession = Depends(get_db),
):
    trainer = await db.get(Trainer, trainer_id)
    if not trainer:
        raise HTTPException(404, "Trainer not found")
    avail = TrainerAvailability(trainer_id=trainer_id, **body.model_dump())
    db.add(avail)
    await db.flush()
    await db.refresh(avail)
    return avail


@router.get(
    "/{trainer_id}/availabilities",
    response_model=list[TrainerAvailabilityRead],
)
async def list_availabilities(
    trainer_id: uuid.UUID, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(TrainerAvailability).where(
            TrainerAvailability.trainer_id == trainer_id
        )
    )
    return result.scalars().all()


@router.delete("/{trainer_id}/availabilities/{avail_id}", status_code=204)
async def delete_availability(
    trainer_id: uuid.UUID,
    avail_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    avail = await db.get(TrainerAvailability, avail_id)
    if not avail or avail.trainer_id != trainer_id:
        raise HTTPException(404, "Availability not found")
    await db.delete(avail)
