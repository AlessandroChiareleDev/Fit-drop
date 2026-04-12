import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewRead

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("", response_model=ReviewRead, status_code=201)
async def create_review(body: ReviewCreate, db: AsyncSession = Depends(get_db)):
    # Enforce one review per session
    existing = await db.execute(
        select(Review).where(Review.session_id == body.session_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(409, "Review already exists for this session")

    review = Review(**body.model_dump())
    db.add(review)
    await db.flush()
    await db.refresh(review)
    return review


@router.get("", response_model=list[ReviewRead])
async def list_reviews(
    trainer_id: uuid.UUID | None = None,
    user_id: uuid.UUID | None = None,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    q = select(Review).order_by(Review.created_at.desc())
    if trainer_id:
        q = q.where(Review.trainer_id == trainer_id)
    if user_id:
        q = q.where(Review.user_id == user_id)
    result = await db.execute(q.offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/{review_id}", response_model=ReviewRead)
async def get_review(review_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    review = await db.get(Review, review_id)
    if not review:
        raise HTTPException(404, "Review not found")
    return review
