const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";

class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`API ${status}`);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Generic CRUD helpers ──

function get<T>(path: string) {
  return request<T>(path);
}

function post<T>(path: string, body: unknown) {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
}

function put<T>(path: string, body: unknown) {
  return request<T>(path, { method: "PUT", body: JSON.stringify(body) });
}

function patch<T>(path: string, body: unknown) {
  return request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
}

function del<T = void>(path: string) {
  return request<T>(path, { method: "DELETE" });
}

// ── API methods ──

import type {
  UserRead,
  UserCreate,
  UserUpdate,
  LoginRequest,
  LoginResponse,
  TrainerRead,
  TrainerCreate,
  TrainerUpdate,
  TrainerAvailabilityRead,
  TrainerAvailabilityCreate,
  SessionRequestRead,
  SessionRequestCreate,
  SessionRequestUpdateStatus,
  MatchRead,
  MatchCreate,
  MatchUpdateStatus,
  SessionRead,
  SessionCreate,
  SessionUpdateStatus,
  PaymentRead,
  PaymentCreate,
  PaymentUpdateStatus,
  PayoutRead,
  PayoutCreate,
  PayoutUpdateStatus,
  ReviewRead,
  ReviewCreate,
  IncidentRead,
  IncidentCreate,
  IncidentUpdate,
  DashboardOverview,
  GymRead,
  GymCreate,
  GymUpdate,
  CouponRead,
  CouponCreate,
  CouponUpdate,
  GymTrainerRead,
  GymTrainerCreate,
  GymReviewRead,
  GymReviewCreate,
  FavoriteRead,
  FavoriteCreate,
  AuditLogRead,
} from "./types";

