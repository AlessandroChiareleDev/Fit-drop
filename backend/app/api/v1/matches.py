import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core import transition
from app.database import get_db
from app.enums import MatchStatus
from app.models.match import Match
from app.schemas.match import MatchCreate, MatchRead, MatchUpdateStatus

router = APIRouter(prefix="/matches", tags=["matches"])


@router.post("", response_model=MatchRead, status_code=201)
async def create_match(body: MatchCreate, db: AsyncSession = Depends(get_db)):
    match = Match(**body.model_dump())
    db.add(match)
    await db.flush()
    await db.refresh(match)
    return match


@router.get("", response_model=list[MatchRead])
async def list_matches(
    request_id: uuid.UUID | None = None,
    status: MatchStatus | None = None,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    q = select(Match).order_by(Match.created_at.desc())
    if request_id:
        q = q.where(Match.request_id == request_id)
    if status:
        q = q.where(Match.status == status)
    result = await db.execute(q.offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/{match_id}", response_model=MatchRead)
async def get_match(match_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    match = await db.get(Match, match_id)
    if not match:
        raise HTTPException(404, "Match not found")
    return match


@router.patch("/{match_id}/status", response_model=MatchRead)
async def update_match_status(
    match_id: uuid.UUID,
    body: MatchUpdateStatus,
    db: AsyncSession = Depends(get_db),
):
    match = await db.get(Match, match_id)
    if not match:
        raise HTTPException(404, "Match not found")

    try:
        new_status = transition(match.status, body.status)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc

    now = datetime.now(timezone.utc)
    match.status = new_status

    if new_status == MatchStatus.OFFERED:
        match.offered_at = now
        match.response_deadline = now + timedelta(
            minutes=settings.TRAINER_RESPONSE_DEADLINE_MINUTES
        )
    elif new_status in (MatchStatus.ACCEPTED, MatchStatus.DECLINED):
        match.responded_at = now

    await db.flush()
    await db.refresh(match)
    return match
