import enum


# ── User Roles ────────────────────────────────────────────────────


class UserRole(str, enum.Enum):
    STUDENT = "student"        # Aluno — busca e agenda sessões
    TRAINER = "trainer"        # Professor — recebe sessões, gerencia agenda
    GYM_OWNER = "gym_owner"    # Dono de academia — gerencia espaço e trainers
    ADMIN = "admin"            # Administrador — acesso total ao sistema


# ── Identity & Verification ──────────────────────────────────────


class CrefStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    EXPIRED = "expired"
    REJECTED = "rejected"


class TrainerOperationalStatus(str, enum.Enum):
    PENDING_REVIEW = "pending_review"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    INACTIVE = "inactive"


# ── Supply ────────────────────────────────────────────────────────


class RecurrenceType(str, enum.Enum):
    WEEKLY = "weekly"
    ONE_TIME = "one_time"


class Modality(str, enum.Enum):
    STRENGTH = "strength"
    FUNCTIONAL = "functional"
    RUNNING = "running"
    YOGA = "yoga"
    PILATES = "pilates"
    STRETCHING = "stretching"
    OTHER = "other"


# ── Demand ────────────────────────────────────────────────────────


class VenueType(str, enum.Enum):
    GYM = "gym"
    OUTDOOR = "outdoor"
    HOTEL = "hotel"
    RESIDENCE = "residence"
    FLEXIBLE = "flexible"


class Urgency(str, enum.Enum):
    STANDARD = "standard"
    URGENT = "urgent"


class LeadSource(str, enum.Enum):
    LANDING_PAGE = "landing_page"
    WHATSAPP = "whatsapp"
    REFERRAL = "referral"
    PARTNER = "partner"


# ── Session Request lifecycle ─────────────────────────────────────


class SessionRequestStatus(str, enum.Enum):
    SUBMITTED = "submitted"
    MATCHING = "matching"
    AWAITING_PAYMENT = "awaiting_payment"
    CONFIRMED = "confirmed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    EXPIRED = "expired"


# ── Match lifecycle ───────────────────────────────────────────────


class MatchStatus(str, enum.Enum):
    CANDIDATE = "candidate"
    OFFERED = "offered"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    EXPIRED = "expired"


# ── Session lifecycle ─────────────────────────────────────────────


class SessionStatus(str, enum.Enum):
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


# ── Payment ───────────────────────────────────────────────────────


class PaymentMethod(str, enum.Enum):
    PIX = "pix"
    CREDIT_CARD = "credit_card"
    PAYMENT_LINK = "payment_link"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"


# ── Payout ────────────────────────────────────────────────────────


class PayoutStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    PAID = "paid"
    FAILED = "failed"


# ── Quality ───────────────────────────────────────────────────────


class IncidentType(str, enum.Enum):
    NO_SHOW_TRAINER = "no_show_trainer"
    NO_SHOW_USER = "no_show_user"
    QUALITY_COMPLAINT = "quality_complaint"
    SAFETY_ISSUE = "safety_issue"
    OTHER = "other"


class IncidentStatus(str, enum.Enum):
    OPEN = "open"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


class IncidentImpact(str, enum.Enum):
    NONE = "none"
    WARNING = "warning"
    SUSPENSION = "suspension"


# ── Gym ───────────────────────────────────────────────────────────


class GymType(str, enum.Enum):
    GYM = "gym"
    OUTDOOR = "outdoor"
    STUDIO = "studio"
    CROSSFIT = "crossfit"


# ── Coupon ────────────────────────────────────────────────────────


class DiscountType(str, enum.Enum):
    PERCENTAGE = "percentage"
    FIXED = "fixed"


# ── Gym-Trainer partnership ───────────────────────────────────────


class GymTrainerStatus(str, enum.Enum):
    ACTIVE = "active"
    PENDING = "pending"
    REMOVED = "removed"


# ── Favorites ─────────────────────────────────────────────────────


class FavoriteTargetType(str, enum.Enum):
    TRAINER = "trainer"
    GYM = "gym"


# ── Audit ─────────────────────────────────────────────────────────


class AuditAction(str, enum.Enum):
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"
    LOGIN = "login"
    APPROVE = "approve"
    REJECT = "reject"
    SUSPEND = "suspend"
    ACTIVATE = "activate"
