"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import type {
  UserCreate,
  UserUpdate,
  TrainerCreate,
  TrainerUpdate,
  TrainerAvailabilityCreate,
  SessionRequestCreate,
  SessionRequestUpdateStatus,
  MatchCreate,
  MatchUpdateStatus,
  SessionUpdateStatus,
  PaymentCreate,
  PaymentUpdateStatus,
  PayoutCreate,
  PayoutUpdateStatus,
  ReviewCreate,
  IncidentCreate,
  IncidentUpdate,
  GymCreate,
  GymUpdate,
  CouponCreate,
  CouponUpdate,
  GymTrainerCreate,
  GymReviewCreate,
  FavoriteCreate,
} from "./types";

// ── Dashboard ──

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: api.dashboard.overview,
  });
}

// ── Users ──

export function useUsers() {
  return useQuery({ queryKey: ["users"], queryFn: api.users.list });
}

export function useUser(id: string) {
  return useQuery({ queryKey: ["users", id], queryFn: () => api.users.get(id) });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UserCreate) => api.users.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdate }) =>
      api.users.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.users.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

// ── Trainers ──

export function useTrainers() {
  return useQuery({ queryKey: ["trainers"], queryFn: api.trainers.list });
}

export function useTrainer(id: string) {
  return useQuery({ queryKey: ["trainers", id], queryFn: () => api.trainers.get(id) });
}

export function useCreateTrainer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TrainerCreate) => api.trainers.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trainers"] }),
  });
}

export function useUpdateTrainer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TrainerUpdate }) =>
      api.trainers.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trainers"] }),
  });
}

export function useTrainerAvailabilities(trainerId: string) {
  return useQuery({
    queryKey: ["trainers", trainerId, "availabilities"],
    queryFn: () => api.trainers.availabilities(trainerId),
  });
}

export function useAddAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ trainerId, data }: { trainerId: string; data: TrainerAvailabilityCreate }) =>
      api.trainers.addAvailability(trainerId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trainers"] }),
  });
}

// ── Session Requests ──

export function useSessionRequests(params?: { user_id?: string; status?: string }) {
  return useQuery({ queryKey: ["session-requests", params], queryFn: () => api.sessionRequests.list(params) });
}

export function useSessionRequest(id: string) {
  return useQuery({
    queryKey: ["session-requests", id],
    queryFn: () => api.sessionRequests.get(id),
  });
}

export function useCreateSessionRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SessionRequestCreate) => api.sessionRequests.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["session-requests"] }),
  });
}

export function useUpdateSessionRequestStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SessionRequestUpdateStatus }) =>
      api.sessionRequests.updateStatus(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["session-requests"] }),
  });
}

// ── Matches ──

export function useMatches(params?: { trainer_id?: string; status?: string; request_id?: string }) {
  return useQuery({ queryKey: ["matches", params], queryFn: () => api.matches.list(params) });
}

export function useMatchesByRequest(requestId: string) {
  return useQuery({
    queryKey: ["matches", "by-request", requestId],
    queryFn: () => api.matches.byRequest(requestId),
  });
}

export function useCreateMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MatchCreate) => api.matches.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["matches"] }),
  });
}

export function useUpdateMatchStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MatchUpdateStatus }) =>
      api.matches.updateStatus(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["matches"] }),
  });
}

// ── Sessions ──

export function useSessions(params?: { user_id?: string; trainer_id?: string; status?: string }) {
  return useQuery({ queryKey: ["sessions", params], queryFn: () => api.sessions.list(params) });
}

export function useSession(id: string) {
  return useQuery({ queryKey: ["sessions", id], queryFn: () => api.sessions.get(id) });
}

export function useUpdateSessionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SessionUpdateStatus }) =>
      api.sessions.updateStatus(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
}

// ── Payments ──

export function usePayments() {
  return useQuery({ queryKey: ["payments"], queryFn: api.payments.list });
}

export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PaymentCreate) => api.payments.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payments"] }),
  });
}

export function useUpdatePaymentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PaymentUpdateStatus }) =>
      api.payments.updateStatus(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payments"] }),
  });
}

// ── Payouts ──

export function usePayouts() {
  return useQuery({ queryKey: ["payouts"], queryFn: api.payouts.list });
}

export function useCreatePayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: PayoutCreate) => api.payouts.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payouts"] }),
  });
}

