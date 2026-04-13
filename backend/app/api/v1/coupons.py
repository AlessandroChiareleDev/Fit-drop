import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.coupon import Coupon
from app.schemas.coupon import CouponCreate, CouponRead, CouponUpdate

router = APIRouter(prefix="/coupons", tags=["coupons"])


@router.post("", response_model=CouponRead, status_code=201)
async def create_coupon(body: CouponCreate, db: AsyncSession = Depends(get_db)):
    # Check unique code
    existing = await db.execute(select(Coupon).where(Coupon.code == body.code))
    if existing.scalar_one_or_none():
        raise HTTPException(409, "Coupon code already exists")
    data = {k: str(v) if isinstance(v, uuid.UUID) else v for k, v in body.model_dump().items()}
    coupon = Coupon(**data)
    db.add(coupon)
    await db.flush()
    await db.refresh(coupon)
    return coupon


@router.get("", response_model=list[CouponRead])
async def list_coupons(
    gym_id: uuid.UUID | None = None,
    active_only: bool = False,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    q = select(Coupon).order_by(Coupon.created_at.desc())
    if gym_id:
        q = q.where(Coupon.gym_id == str(gym_id))
    if active_only:
        q = q.where(Coupon.is_active == True)  # noqa: E712
    result = await db.execute(q.offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/{coupon_id}", response_model=CouponRead)
async def get_coupon(coupon_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    coupon = await db.get(Coupon, str(coupon_id))
    if not coupon:
        raise HTTPException(404, "Coupon not found")
    return coupon


@router.get("/code/{code}", response_model=CouponRead)
async def get_coupon_by_code(code: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Coupon).where(Coupon.code == code))
    coupon = result.scalar_one_or_none()
    if not coupon:
        raise HTTPException(404, "Coupon not found")
    return coupon


@router.put("/{coupon_id}", response_model=CouponRead)
async def update_coupon(coupon_id: uuid.UUID, body: CouponUpdate, db: AsyncSession = Depends(get_db)):
    coupon = await db.get(Coupon, str(coupon_id))
    if not coupon:
        raise HTTPException(404, "Coupon not found")
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(coupon, key, value)
    await db.flush()
    await db.refresh(coupon)
    return coupon


@router.delete("/{coupon_id}", status_code=204)
async def delete_coupon(coupon_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    coupon = await db.get(Coupon, str(coupon_id))
    if not coupon:
        raise HTTPException(404, "Coupon not found")
    await db.delete(coupon)
