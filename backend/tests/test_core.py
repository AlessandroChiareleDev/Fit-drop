"""
Tests for core business logic: state machines, pricing, matching.
"""

import pytest
from decimal import Decimal
from datetime import date, time

from app.core import transition
from app.core.pricing import calculate_session_pricing
from app.core.matching import (
    TrainerCandidate,
    RequestContext,
    rank_candidates,
)
from app.enums import (
    CrefStatus,
    MatchStatus,
    Modality,
    PaymentStatus,
    PayoutStatus,
    SessionRequestStatus,
    SessionStatus,
    TrainerOperationalStatus,
)


# ── State Machine Tests ──────────────────────────────────────────


class TestSessionRequestTransitions:
    def test_submitted_to_matching(self):
        result = transition(SessionRequestStatus.SUBMITTED, SessionRequestStatus.MATCHING)
        assert result == SessionRequestStatus.MATCHING

    def test_submitted_to_cancelled(self):
        result = transition(SessionRequestStatus.SUBMITTED, SessionRequestStatus.CANCELLED)
        assert result == SessionRequestStatus.CANCELLED

    def test_matching_to_awaiting_payment(self):
        result = transition(SessionRequestStatus.MATCHING, SessionRequestStatus.AWAITING_PAYMENT)
        assert result == SessionRequestStatus.AWAITING_PAYMENT

    def test_awaiting_payment_to_confirmed(self):
        result = transition(SessionRequestStatus.AWAITING_PAYMENT, SessionRequestStatus.CONFIRMED)
        assert result == SessionRequestStatus.CONFIRMED

    def test_confirmed_to_completed(self):
        result = transition(SessionRequestStatus.CONFIRMED, SessionRequestStatus.COMPLETED)
        assert result == SessionRequestStatus.COMPLETED

    def test_invalid_submitted_to_completed(self):
        with pytest.raises(ValueError, match="Invalid transition"):
            transition(SessionRequestStatus.SUBMITTED, SessionRequestStatus.COMPLETED)

    def test_invalid_completed_to_anything(self):
        with pytest.raises(ValueError):
            transition(SessionRequestStatus.COMPLETED, SessionRequestStatus.SUBMITTED)

    def test_expired_is_terminal(self):
        with pytest.raises(ValueError):
            transition(SessionRequestStatus.EXPIRED, SessionRequestStatus.SUBMITTED)


class TestMatchTransitions:
    def test_candidate_to_offered(self):
        assert transition(MatchStatus.CANDIDATE, MatchStatus.OFFERED) == MatchStatus.OFFERED

    def test_offered_to_accepted(self):
        assert transition(MatchStatus.OFFERED, MatchStatus.ACCEPTED) == MatchStatus.ACCEPTED

    def test_offered_to_declined(self):
        assert transition(MatchStatus.OFFERED, MatchStatus.DECLINED) == MatchStatus.DECLINED

    def test_offered_to_expired(self):
        assert transition(MatchStatus.OFFERED, MatchStatus.EXPIRED) == MatchStatus.EXPIRED

    def test_invalid_candidate_to_accepted(self):
        with pytest.raises(ValueError):
            transition(MatchStatus.CANDIDATE, MatchStatus.ACCEPTED)

    def test_accepted_is_terminal(self):
        with pytest.raises(ValueError):
            transition(MatchStatus.ACCEPTED, MatchStatus.OFFERED)


class TestSessionTransitions:
    def test_confirmed_to_in_progress(self):
        assert transition(SessionStatus.CONFIRMED, SessionStatus.IN_PROGRESS) == SessionStatus.IN_PROGRESS

    def test_in_progress_to_completed(self):
        assert transition(SessionStatus.IN_PROGRESS, SessionStatus.COMPLETED) == SessionStatus.COMPLETED

    def test_confirmed_to_cancelled(self):
        assert transition(SessionStatus.CONFIRMED, SessionStatus.CANCELLED) == SessionStatus.CANCELLED

    def test_invalid_completed_to_cancelled(self):
        with pytest.raises(ValueError):
            transition(SessionStatus.COMPLETED, SessionStatus.CANCELLED)


class TestPaymentTransitions:
    def test_pending_to_paid(self):
        assert transition(PaymentStatus.PENDING, PaymentStatus.PAID) == PaymentStatus.PAID

    def test_paid_to_refunded(self):
        assert transition(PaymentStatus.PAID, PaymentStatus.REFUNDED) == PaymentStatus.REFUNDED

    def test_pending_to_failed(self):
        assert transition(PaymentStatus.PENDING, PaymentStatus.FAILED) == PaymentStatus.FAILED

    def test_invalid_failed_to_paid(self):
        with pytest.raises(ValueError):
            transition(PaymentStatus.FAILED, PaymentStatus.PAID)


class TestPayoutTransitions:
    def test_pending_to_approved(self):
        assert transition(PayoutStatus.PENDING, PayoutStatus.APPROVED) == PayoutStatus.APPROVED

    def test_approved_to_paid(self):
        assert transition(PayoutStatus.APPROVED, PayoutStatus.PAID) == PayoutStatus.PAID

    def test_invalid_paid_to_pending(self):
        with pytest.raises(ValueError):
            transition(PayoutStatus.PAID, PayoutStatus.PENDING)


