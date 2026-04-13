import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import transition
from app.database import get_db
from app.enums import SessionStatus
from app.models.session import Session
from app.schemas.session import SessionCreate, SessionRead, SessionUpdateStatus

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("", response_model=SessionRead, status_code=201)
async def create_session(body: SessionCreate, db: AsyncSession = Depends(get_db)):
    data = {k: str(v) if isinstance(v, uuid.UUID) else v for k, v in body.model_dump().items()}
    session = Session(**data)
    db.add(session)
    await db.flush()
    await db.refresh(session)
    return session


@router.get("", response_model=list[SessionRead])
async def list_sessions(
    status: SessionStatus | None = None,
    trainer_id: uuid.UUID | None = None,
    user_id: uuid.UUID | None = None,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    q = select(Session).order_by(Session.scheduled_date.desc())
    if status:
        q = q.where(Session.status == status)
    if trainer_id:
        q = q.where(Session.trainer_id == str(trainer_id))
    if user_id:
        q = q.where(Session.user_id == str(user_id))
    result = await db.execute(q.offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/{session_id}", response_model=SessionRead)
async def get_session(session_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    session = await db.get(Session, str(session_id))
    if not session:
        raise HTTPException(404, "Session not found")
    return session


@router.patch("/{session_id}/status", response_model=SessionRead)
async def update_session_status(
    session_id: uuid.UUID,
    body: SessionUpdateStatus,
    db: AsyncSession = Depends(get_db),
):
    session = await db.get(Session, str(session_id))
    if not session:
        raise HTTPException(404, "Session not found")

    try:
        new_status = transition(session.status, body.status)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc

    now = datetime.now(timezone.utc)
    session.status = new_status

    if new_status == SessionStatus.IN_PROGRESS:
        session.started_at = now
    elif new_status == SessionStatus.COMPLETED:
        session.completed_at = now
    elif new_status == SessionStatus.CANCELLED:
        session.cancelled_at = now
        session.cancellation_reason = body.cancellation_reason
        session.cancelled_by = body.cancelled_by

    await db.flush()
    await db.refresh(session)
    return session
