"""
Explicit state-machine transition tables.

Each dict maps  current_status -> set of valid next statuses.
The ``transition()`` helper validates and returns the new status,
raising ValueError on illegal moves.
"""

from app.enums import (
    MatchStatus,
    PaymentStatus,
    PayoutStatus,
    SessionRequestStatus,
    SessionStatus,
)

# ── Transition tables ─────────────────────────────────────────────

SESSION_REQUEST_TRANSITIONS: dict[SessionRequestStatus, set[SessionRequestStatus]] = {
    SessionRequestStatus.SUBMITTED: {
        SessionRequestStatus.MATCHING,
        SessionRequestStatus.CANCELLED,
        SessionRequestStatus.EXPIRED,
    },
    SessionRequestStatus.MATCHING: {
        SessionRequestStatus.AWAITING_PAYMENT,
        SessionRequestStatus.CANCELLED,
    },
    SessionRequestStatus.AWAITING_PAYMENT: {
        SessionRequestStatus.CONFIRMED,
        SessionRequestStatus.CANCELLED,
        SessionRequestStatus.EXPIRED,
    },
    SessionRequestStatus.CONFIRMED: {
        SessionRequestStatus.COMPLETED,
        SessionRequestStatus.CANCELLED,
    },
    # terminal states
    SessionRequestStatus.COMPLETED: set(),
    SessionRequestStatus.CANCELLED: set(),
    SessionRequestStatus.EXPIRED: set(),
}

MATCH_TRANSITIONS: dict[MatchStatus, set[MatchStatus]] = {
    MatchStatus.CANDIDATE: {MatchStatus.OFFERED},
    MatchStatus.OFFERED: {
        MatchStatus.ACCEPTED,
        MatchStatus.DECLINED,
        MatchStatus.EXPIRED,
    },
    # terminal states
    MatchStatus.ACCEPTED: set(),
    MatchStatus.DECLINED: set(),
    MatchStatus.EXPIRED: set(),
}

SESSION_TRANSITIONS: dict[SessionStatus, set[SessionStatus]] = {
    SessionStatus.CONFIRMED: {
        SessionStatus.IN_PROGRESS,
        SessionStatus.CANCELLED,
    },
    SessionStatus.IN_PROGRESS: {
        SessionStatus.COMPLETED,
        SessionStatus.CANCELLED,
    },
    # terminal states
    SessionStatus.COMPLETED: set(),
    SessionStatus.CANCELLED: set(),
}

PAYMENT_TRANSITIONS: dict[PaymentStatus, set[PaymentStatus]] = {
    PaymentStatus.PENDING: {PaymentStatus.PAID, PaymentStatus.FAILED},
    PaymentStatus.PAID: {PaymentStatus.REFUNDED},
    # terminal states
    PaymentStatus.FAILED: set(),
    PaymentStatus.REFUNDED: set(),
}

PAYOUT_TRANSITIONS: dict[PayoutStatus, set[PayoutStatus]] = {
    PayoutStatus.PENDING: {PayoutStatus.APPROVED, PayoutStatus.FAILED},
    PayoutStatus.APPROVED: {PayoutStatus.PAID, PayoutStatus.FAILED},
    # terminal states
    PayoutStatus.PAID: set(),
    PayoutStatus.FAILED: set(),
}

# Registry: enum type  →  transition table
_TABLES: dict = {
    SessionRequestStatus: SESSION_REQUEST_TRANSITIONS,
    MatchStatus: MATCH_TRANSITIONS,
    SessionStatus: SESSION_TRANSITIONS,
    PaymentStatus: PAYMENT_TRANSITIONS,
    PayoutStatus: PAYOUT_TRANSITIONS,
}


def transition[S](current: S, target: S) -> S:
    """Validate and return *target* if the move is legal, else raise."""
    table = _TABLES.get(type(current))
    if table is None:
        raise TypeError(f"No state machine registered for {type(current)}")
    allowed = table.get(current, set())
    if target not in allowed:
        raise ValueError(
            f"Invalid transition: {current.value!r} → {target.value!r}. "
            f"Allowed: {sorted(s.value for s in allowed)}"
        )
    return target
