import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.gym_review import GymReview
from app.models.gym import Gym
from app.schemas.gym_review import GymReviewCreate, GymReviewRead

router = APIRouter(prefix="/gym-reviews", tags=["gym-reviews"])


@router.post("", response_model=GymReviewRead, status_code=201)
async def create_gym_review(body: GymReviewCreate, db: AsyncSession = Depends(get_db)):
    data = {k: str(v) if isinstance(v, uuid.UUID) else v for k, v in body.model_dump().items()}
    review = GymReview(**data)
    db.add(review)
    await db.flush()

    # Update gym avg_rating and total_reviews
    result = await db.execute(
        select(func.avg(GymReview.rating), func.count(GymReview.id))
        .where(GymReview.gym_id == str(body.gym_id))
    )
    avg, count = result.one()
    gym = await db.get(Gym, str(body.gym_id))
    if gym:
        gym.avg_rating = float(avg or 0)
        gym.total_reviews = count or 0

    await db.refresh(review)
    return review


@router.get("", response_model=list[GymReviewRead])
async def list_gym_reviews(
    gym_id: uuid.UUID | None = None,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    q = select(GymReview).order_by(GymReview.created_at.desc())
    if gym_id:
        q = q.where(GymReview.gym_id == str(gym_id))
    result = await db.execute(q.offset(skip).limit(limit))
    return result.scalars().all()
