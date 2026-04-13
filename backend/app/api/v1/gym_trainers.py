import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.gym_trainer import GymTrainer
from app.schemas.gym_trainer import GymTrainerCreate, GymTrainerRead

router = APIRouter(prefix="/gym-trainers", tags=["gym-trainers"])


@router.post("", response_model=GymTrainerRead, status_code=201)
async def create_link(body: GymTrainerCreate, db: AsyncSession = Depends(get_db)):
    # Check duplicate
    existing = await db.execute(
        select(GymTrainer)
        .where(GymTrainer.gym_id == str(body.gym_id))
        .where(GymTrainer.trainer_id == str(body.trainer_id))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(409, "Trainer already linked to this gym")
    data = {k: str(v) if isinstance(v, uuid.UUID) else v for k, v in body.model_dump().items()}
    link = GymTrainer(**data)
    db.add(link)
    await db.flush()
    await db.refresh(link)
    return link


@router.get("", response_model=list[GymTrainerRead])
async def list_links(
    gym_id: uuid.UUID | None = None,
    trainer_id: uuid.UUID | None = None,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    q = select(GymTrainer).order_by(GymTrainer.created_at.desc())
    if gym_id:
        q = q.where(GymTrainer.gym_id == str(gym_id))
    if trainer_id:
        q = q.where(GymTrainer.trainer_id == str(trainer_id))
    result = await db.execute(q.offset(skip).limit(limit))
    return result.scalars().all()


@router.delete("/{link_id}", status_code=204)
async def delete_link(link_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    link = await db.get(GymTrainer, str(link_id))
    if not link:
        raise HTTPException(404, "Link not found")
    await db.delete(link)