export const api = {
  // Auth
  auth: {
    login: (data: LoginRequest) => post<LoginResponse>("/users/login", data),
    me: (token: string) => get<UserRead>(`/users/me/${token}`),
  },

  // Users
  users: {
    list: () => get<UserRead[]>("/users/"),
    get: (id: string) => get<UserRead>(`/users/${id}`),
    create: (data: UserCreate) => post<UserRead>("/users/", data),
    update: (id: string, data: UserUpdate) => put<UserRead>(`/users/${id}`, data),
    delete: (id: string) => del(`/users/${id}`),
  },

  // Trainers
  trainers: {
    list: () => get<TrainerRead[]>("/trainers/"),
    get: (id: string) => get<TrainerRead>(`/trainers/${id}`),
    create: (data: TrainerCreate) => post<TrainerRead>("/trainers/", data),
    update: (id: string, data: TrainerUpdate) => put<TrainerRead>(`/trainers/${id}`, data),
    delete: (id: string) => del(`/trainers/${id}`),
    availabilities: (id: string) =>
      get<TrainerAvailabilityRead[]>(`/trainers/${id}/availabilities`),
    addAvailability: (id: string, data: TrainerAvailabilityCreate) =>
      post<TrainerAvailabilityRead>(`/trainers/${id}/availabilities`, data),
    deleteAvailability: (trainerId: string, availId: string) =>
      del(`/trainers/${trainerId}/availabilities/${availId}`),
  },

  // Session Requests
  sessionRequests: {
    list: (params?: { user_id?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.user_id) q.set("user_id", params.user_id);
      if (params?.status) q.set("status", params.status);
      const qs = q.toString();
      return get<SessionRequestRead[]>(`/session-requests/${qs ? `?${qs}` : ""}`);
    },
    get: (id: string) => get<SessionRequestRead>(`/session-requests/${id}`),
    create: (data: SessionRequestCreate) =>
      post<SessionRequestRead>("/session-requests/", data),
    updateStatus: (id: string, data: SessionRequestUpdateStatus) =>
      patch<SessionRequestRead>(`/session-requests/${id}/status`, data),
  },

  // Matches
  matches: {
    list: (params?: { trainer_id?: string; status?: string; request_id?: string }) => {
      const q = new URLSearchParams();
      if (params?.trainer_id) q.set("trainer_id", params.trainer_id);
      if (params?.status) q.set("status", params.status);
      if (params?.request_id) q.set("request_id", params.request_id);
      const qs = q.toString();
      return get<MatchRead[]>(`/matches/${qs ? `?${qs}` : ""}`);
    },
    get: (id: string) => get<MatchRead>(`/matches/${id}`),
    create: (data: MatchCreate) => post<MatchRead>("/matches/", data),
    updateStatus: (id: string, data: MatchUpdateStatus) =>
      patch<MatchRead>(`/matches/${id}/status`, data),
    byRequest: (requestId: string) => get<MatchRead[]>(`/matches/by-request/${requestId}`),
  },

  // Sessions
  sessions: {
    list: (params?: { user_id?: string; trainer_id?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.user_id) q.set("user_id", params.user_id);
      if (params?.trainer_id) q.set("trainer_id", params.trainer_id);
      if (params?.status) q.set("status", params.status);
      const qs = q.toString();
      return get<SessionRead[]>(`/sessions/${qs ? `?${qs}` : ""}`);
    },
    get: (id: string) => get<SessionRead>(`/sessions/${id}`),
    create: (data: SessionCreate) => post<SessionRead>("/sessions/", data),
    updateStatus: (id: string, data: SessionUpdateStatus) =>
      patch<SessionRead>(`/sessions/${id}/status`, data),
  },

  // Payments
  payments: {
    list: () => get<PaymentRead[]>("/payments/"),
    get: (id: string) => get<PaymentRead>(`/payments/${id}`),
    create: (data: PaymentCreate) => post<PaymentRead>("/payments/", data),
    updateStatus: (id: string, data: PaymentUpdateStatus) =>
      patch<PaymentRead>(`/payments/${id}/status`, data),
  },

  // Payouts
  payouts: {
    list: () => get<PayoutRead[]>("/payouts/"),
    get: (id: string) => get<PayoutRead>(`/payouts/${id}`),
    create: (data: PayoutCreate) => post<PayoutRead>("/payouts/", data),
    updateStatus: (id: string, data: PayoutUpdateStatus) =>
      patch<PayoutRead>(`/payouts/${id}/status`, data),
  },

  // Reviews
  reviews: {
    list: () => get<ReviewRead[]>("/reviews/"),
    get: (id: string) => get<ReviewRead>(`/reviews/${id}`),
    create: (data: ReviewCreate) => post<ReviewRead>("/reviews/", data),
    byTrainer: (trainerId: string) => get<ReviewRead[]>(`/reviews/trainer/${trainerId}`),
    bySession: (sessionId: string) => get<ReviewRead[]>(`/reviews/session/${sessionId}`),
  },

  // Incidents
  incidents: {
    list: () => get<IncidentRead[]>("/incidents/"),
    get: (id: string) => get<IncidentRead>(`/incidents/${id}`),
    create: (data: IncidentCreate) => post<IncidentRead>("/incidents/", data),
    update: (id: string, data: IncidentUpdate) =>
      patch<IncidentRead>(`/incidents/${id}`, data),
  },

  // Orchestration
  orchestration: {
    offerMatch: (matchId: string) => post<MatchRead>(`/orchestration/offer-match/${matchId}`, {}),
    acceptMatch: (matchId: string) =>
      post<MatchRead>(`/orchestration/accept-match/${matchId}`, {}),
    declineMatch: (matchId: string) =>
      post<MatchRead>(`/orchestration/decline-match/${matchId}`, {}),
    confirmPayment: (paymentId: string) =>
      post<SessionRead>(`/orchestration/confirm-payment/${paymentId}`, {}),
    completeSession: (sessionId: string) =>
      post<SessionRead>(`/orchestration/complete-session/${sessionId}`, {}),
  },

  // Dashboard
  dashboard: {
    overview: () => get<DashboardOverview>("/dashboard/overview"),
  },

  // Gyms
  gyms: {
    list: (params?: { city?: string; gym_type?: string; owner_id?: string }) => {
      const q = new URLSearchParams();
      if (params?.city) q.set("city", params.city);
      if (params?.gym_type) q.set("gym_type", params.gym_type);
      if (params?.owner_id) q.set("owner_id", params.owner_id);
      const qs = q.toString();
      return get<GymRead[]>(`/gyms/${qs ? `?${qs}` : ""}`);
    },
    get: (id: string) => get<GymRead>(`/gyms/${id}`),
    create: (data: GymCreate) => post<GymRead>("/gyms/", data),
    update: (id: string, data: GymUpdate) => patch<GymRead>(`/gyms/${id}`, data),
    delete: (id: string) => del<void>(`/gyms/${id}`),
  },

  // Coupons
  coupons: {
    list: (params?: { gym_id?: string; active_only?: boolean }) => {
      const q = new URLSearchParams();
      if (params?.gym_id) q.set("gym_id", params.gym_id);
      if (params?.active_only) q.set("active_only", "true");
      const qs = q.toString();
      return get<CouponRead[]>(`/coupons/${qs ? `?${qs}` : ""}`);
    },
    get: (id: string) => get<CouponRead>(`/coupons/${id}`),
    getByCode: (code: string) => get<CouponRead>(`/coupons/code/${code}`),
    create: (data: CouponCreate) => post<CouponRead>("/coupons/", data),
    update: (id: string, data: CouponUpdate) => patch<CouponRead>(`/coupons/${id}`, data),
    delete: (id: string) => del<void>(`/coupons/${id}`),
  },

  // Gym Trainers
  gymTrainers: {
    list: (params?: { gym_id?: string; trainer_id?: string }) => {
      const q = new URLSearchParams();
      if (params?.gym_id) q.set("gym_id", params.gym_id);
      if (params?.trainer_id) q.set("trainer_id", params.trainer_id);
      const qs = q.toString();
      return get<GymTrainerRead[]>(`/gym-trainers/${qs ? `?${qs}` : ""}`);
    },
    create: (data: GymTrainerCreate) => post<GymTrainerRead>("/gym-trainers/", data),
    delete: (id: string) => del<void>(`/gym-trainers/${id}`),
  },

  // Gym Reviews
  gymReviews: {
    list: (gymId: string) => get<GymReviewRead[]>(`/gym-reviews/?gym_id=${gymId}`),
    create: (data: GymReviewCreate) => post<GymReviewRead>("/gym-reviews/", data),
  },

  // Favorites
  favorites: {
    list: (userId: string) => get<FavoriteRead[]>(`/favorites/?user_id=${userId}`),
    add: (data: FavoriteCreate) => post<FavoriteRead>("/favorites/", data),
    remove: (id: string) => del<void>(`/favorites/${id}`),
  },

  // Audit Logs
  auditLogs: {
    list: (params?: { actor_id?: string; entity_type?: string; action?: string }) => {
      const q = new URLSearchParams();
      if (params?.actor_id) q.set("actor_id", params.actor_id);
      if (params?.entity_type) q.set("entity_type", params.entity_type);
      if (params?.action) q.set("action", params.action);
      const qs = q.toString();
      return get<AuditLogRead[]>(`/audit-logs/${qs ? `?${qs}` : ""}`);
    },
  },

  // Uploads
  uploads: {
    upload: async (file: File): Promise<{ url: string; filename: string }> => {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_BASE}/uploads/`, {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new ApiError(res.status, body);
      }
      return res.json();
    },
  },
} as const;

export { ApiError };
