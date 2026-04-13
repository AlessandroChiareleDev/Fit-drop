import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import transition
from app.core.matching import RequestContext, TrainerCandidate, rank_candidates
from app.database import get_db
from app.enums import SessionRequestStatus
from app.models.session import Session
from app.models.session_request import SessionRequest
from app.models.trainer import Trainer
from app.models.trainer_availability import TrainerAvailability
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
    data = {k: str(v) if isinstance(v, uuid.UUID) else v for k, v in body.model_dump().items()}
    sr = SessionRequest(**data)
    db.add(sr)
    await db.flush()
    await db.refresh(sr)
    return sr


@router.get("", response_model=list[SessionRequestRead])
async def list_session_requests(
    status: SessionRequestStatus | None = None,
    user_id: uuid.UUID | None = None,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    q = select(SessionRequest).order_by(SessionRequest.created_at.desc())
    if status:
        q = q.where(SessionRequest.status == status)
    if user_id:
        q = q.where(SessionRequest.user_id == str(user_id))
    result = await db.execute(q.offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/{request_id}", response_model=SessionRequestRead)
async def get_session_request(
    request_id: uuid.UUID, db: AsyncSession = Depends(get_db)
):
    sr = await db.get(SessionRequest, str(request_id))
    if not sr:
        raise HTTPException(404, "SessionRequest not found")
    return sr


@router.patch("/{request_id}/status", response_model=SessionRequestRead)
async def update_session_request_status(
    request_id: uuid.UUID,
    body: SessionRequestUpdateStatus,
    db: AsyncSession = Depends(get_db),
):
    sr = await db.get(SessionRequest, str(request_id))
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


# ── Matching candidates ───────────────────────────────────────────


@router.get("/{request_id}/candidates")
async def get_candidates(
    request_id: uuid.UUID, db: AsyncSession = Depends(get_db)
):
    """Return ranked eligible trainers for this session request."""
    sr = await db.get(SessionRequest, str(request_id))
    if not sr:
        raise HTTPException(404, "SessionRequest not found")

    # Build request context
    ctx = RequestContext(
        neighborhood=sr.neighborhood,
        modality=sr.modality,
        requested_date=sr.requested_date,
        requested_time_start=sr.requested_time_start,
        requested_time_end=sr.requested_time_end,
    )

    # Load all trainers in same city
    result = await db.execute(select(Trainer).where(Trainer.city == "Vitória"))
    # fallback: if no trainers in "Vitória", load all
    trainers = result.scalars().all()
    if not trainers:
        result = await db.execute(select(Trainer))
        trainers = result.scalars().all()

    # Check availability for each trainer
    day_of_week = sr.requested_date.weekday()  # 0=Mon
    candidates = []
    for t in trainers:
        # Check if trainer has confirmed session overlapping this slot
        existing = await db.execute(
            select(Session).where(
                Session.trainer_id == str(t.id),
                Session.scheduled_date == sr.requested_date,
                Session.status != "cancelled",
            )
        )
        has_conflict = False
        for s in existing.scalars().all():
            if s.scheduled_time_start < sr.requested_time_end and s.scheduled_time_end > sr.requested_time_start:
                has_conflict = True
                break

        # Check availability slots
        avail_result = await db.execute(
            select(TrainerAvailability).where(
                TrainerAvailability.trainer_id == str(t.id),
                TrainerAvailability.day_of_week == day_of_week,
            )
        )
        avail_slots = avail_result.scalars().all()
        has_slot = any(
            a.start_time <= sr.requested_time_start and a.end_time >= sr.requested_time_end
            for a in avail_slots
        )

        candidates.append(
            TrainerCandidate(
                trainer_id=str(t.id),
                cref_status=t.cref_status,
                operational_status=t.operational_status,
                specialties=t.specialties if isinstance(t.specialties, list) else [],
                coverage_neighborhoods=t.coverage_neighborhoods if isinstance(t.coverage_neighborhoods, list) else [],
                avg_rating=t.avg_rating,
                acceptance_rate=t.acceptance_rate,
                attendance_rate=t.attendance_rate,
                total_sessions=t.total_sessions,
                available_for_slot=has_slot and not has_conflict,
            )
        )

    scored = rank_candidates(candidates, ctx)
    return [
        {
            "trainer_id": sc.trainer_id,
            "score": sc.score,
            "breakdown": sc.breakdown,
        }
        for sc in scored
    ]
