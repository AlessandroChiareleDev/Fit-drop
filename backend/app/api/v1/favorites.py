import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.favorite import Favorite
from app.schemas.favorite import FavoriteCreate, FavoriteRead

router = APIRouter(prefix="/favorites", tags=["favorites"])


@router.post("", response_model=FavoriteRead, status_code=201)
async def add_favorite(body: FavoriteCreate, db: AsyncSession = Depends(get_db)):
    # Check duplicate
    existing = await db.execute(
        select(Favorite).where(
            and_(
                Favorite.user_id == str(body.user_id),
                Favorite.target_type == body.target_type,
                Favorite.target_id == str(body.target_id),
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(409, "Already favorited")
    data = {k: str(v) if isinstance(v, uuid.UUID) else v for k, v in body.model_dump().items()}
    fav = Favorite(**data)
    db.add(fav)
    await db.flush()
    await db.refresh(fav)
    return fav


@router.get("", response_model=list[FavoriteRead])
async def list_favorites(
    user_id: uuid.UUID,
    target_type: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    q = select(Favorite).where(Favorite.user_id == str(user_id)).order_by(Favorite.created_at.desc())
    if target_type:
        q = q.where(Favorite.target_type == target_type)
    result = await db.execute(q)
    return result.scalars().all()


@router.delete("/{fav_id}", status_code=204)
async def remove_favorite(fav_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    fav = await db.get(Favorite, str(fav_id))
    if not fav:
        raise HTTPException(404, "Favorite not found")
    await db.delete(fav)
