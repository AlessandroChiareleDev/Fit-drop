import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import transition
from app.database import get_db
from app.enums import SessionRequestStatus
from app.models.session_request import SessionRequest
from app.schemas.session_request import (
    SessionRequestCreate,
    SessionRequestRead,
    SessionRequestUpdateStatus,
)

router = APIRouter(prefix="/session-requests", tags=["session-requests"])

_TS_MAP: dict[SessionRequestStatus, str] = {
    SessionRequestStatus.MATCHING: "matched_at",
    SessionRequestStatus.CONFIRMED: "confirmed_at",
    SessionRequestStatus.COMPLETED: "completed_at",
    SessionRequestStatus.CANCELLED: "cancelled_at",
    SessionRequestStatus.EXPIRED: "cancelled_at",
}


@router.post("", response_model=SessionRequestRead, status_code=201)
async def create_session_request(
    body: SessionRequestCreate, db: AsyncSession = Depends(get_db)
):
    sr = SessionRequest(**body.model_dump())
    db.add(sr)
    await db.flush()
    await db.refresh(sr)
    return sr


@router.get("", response_model=list[SessionRequestRead])
async def list_session_requests(
    status: SessionRequestStatus | None = None,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    q = select(SessionRequest).order_by(SessionRequest.created_at.desc())
    if status:
        q = q.where(SessionRequest.status == status)
    result = await db.execute(q.offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/{request_id}", response_model=SessionRequestRead)
async def get_session_request(
    request_id: uuid.UUID, db: AsyncSession = Depends(get_db)
):
    sr = await db.get(SessionRequest, request_id)
    if not sr:
        raise HTTPException(404, "SessionRequest not found")
    return sr


@router.patch("/{request_id}/status", response_model=SessionRequestRead)
async def update_session_request_status(
    request_id: uuid.UUID,
    body: SessionRequestUpdateStatus,
    db: AsyncSession = Depends(get_db),
):
    sr = await db.get(SessionRequest, request_id)
    if not sr:
        raise HTTPException(404, "SessionRequest not found")

    try:
        new_status = transition(sr.status, body.status)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc

    sr.status = new_status

    # Set corresponding timestamp
    ts_field = _TS_MAP.get(new_status)
    if ts_field:
        setattr(sr, ts_field, datetime.now(timezone.utc))

    if body.cancellation_reason and new_status == SessionRequestStatus.CANCELLED:
        sr.cancellation_reason = body.cancellation_reason

    await db.flush()
    await db.refresh(sr)
    return sr
