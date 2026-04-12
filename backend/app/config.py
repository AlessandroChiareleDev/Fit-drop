from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://fitdrop:fitdrop@localhost:5432/fitdrop"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # --- Operational parameters ---
    MIN_ADVANCE_BOOKING_HOURS: int = 4
    OPERATION_WINDOW_START_HOUR: int = 6
    OPERATION_WINDOW_END_HOUR: int = 21
    TRAINER_RESPONSE_DEADLINE_MINUTES: int = 30
    MAX_MATCH_ATTEMPTS: int = 3
    PAYMENT_WINDOW_HOURS: int = 2
    DEFAULT_SESSION_DURATION_MINUTES: int = 60

    # --- Financial parameters ---
    PLATFORM_COMMISSION_RATE: float = 0.22
    CONVENIENCE_FEE_BRL: float = 15.00

    # --- Cancellation policy (refund %) ---
    CANCEL_REFUND_GT_24H: float = 1.0    # >24h before session: 100%
    CANCEL_REFUND_2H_24H: float = 0.5    # 2-24h before session: 50%
    CANCEL_REFUND_LT_2H: float = 0.0     # <2h before session: 0%

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
