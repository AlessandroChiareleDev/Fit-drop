"""
Dashboard / metrics endpoints for the admin panel.

Returns operational KPIs from the database.
"""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.enums import (
    PaymentStatus,
    PayoutStatus,
    SessionRequestStatus,
    SessionStatus,
)
from app.models.payment import Payment
from app.models.payout import Payout
from app.models.review import Review
from app.models.session import Session
from app.models.session_request import SessionRequest
from app.models.trainer import Trainer
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/overview")
async def overview(db: AsyncSession = Depends(get_db)):
    """High-level KPIs for the admin dashboard."""

    now = datetime.now(timezone.utc)
    seven_days_ago = now - timedelta(days=7)
    thirty_days_ago = now - timedelta(days=30)

    # Counts
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    total_trainers = (await db.execute(select(func.count(Trainer.id)))).scalar() or 0
    total_requests = (
        await db.execute(select(func.count(SessionRequest.id)))
    ).scalar() or 0
    total_sessions = (
        await db.execute(select(func.count(Session.id)))
    ).scalar() or 0

    # Sessions by status
    sessions_confirmed = (
        await db.execute(
            select(func.count(Session.id)).where(
                Session.status == SessionStatus.CONFIRMED
            )
        )
    ).scalar() or 0
    sessions_completed = (
        await db.execute(
            select(func.count(Session.id)).where(
                Session.status == SessionStatus.COMPLETED
            )
        )
    ).scalar() or 0
    sessions_cancelled = (
        await db.execute(
            select(func.count(Session.id)).where(
                Session.status == SessionStatus.CANCELLED
            )
        )
    ).scalar() or 0

    # Requests by status
    requests_submitted = (
        await db.execute(
            select(func.count(SessionRequest.id)).where(
                SessionRequest.status == SessionRequestStatus.SUBMITTED
            )
        )
    ).scalar() or 0
    requests_matching = (
        await db.execute(
            select(func.count(SessionRequest.id)).where(
                SessionRequest.status == SessionRequestStatus.MATCHING
            )
        )
    ).scalar() or 0
    requests_awaiting = (
        await db.execute(
            select(func.count(SessionRequest.id)).where(
                SessionRequest.status == SessionRequestStatus.AWAITING_PAYMENT
            )
        )
    ).scalar() or 0

    # GMV (gross amount of paid sessions)
    gmv_result = await db.execute(
        select(func.sum(Payment.amount)).where(Payment.status == PaymentStatus.PAID)
    )
    gmv = float(gmv_result.scalar() or 0)

    # Pending payouts
    pending_payout_result = await db.execute(
        select(func.sum(Payout.amount)).where(
            Payout.status.in_([PayoutStatus.PENDING, PayoutStatus.APPROVED])
        )
    )
    pending_payouts = float(pending_payout_result.scalar() or 0)

    # Average rating
    avg_rating_result = await db.execute(select(func.avg(Review.rating)))
    avg_rating = round(float(avg_rating_result.scalar() or 0), 2)

    # Conversion: requests → completed sessions
    conversion = (
        round(sessions_completed / total_requests * 100, 1) if total_requests > 0 else 0
    )

    return {
        "totals": {
            "users": total_users,
            "trainers": total_trainers,
            "requests": total_requests,
            "sessions": total_sessions,
        },
        "pipeline": {
            "requests_submitted": requests_submitted,
            "requests_matching": requests_matching,
            "requests_awaiting_payment": requests_awaiting,
            "sessions_confirmed": sessions_confirmed,
            "sessions_completed": sessions_completed,
            "sessions_cancelled": sessions_cancelled,
        },
        "financial": {
            "gmv": gmv,
            "pending_payouts": pending_payouts,
        },
        "quality": {
            "avg_rating": avg_rating,
            "conversion_pct": conversion,
        },
    }