# ── Pricing Tests ─────────────────────────────────────────────────


class TestPricing:
    def test_standard_pricing(self):
        result = calculate_session_pricing(Decimal("120.00"))
        assert result["gross_amount"] == Decimal("120.00")
        assert result["platform_fee_amount"] == Decimal("26.40")  # 22%
        assert result["convenience_fee_amount"] == Decimal("15.00")
        assert result["user_pays"] == Decimal("135.00")  # 120 + 15
        assert result["trainer_payout_amount"] == Decimal("93.60")  # 120 - 26.40

    def test_rounding(self):
        result = calculate_session_pricing(Decimal("99.99"))
        # All values should be rounded to 2 decimal places
        for key, value in result.items():
            assert value == value.quantize(Decimal("0.01"))

    def test_cheap_session(self):
        result = calculate_session_pricing(Decimal("50.00"))
        assert result["platform_fee_amount"] == Decimal("11.00")
        assert result["trainer_payout_amount"] == Decimal("39.00")
        assert result["user_pays"] == Decimal("65.00")

    def test_expensive_session(self):
        result = calculate_session_pricing(Decimal("300.00"))
        assert result["platform_fee_amount"] == Decimal("66.00")
        assert result["trainer_payout_amount"] == Decimal("234.00")
        assert result["user_pays"] == Decimal("315.00")


# ── Matching Tests ────────────────────────────────────────────────


def _make_candidate(**overrides) -> TrainerCandidate:
    defaults = {
        "trainer_id": "trainer-1",
        "cref_status": CrefStatus.VERIFIED,
        "operational_status": TrainerOperationalStatus.ACTIVE,
        "specialties": ["strength"],
        "coverage_neighborhoods": ["Praia do Canto"],
        "avg_rating": 4.5,
        "acceptance_rate": 0.9,
        "attendance_rate": 0.95,
        "total_sessions": 20,
        "available_for_slot": True,
    }
    defaults.update(overrides)
    return TrainerCandidate(**defaults)


def _make_context(**overrides) -> RequestContext:
    defaults = {
        "neighborhood": "Praia do Canto",
        "modality": Modality.STRENGTH,
        "requested_date": date(2026, 4, 14),
        "requested_time_start": time(7, 0),
        "requested_time_end": time(8, 0),
    }
    defaults.update(overrides)
    return RequestContext(**defaults)


class TestMatching:
    def test_eligible_candidate_scores(self):
        candidates = [_make_candidate()]
        ctx = _make_context()
        result = rank_candidates(candidates, ctx)
        assert len(result) == 1
        assert result[0].score > 0

    def test_unverified_cref_excluded(self):
        candidates = [_make_candidate(cref_status=CrefStatus.PENDING)]
        ctx = _make_context()
        result = rank_candidates(candidates, ctx)
        assert len(result) == 0

    def test_inactive_trainer_excluded(self):
        candidates = [_make_candidate(operational_status=TrainerOperationalStatus.SUSPENDED)]
        ctx = _make_context()
        result = rank_candidates(candidates, ctx)
        assert len(result) == 0

    def test_unavailable_excluded(self):
        candidates = [_make_candidate(available_for_slot=False)]
        ctx = _make_context()
        result = rank_candidates(candidates, ctx)
        assert len(result) == 0

    def test_wrong_neighborhood_excluded(self):
        candidates = [_make_candidate(coverage_neighborhoods=["Jardim Camburi"])]
        ctx = _make_context(neighborhood="Praia do Canto")
        result = rank_candidates(candidates, ctx)
        assert len(result) == 0

    def test_ranking_by_score(self):
        c1 = _make_candidate(trainer_id="high", avg_rating=4.9, acceptance_rate=0.95)
        c2 = _make_candidate(trainer_id="low", avg_rating=3.0, acceptance_rate=0.7)
        ctx = _make_context()
        result = rank_candidates([c2, c1], ctx)
        assert result[0].trainer_id == "high"
        assert result[1].trainer_id == "low"
        assert result[0].score > result[1].score

    def test_specialty_match_boosts_score(self):
        c_match = _make_candidate(trainer_id="match", specialties=["strength"])
        c_nomatch = _make_candidate(trainer_id="nomatch", specialties=["yoga"])
        ctx = _make_context(modality=Modality.STRENGTH)
        result = rank_candidates([c_nomatch, c_match], ctx)
        match_score = next(r for r in result if r.trainer_id == "match")
        nomatch_score = next(r for r in result if r.trainer_id == "nomatch")
        assert match_score.score > nomatch_score.score

    def test_breakdown_keys(self):
        candidates = [_make_candidate()]
        ctx = _make_context()
        result = rank_candidates(candidates, ctx)
        bd = result[0].breakdown
        assert set(bd.keys()) == {"proximity", "specialty", "rating", "acceptance", "attendance", "schedule_fit"}

    def test_empty_candidates(self):
        result = rank_candidates([], _make_context())
        assert result == []

    def test_all_filtered_out(self):
        candidates = [
            _make_candidate(cref_status=CrefStatus.EXPIRED),
            _make_candidate(available_for_slot=False),
        ]
        result = rank_candidates(candidates, _make_context())
        assert result == []
