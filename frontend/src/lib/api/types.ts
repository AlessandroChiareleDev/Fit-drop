// ── Enums ──

export enum CrefStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  EXPIRED = "expired",
  REJECTED = "rejected",
}

export enum TrainerOperationalStatus {
  PENDING_REVIEW = "pending_review",
  ACTIVE = "active",
  SUSPENDED = "suspended",
  INACTIVE = "inactive",
}

export enum RecurrenceType {
  WEEKLY = "weekly",
  ONE_TIME = "one_time",
}

export enum Modality {
  STRENGTH = "strength",
  FUNCTIONAL = "functional",
  RUNNING = "running",
  YOGA = "yoga",
  PILATES = "pilates",
  STRETCHING = "stretching",
  OTHER = "other",
}

export enum VenueType {
  GYM = "gym",
  OUTDOOR = "outdoor",
  HOTEL = "hotel",
  RESIDENCE = "residence",
  FLEXIBLE = "flexible",
}

export enum Urgency {
  STANDARD = "standard",
  URGENT = "urgent",
}

export enum LeadSource {
  LANDING_PAGE = "landing_page",
  WHATSAPP = "whatsapp",
  REFERRAL = "referral",
  PARTNER = "partner",
}

export enum SessionRequestStatus {
  SUBMITTED = "submitted",
  MATCHING = "matching",
  AWAITING_PAYMENT = "awaiting_payment",
  CONFIRMED = "confirmed",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

export enum MatchStatus {
  CANDIDATE = "candidate",
  OFFERED = "offered",
  ACCEPTED = "accepted",
  DECLINED = "declined",
  EXPIRED = "expired",
}

export enum SessionStatus {
  CONFIRMED = "confirmed",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum PaymentMethod {
  PIX = "pix",
  CREDIT_CARD = "credit_card",
  PAYMENT_LINK = "payment_link",
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export enum PayoutStatus {
  PENDING = "pending",
  APPROVED = "approved",
  PAID = "paid",
  FAILED = "failed",
}

export enum IncidentType {
  NO_SHOW_TRAINER = "no_show_trainer",
  NO_SHOW_USER = "no_show_user",
  QUALITY_COMPLAINT = "quality_complaint",
  SAFETY_ISSUE = "safety_issue",
  OTHER = "other",
}

export enum IncidentStatus {
  OPEN = "open",
  INVESTIGATING = "investigating",
  RESOLVED = "resolved",
  DISMISSED = "dismissed",
}

export enum IncidentImpact {
  NONE = "none",
  WARNING = "warning",
  SUSPENSION = "suspension",
}

// ── User Roles ──

export enum UserRole {
  STUDENT = "student",
  TRAINER = "trainer",
  GYM_OWNER = "gym_owner",
  ADMIN = "admin",
}

// ── User ──

export interface UserCreate {
  name: string;
  phone: string;
  email?: string | null;
  city: string;
  neighborhood?: string | null;
  role?: UserRole;
  password?: string | null;
  avatar_url?: string | null;
  trainer_id?: string | null;
}

export interface UserUpdate {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  role?: UserRole | null;
  avatar_url?: string | null;
}

export interface UserRead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  city: string;
  neighborhood: string | null;
  role: UserRole;
  avatar_url: string | null;
  trainer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserRead;
}

// ── Trainer ──

export interface TrainerCreate {
  name: string;
  phone: string;
  email?: string | null;
  cref_number: string;
  bio?: string | null;
  specialties?: string[];
  city: string;
  coverage_neighborhoods?: string[];
  max_travel_radius_km?: number | null;
  base_price_per_session: number;
}

export interface TrainerUpdate {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  bio?: string | null;
  specialties?: string[] | null;
  city?: string | null;
  coverage_neighborhoods?: string[] | null;
  max_travel_radius_km?: number | null;
  base_price_per_session?: number | null;
  cref_status?: CrefStatus | null;
  operational_status?: TrainerOperationalStatus | null;
}

export interface TrainerRead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  cref_number: string;
  cref_status: CrefStatus;
  cref_verified_at: string | null;
  bio: string | null;
  specialties: string[];
  city: string;
  coverage_neighborhoods: string[];
  max_travel_radius_km: number | null;
  base_price_per_session: number;
  operational_status: TrainerOperationalStatus;
  avg_rating: number;
  acceptance_rate: number;
  attendance_rate: number;
  total_sessions: number;
  activated_at: string | null;
  created_at: string;
  updated_at: string;
}

// ── Trainer Availability ──

export interface TrainerAvailabilityCreate {
  day_of_week: number;
  start_time: string;
  end_time: string;
  recurrence_type?: RecurrenceType;
  valid_from: string;
  valid_until?: string | null;
}

export interface TrainerAvailabilityRead {
  id: string;
  trainer_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  recurrence_type: RecurrenceType;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
}

// ── Session Request ──

export interface SessionRequestCreate {
  user_id: string;
  requested_date: string;
  requested_time_start: string;
  requested_time_end: string;
  neighborhood: string;
  venue_type: VenueType;
  venue_details?: string | null;
  modality: Modality;
  urgency?: Urgency;
  notes?: string | null;
  lead_source: LeadSource;
  lead_channel?: string | null;
}

export interface SessionRequestUpdateStatus {
  status: SessionRequestStatus;
  cancellation_reason?: string | null;
}

export interface SessionRequestRead {
  id: string;
  user_id: string;
  requested_date: string;
  requested_time_start: string;
  requested_time_end: string;
  neighborhood: string;
  venue_type: VenueType;
  venue_details: string | null;
  modality: Modality;
  urgency: Urgency;
  notes: string | null;
  lead_source: LeadSource;
  lead_channel: string | null;
  status: SessionRequestStatus;
  matched_at: string | null;
  confirmed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

// ── Match ──

export interface MatchCreate {
  request_id: string;
  trainer_id: string;
  attempt_number?: number;
  score?: number;
  score_breakdown?: Record<string, unknown> | null;
  operated_by?: string | null;
}

export interface MatchUpdateStatus {
  status: MatchStatus;
}

export interface MatchRead {
  id: string;
  request_id: string;
  trainer_id: string;
  attempt_number: number;
  score: number;
  score_breakdown: Record<string, unknown> | null;
  status: MatchStatus;
  offered_at: string | null;
  responded_at: string | null;
  response_deadline: string | null;
  operated_by: string | null;
  created_at: string;
  updated_at: string;
}

// ── Session ──

export interface SessionCreate {
  request_id: string;
  match_id: string;
  user_id: string;
  trainer_id: string;
  scheduled_date: string;
  scheduled_time_start: string;
  scheduled_time_end: string;
  venue_type: VenueType;
  venue_name?: string | null;
  venue_address?: string | null;
  venue_notes?: string | null;
  gross_amount: number;
  platform_fee_amount: number;
  convenience_fee_amount: number;
  trainer_payout_amount: number;
}

export interface SessionUpdateStatus {
  status: SessionStatus;
  cancellation_reason?: string | null;
  cancelled_by?: string | null;
}

export interface SessionRead {
  id: string;
  request_id: string;
  match_id: string;
  user_id: string;
  trainer_id: string;
  scheduled_date: string;
  scheduled_time_start: string;
  scheduled_time_end: string;
  venue_type: VenueType;
  venue_name: string | null;
  venue_address: string | null;
  venue_notes: string | null;
  gross_amount: number;
  platform_fee_amount: number;
  convenience_fee_amount: number;
  trainer_payout_amount: number;
  status: SessionStatus;
  checked_in_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  cancelled_by: string | null;
  created_at: string;
  updated_at: string;
}

// ── Payment ──

export interface PaymentCreate {
  session_id: string;
  user_id: string;
  amount: number;
  method: PaymentMethod;
  external_reference?: string | null;
}

export interface PaymentUpdateStatus {
  status: PaymentStatus;
  external_reference?: string | null;
  refund_amount?: number | null;
}

export interface PaymentRead {
  id: string;
  session_id: string;
  user_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  external_reference: string | null;
  paid_at: string | null;
  failed_at: string | null;
  refunded_at: string | null;
  refund_amount: number | null;
  created_at: string;
  updated_at: string;
}

// ── Payout ──

export interface PayoutCreate {
  session_id: string;
  trainer_id: string;
  amount: number;
  scheduled_date: string;
}

export interface PayoutUpdateStatus {
  status: PayoutStatus;
  approved_by?: string | null;
}

export interface PayoutRead {
  id: string;
  session_id: string;
  trainer_id: string;
  amount: number;
  status: PayoutStatus;
  scheduled_date: string;
  paid_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

// ── Review ──

export interface ReviewCreate {
  session_id: string;
  user_id: string;
  trainer_id: string;
  rating: number;
  comment?: string | null;
  experience_tags?: string[];
}

export interface ReviewRead {
  id: string;
  session_id: string;
  user_id: string;
  trainer_id: string;
  rating: number;
  comment: string | null;
  experience_tags: string[];
  created_at: string;
}

// ── Incident ──

export interface IncidentCreate {
  session_id: string;
  reported_by: string;
  type: IncidentType;
  description: string;
}

export interface IncidentUpdate {
  status?: IncidentStatus | null;
  resolution?: string | null;
  impact_on_trainer?: IncidentImpact | null;
}

export interface IncidentRead {
  id: string;
  session_id: string;
  reported_by: string;
  type: IncidentType;
  description: string;
  resolution: string | null;
  status: IncidentStatus;
  impact_on_trainer: IncidentImpact;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

// ── Dashboard ──

export interface DashboardOverview {
  totals: {
    users: number;
    trainers: number;
    requests: number;
    sessions: number;
  };
  pipeline: {
    requests_submitted: number;
    requests_matching: number;
    requests_awaiting_payment: number;
    sessions_confirmed: number;
    sessions_completed: number;
    sessions_cancelled: number;
  };
  financial: {
    gmv: number;
    pending_payouts: number;
  };
  quality: {
    avg_rating: number;
    conversion_pct: number;
  };
}

// ── Gym ──

export interface GymCreate {
  name: string;
  owner_id: string;
  cnpj?: string | null;
  phone?: string | null;
  email?: string | null;
  description?: string | null;
  city: string;
  neighborhood: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  photo_url?: string | null;
  photos?: string[];
  operating_hours?: Record<string, string>;
  amenities?: string[];
  gym_type?: string;
}

export interface GymUpdate {
  name?: string | null;
  cnpj?: string | null;
  phone?: string | null;
  email?: string | null;
  description?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  photo_url?: string | null;
  photos?: string[] | null;
  operating_hours?: Record<string, string> | null;
  amenities?: string[] | null;
  gym_type?: string | null;
}

export interface GymRead {
  id: string;
  name: string;
  owner_id: string;
  cnpj: string | null;
  phone: string | null;
  email: string | null;
  description: string | null;
  city: string;
  neighborhood: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  photo_url: string | null;
  photos: string[];
  operating_hours: Record<string, string>;
  amenities: string[];
  gym_type: string;
  avg_rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

// ── Coupon ──

export interface CouponCreate {
  gym_id: string;
  code: string;
  description?: string | null;
  discount_type?: string;
  discount_value: number;
  min_price?: number | null;
  max_uses?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
  is_active?: boolean;
}

export interface CouponUpdate {
  description?: string | null;
  discount_type?: string | null;
  discount_value?: number | null;
  min_price?: number | null;
  max_uses?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
  is_active?: boolean | null;
}

export interface CouponRead {
  id: string;
  gym_id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_price: number | null;
  max_uses: number | null;
  used_count: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ── Gym Trainer ──

export interface GymTrainerCreate {
  gym_id: string;
  trainer_id: string;
  status?: string;
  notes?: string | null;
}

export interface GymTrainerRead {
  id: string;
  gym_id: string;
  trainer_id: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ── Gym Review ──

export interface GymReviewCreate {
  gym_id: string;
  user_id: string;
  rating: number;
  comment?: string | null;
}

export interface GymReviewRead {
  id: string;
  gym_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

// ── Favorite ──

export interface FavoriteCreate {
  user_id: string;
  target_type: string;
  target_id: string;
}

export interface FavoriteRead {
  id: string;
  user_id: string;
  target_type: string;
  target_id: string;
  created_at: string;
}

// ── Audit Log ──

export interface AuditLogRead {
  id: string;
  actor_id: string;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}
