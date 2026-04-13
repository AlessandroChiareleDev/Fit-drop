"""
Orchestration endpoints — wire together the full business flow.

These endpoints coordinate multiple entities in a single transaction,
enforcing the invariants:
  - Match accepted → generate payment link
  - Payment confirmed → create Session + Payout
  - Session completed → enable review, schedule payout
"""

import uuid
from datetime import date, datetime, timedelta, timezone

from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel as PydanticBase
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core import transition
from app.core.matching import RequestContext, TrainerCandidate, rank_candidates
from app.core.pricing import calculate_session_pricing
from app.database import get_db
from app.enums import (
    MatchStatus,
    PaymentMethod,
    PaymentStatus,
    PayoutStatus,
    SessionRequestStatus,
    SessionStatus,
)
from app.models.match import Match
from app.models.payment import Payment
from app.models.payout import Payout
from app.models.session import Session
from app.models.session_request import SessionRequest
from app.models.trainer import Trainer

router = APIRouter(prefix="/orchestration", tags=["orchestration"])


# ── Request schemas ───────────────────────────────────────────────


class OfferMatchBody(PydanticBase):
    request_id: uuid.UUID
    trainer_id: uuid.UUID
    operated_by: str | None = None


class ConfirmPaymentBody(PydanticBase):
    match_id: uuid.UUID
    method: PaymentMethod
    external_reference: str | None = None


class CompleteSessionBody(PydanticBase):
    session_id: uuid.UUID


# ── 1. Offer match to trainer ────────────────────────────────────


@router.post("/offer-match")
async def offer_match(body: OfferMatchBody, db: AsyncSession = Depends(get_db)):
    """
    Operator picks a trainer for a request.
    Creates Match (offered), moves SessionRequest → matching.
    """
    sr = await db.get(SessionRequest, str(body.request_id))
    if not sr:
        raise HTTPException(404, "SessionRequest not found")

    trainer = await db.get(Trainer, str(body.trainer_id))
    if not trainer:
        raise HTTPException(404, "Trainer not found")

    # Count existing match attempts
    existing = await db.execute(
        select(Match).where(Match.request_id == str(body.request_id))
    )
    attempts = len(existing.scalars().all())
    if attempts >= settings.MAX_MATCH_ATTEMPTS:
        raise HTTPException(
            422, f"Max match attempts ({settings.MAX_MATCH_ATTEMPTS}) reached"
        )

    # Move request to matching if still submitted
    if sr.status == SessionRequestStatus.SUBMITTED:
        sr.status = SessionRequestStatus.MATCHING
        sr.matched_at = datetime.now(timezone.utc)

    now = datetime.now(timezone.utc)
    match = Match(
        request_id=str(body.request_id),
        trainer_id=str(body.trainer_id),
        attempt_number=attempts + 1,
        status=MatchStatus.OFFERED,
        offered_at=now,
        response_deadline=now
        + timedelta(minutes=settings.TRAINER_RESPONSE_DEADLINE_MINUTES),
        operated_by=body.operated_by,
    )
    db.add(match)
    await db.flush()
    await db.refresh(match)

    pricing = calculate_session_pricing(Decimal(str(trainer.base_price_per_session)))

    return {
        "match_id": match.id,
        "trainer_name": trainer.name,
        "attempt": match.attempt_number,
        "response_deadline": match.response_deadline,
        "pricing": {k: float(v) for k, v in pricing.items()},
    }


# ── 2. Trainer accepts → generate payment ────────────────────────


