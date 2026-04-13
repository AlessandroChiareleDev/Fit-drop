import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.gym import Gym
from app.schemas.gym import GymCreate, GymRead, GymUpdate

router = APIRouter(prefix="/gyms", tags=["gyms"])


@router.post("", response_model=GymRead, status_code=201)
async def create_gym(body: GymCreate, db: AsyncSession = Depends(get_db)):
    data = {k: str(v) if isinstance(v, uuid.UUID) else v for k, v in body.model_dump().items()}
    gym = Gym(**data)
    db.add(gym)
    await db.flush()
    await db.refresh(gym)
    return gym


@router.get("", response_model=list[GymRead])
async def list_gyms(
    neighborhood: str | None = None,
    city: str | None = None,
    owner_id: uuid.UUID | None = None,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    q = select(Gym).order_by(Gym.name)
    if neighborhood:
        q = q.where(Gym.neighborhood == neighborhood)
    if city:
        q = q.where(Gym.city == city)
    if owner_id:
        q = q.where(Gym.owner_id == str(owner_id))
    result = await db.execute(q.offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/{gym_id}", response_model=GymRead)
async def get_gym(gym_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    gym = await db.get(Gym, str(gym_id))
    if not gym:
        raise HTTPException(404, "Gym not found")
    return gym


@router.put("/{gym_id}", response_model=GymRead)
async def update_gym(gym_id: uuid.UUID, body: GymUpdate, db: AsyncSession = Depends(get_db)):
    gym = await db.get(Gym, str(gym_id))
    if not gym:
        raise HTTPException(404, "Gym not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(gym, key, value)
    await db.flush()
    await db.refresh(gym)
    return gym


@router.delete("/{gym_id}", status_code=204)
async def delete_gym(gym_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    gym = await db.get(Gym, str(gym_id))
    if not gym:
        raise HTTPException(404, "Gym not found")
    await db.delete(gym)