export function useUpdatePayoutStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PayoutUpdateStatus }) =>
      api.payouts.updateStatus(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payouts"] }),
  });
}

// ── Reviews ──

export function useReviews() {
  return useQuery({ queryKey: ["reviews"], queryFn: api.reviews.list });
}

export function useReviewsByTrainer(trainerId: string | undefined) {
  return useQuery({
    queryKey: ["reviews", "trainer", trainerId],
    queryFn: () => api.reviews.byTrainer(trainerId!),
    enabled: !!trainerId,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ReviewCreate) => api.reviews.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

// ── Incidents ──

export function useIncidents() {
  return useQuery({ queryKey: ["incidents"], queryFn: api.incidents.list });
}

export function useCreateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: IncidentCreate) => api.incidents.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["incidents"] }),
  });
}

export function useUpdateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IncidentUpdate }) =>
      api.incidents.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["incidents"] }),
  });
}

// ── Orchestration ──

export function useOfferMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (matchId: string) => api.orchestration.offerMatch(matchId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      qc.invalidateQueries({ queryKey: ["session-requests"] });
    },
  });
}

export function useAcceptMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (matchId: string) => api.orchestration.acceptMatch(matchId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["matches"] });
      qc.invalidateQueries({ queryKey: ["session-requests"] });
    },
  });
}

export function useDeclineMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (matchId: string) => api.orchestration.declineMatch(matchId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["matches"] }),
  });
}

export function useConfirmPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (paymentId: string) => api.orchestration.confirmPayment(paymentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useCompleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => api.orchestration.completeSession(sessionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// ── Gyms ──

export function useGyms(params?: { city?: string; gym_type?: string; owner_id?: string }) {
  return useQuery({
    queryKey: ["gyms", params],
    queryFn: () => api.gyms.list(params),
  });
}

export function useGym(id: string | undefined) {
  return useQuery({
    queryKey: ["gyms", id],
    queryFn: () => api.gyms.get(id!),
    enabled: !!id,
  });
}

export function useCreateGym() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: GymCreate) => api.gyms.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gyms"] }),
  });
}

export function useUpdateGym() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: GymUpdate }) => api.gyms.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gyms"] }),
  });
}

export function useDeleteGym() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.gyms.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gyms"] }),
  });
}

// ── Coupons ──

export function useCoupons(params?: { gym_id?: string; active_only?: boolean }) {
  return useQuery({
    queryKey: ["coupons", params],
    queryFn: () => api.coupons.list(params),
  });
}

export function useCoupon(id: string | undefined) {
  return useQuery({
    queryKey: ["coupons", id],
    queryFn: () => api.coupons.get(id!),
    enabled: !!id,
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CouponCreate) => api.coupons.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons"] }),
  });
}

export function useUpdateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CouponUpdate }) => api.coupons.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons"] }),
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.coupons.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["coupons"] }),
  });
}

// ── Gym Trainers ──

export function useGymTrainers(params?: { gym_id?: string; trainer_id?: string }) {
  return useQuery({
    queryKey: ["gym-trainers", params],
    queryFn: () => api.gymTrainers.list(params),
  });
}

export function useCreateGymTrainer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: GymTrainerCreate) => api.gymTrainers.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gym-trainers"] }),
  });
}

export function useDeleteGymTrainer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.gymTrainers.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["gym-trainers"] }),
  });
}

// ── Gym Reviews ──

export function useGymReviews(gymId: string | undefined) {
  return useQuery({
    queryKey: ["gym-reviews", gymId],
    queryFn: () => api.gymReviews.list(gymId!),
    enabled: !!gymId,
  });
}

export function useCreateGymReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: GymReviewCreate) => api.gymReviews.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gym-reviews"] });
      qc.invalidateQueries({ queryKey: ["gyms"] });
    },
  });
}

// ── Favorites ──

export function useFavorites(userId: string | undefined) {
  return useQuery({
    queryKey: ["favorites", userId],
    queryFn: () => api.favorites.list(userId!),
    enabled: !!userId,
  });
}

export function useAddFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: FavoriteCreate) => api.favorites.add(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });
}

export function useRemoveFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.favorites.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });
}

// ── Audit Logs ──

export function useAuditLogs(params?: { actor_id?: string; entity_type?: string; action?: string }) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => api.auditLogs.list(params),
  });
}

// ── Uploads ──

export function useUploadFile() {
  return useMutation({
    mutationFn: (file: File) => api.uploads.upload(file),
  });
}