@router.post("/accept-match/{match_id}")
async def accept_match(match_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Trainer accepts match.
    Match → accepted, SessionRequest → awaiting_payment.
    Returns pricing for payment link generation.
    """
    match = await db.get(Match, str(match_id))
    if not match:
        raise HTTPException(404, "Match not found")
    if match.status != MatchStatus.OFFERED:
        raise HTTPException(422, f"Match is '{match.status.value}', expected 'offered'")

    # Check deadline
    now = datetime.now(timezone.utc)
    deadline = match.response_deadline
    if deadline and deadline.tzinfo is None:
        deadline = deadline.replace(tzinfo=timezone.utc)
    if deadline and now > deadline:
        match.status = MatchStatus.EXPIRED
        await db.flush()
        raise HTTPException(422, "Response deadline expired")

    match.status = MatchStatus.ACCEPTED
    match.responded_at = now

    sr = await db.get(SessionRequest, match.request_id)
    if sr and sr.status == SessionRequestStatus.MATCHING:
        sr.status = SessionRequestStatus.AWAITING_PAYMENT

    trainer = await db.get(Trainer, match.trainer_id)
    pricing = calculate_session_pricing(Decimal(str(trainer.base_price_per_session)))

    await db.flush()
    return {
        "match_id": match.id,
        "status": "accepted",
        "user_pays": float(pricing["user_pays"]),
        "pricing": {k: float(v) for k, v in pricing.items()},
        "payment_deadline": (
            now + timedelta(hours=settings.PAYMENT_WINDOW_HOURS)
        ).isoformat(),
    }


# ── 3. Trainer declines → allow retry ────────────────────────────


@router.post("/decline-match/{match_id}")
async def decline_match(match_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Trainer declines. Match → declined. Request stays in matching for retry."""
    match = await db.get(Match, str(match_id))
    if not match:
        raise HTTPException(404, "Match not found")
    if match.status != MatchStatus.OFFERED:
        raise HTTPException(422, f"Match is '{match.status.value}', expected 'offered'")

    match.status = MatchStatus.DECLINED
    match.responded_at = datetime.now(timezone.utc)

    # Count remaining attempts
    existing = await db.execute(
        select(Match).where(Match.request_id == match.request_id)
    )
    attempts = len(existing.scalars().all())
    remaining = settings.MAX_MATCH_ATTEMPTS - attempts

    await db.flush()
    return {
        "match_id": match.id,
        "status": "declined",
        "remaining_attempts": remaining,
    }


# ── 4. Payment confirmed → create Session + Payout ───────────────


@router.post("/confirm-payment")
async def confirm_payment(
    body: ConfirmPaymentBody, db: AsyncSession = Depends(get_db)
):
    """
    Payment confirmed (webhook or manual).
    Creates Session + Payment + Payout in one transaction.
    SessionRequest → confirmed.
    """
    match = await db.get(Match, str(body.match_id))
    if not match:
        raise HTTPException(404, "Match not found")
    if match.status != MatchStatus.ACCEPTED:
        raise HTTPException(422, "Match must be accepted before payment")

    sr = await db.get(SessionRequest, match.request_id)
    if not sr:
        raise HTTPException(404, "SessionRequest not found")

    trainer = await db.get(Trainer, match.trainer_id)
    pricing = calculate_session_pricing(Decimal(str(trainer.base_price_per_session)))

    now = datetime.now(timezone.utc)

    # Create session
    session = Session(
        request_id=sr.id,
        match_id=match.id,
        user_id=sr.user_id,
        trainer_id=match.trainer_id,
        scheduled_date=sr.requested_date,
        scheduled_time_start=sr.requested_time_start,
        scheduled_time_end=sr.requested_time_end,
        venue_type=sr.venue_type,
        venue_notes=sr.venue_details,
        gross_amount=float(pricing["gross_amount"]),
        platform_fee_amount=float(pricing["platform_fee_amount"]),
        convenience_fee_amount=float(pricing["convenience_fee_amount"]),
        trainer_payout_amount=float(pricing["trainer_payout_amount"]),
        status=SessionStatus.CONFIRMED,
    )
    db.add(session)
    await db.flush()

    # Create payment
    payment = Payment(
        session_id=session.id,
        user_id=sr.user_id,
        amount=float(pricing["user_pays"]),
        method=body.method,
        status=PaymentStatus.PAID,
        paid_at=now,
        external_reference=body.external_reference,
    )
    db.add(payment)

    # Create payout (next Friday)
    today = now.date()
    days_until_friday = (4 - today.weekday()) % 7 or 7
    payout_date = today + timedelta(days=days_until_friday)

    payout = Payout(
        session_id=session.id,
        trainer_id=match.trainer_id,
        amount=float(pricing["trainer_payout_amount"]),
        status=PayoutStatus.PENDING,
        scheduled_date=payout_date,
    )
    db.add(payout)

    # Update request status
    sr.status = SessionRequestStatus.CONFIRMED
    sr.confirmed_at = now

    await db.flush()
    await db.refresh(session)

    return {
        "session_id": session.id,
        "payment_id": payment.id,
        "payout_id": payout.id,
        "status": "confirmed",
        "scheduled_date": str(session.scheduled_date),
        "scheduled_time": str(session.scheduled_time_start),
        "user_paid": float(pricing["user_pays"]),
        "trainer_will_receive": float(pricing["trainer_payout_amount"]),
        "payout_scheduled_for": str(payout_date),
    }


# ── 5. Complete session ──────────────────────────────────────────


@router.post("/complete-session")
async def complete_session(
    body: CompleteSessionBody, db: AsyncSession = Depends(get_db)
):
    """Mark session as completed. Enables review and payout approval."""
    session = await db.get(Session, str(body.session_id))
    if not session:
        raise HTTPException(404, "Session not found")

    if session.status not in (SessionStatus.CONFIRMED, SessionStatus.IN_PROGRESS):
        raise HTTPException(
            422, f"Session is '{session.status.value}', cannot complete"
        )

    now = datetime.now(timezone.utc)
    session.status = SessionStatus.COMPLETED
    session.completed_at = now

    # Also mark the request as completed
    sr = await db.get(SessionRequest, session.request_id)
    if sr:
        sr.status = SessionRequestStatus.COMPLETED
        sr.completed_at = now

    # Update trainer stats
    trainer = await db.get(Trainer, session.trainer_id)
    if trainer:
        trainer.total_sessions = (trainer.total_sessions or 0) + 1

    await db.flush()
    await db.refresh(session)

    return {
        "session_id": session.id,
        "status": "completed",
        "trainer_total_sessions": trainer.total_sessions if trainer else None,
    }


# ── 6. Pricing preview ───────────────────────────────────────────


@router.get("/pricing-preview/{trainer_id}")
async def pricing_preview(trainer_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Show price breakdown for a trainer's session."""
    trainer = await db.get(Trainer, str(trainer_id))
    if not trainer:
        raise HTTPException(404, "Trainer not found")

    pricing = calculate_session_pricing(Decimal(str(trainer.base_price_per_session)))
    return {
        "trainer_id": str(trainer_id),
        "trainer_name": trainer.name,
        "base_price": float(trainer.base_price_per_session),
        **{k: float(v) for k, v in pricing.items()},
    }
