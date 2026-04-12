"""
Deterministic pricing calculation.

All money values are Decimal to avoid floating-point rounding.
"""

from decimal import ROUND_HALF_UP, Decimal

from app.config import settings

_TWO_PLACES = Decimal("0.01")


def _q(value: Decimal) -> Decimal:
    return value.quantize(_TWO_PLACES, rounding=ROUND_HALF_UP)


def calculate_session_pricing(trainer_base_price: Decimal) -> dict[str, Decimal]:
    """Return the full price breakdown for a session.

    Returns dict with keys:
        gross_amount          – what goes to FitDrop's account (base price)
        platform_fee_amount   – FitDrop's commission (22 % of base)
        convenience_fee_amount– flat convenience fee charged to user
        user_pays             – total the user is charged
        trainer_payout_amount – net amount the trainer receives
    """
    commission_rate = Decimal(str(settings.PLATFORM_COMMISSION_RATE))
    convenience_fee = Decimal(str(settings.CONVENIENCE_FEE_BRL))

    gross = _q(trainer_base_price)
    platform_fee = _q(gross * commission_rate)
    trainer_payout = _q(gross - platform_fee)
    user_pays = _q(gross + convenience_fee)

    return {
        "gross_amount": gross,
        "platform_fee_amount": platform_fee,
        "convenience_fee_amount": convenience_fee,
        "user_pays": user_pays,
        "trainer_payout_amount": trainer_payout,
    }
