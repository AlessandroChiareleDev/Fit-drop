"""
Deterministic matching / scoring engine (v1).

Phase 0/1: operator sees ranked candidates and picks manually.
Phase 2: system auto-dispatches top candidate.

Scoring is a weighted sum of normalised 0-1 signals.  Trainers that
fail any *eliminatory filter* are excluded before scoring.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, time

from app.enums import CrefStatus, Modality, TrainerOperationalStatus


# ── Weights (must sum to 1.0) ─────────────────────────────────────

WEIGHT_PROXIMITY = 0.25
WEIGHT_SPECIALTY = 0.20
WEIGHT_RATING = 0.20
WEIGHT_ACCEPTANCE = 0.15
WEIGHT_ATTENDANCE = 0.15
WEIGHT_SCHEDULE_FIT = 0.05


@dataclass(frozen=True)
class TrainerCandidate:
    """Lightweight projection of a Trainer for scoring."""

    trainer_id: str
    cref_status: CrefStatus
    operational_status: TrainerOperationalStatus
    specialties: list[str]
    coverage_neighborhoods: list[str]
    avg_rating: float
    acceptance_rate: float
    attendance_rate: float
    total_sessions: int
    # availability already checked externally – this flag says "has open slot"
    available_for_slot: bool


@dataclass(frozen=True)
class RequestContext:
    """What the request needs."""

    neighborhood: str
    modality: Modality
    requested_date: date
    requested_time_start: time
    requested_time_end: time


@dataclass(frozen=True)
class ScoredCandidate:
    trainer_id: str
    score: float
    breakdown: dict[str, float]


# ── Eliminatory filters ──────────────────────────────────────────


def _passes_filters(c: TrainerCandidate, ctx: RequestContext) -> bool:
    if c.cref_status != CrefStatus.VERIFIED:
        return False
    if c.operational_status != TrainerOperationalStatus.ACTIVE:
        return False
    if not c.available_for_slot:
        return False
    if ctx.neighborhood.lower() not in [n.lower() for n in c.coverage_neighborhoods]:
        return False
    return True


# ── Scoring ───────────────────────────────────────────────────────


def _score(c: TrainerCandidate, ctx: RequestContext) -> ScoredCandidate:
    # proximity: 1.0 if neighbourhood matches (already filtered), bonus placeholder
    proximity = 1.0

    # specialty match
    specialty = 1.0 if ctx.modality.value in c.specialties else 0.3

    # normalised rating (1-5 → 0-1)
    rating = max(0.0, (c.avg_rating - 1.0)) / 4.0 if c.total_sessions > 0 else 0.5

    acceptance = c.acceptance_rate
    attendance = c.attendance_rate

    # schedule_fit: placeholder 1.0 (slot already verified)
    schedule_fit = 1.0

    total = (
        WEIGHT_PROXIMITY * proximity
        + WEIGHT_SPECIALTY * specialty
        + WEIGHT_RATING * rating
        + WEIGHT_ACCEPTANCE * acceptance
        + WEIGHT_ATTENDANCE * attendance
        + WEIGHT_SCHEDULE_FIT * schedule_fit
    )

    breakdown = {
        "proximity": round(proximity, 3),
        "specialty": round(specialty, 3),
        "rating": round(rating, 3),
        "acceptance": round(acceptance, 3),
        "attendance": round(attendance, 3),
        "schedule_fit": round(schedule_fit, 3),
    }

    return ScoredCandidate(
        trainer_id=c.trainer_id,
        score=round(total, 4),
        breakdown=breakdown,
    )


def rank_candidates(
    candidates: list[TrainerCandidate],
    ctx: RequestContext,
) -> list[ScoredCandidate]:
    """Filter and rank trainers for a given request. Returns sorted desc by score."""
    eligible = [c for c in candidates if _passes_filters(c, ctx)]
    scored = [_score(c, ctx) for c in eligible]
    scored.sort(key=lambda s: s.score, reverse=True)
    return scored
