"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Loader2,
  Dumbbell,
  CheckCircle2,
  XCircle,
  PlayCircle,
  AlertCircle,
} from "lucide-react";
import { useSessionRequests, useSessions } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { SessionRequestRead, SessionRead } from "@/lib/api/types";

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  submitted: { label: "Enviada", color: "bg-blue-500/20 text-blue-400", icon: <Clock className="size-3.5" /> },
  matching: { label: "Buscando trainer", color: "bg-warning/20 text-warning", icon: <Loader2 className="size-3.5 animate-spin" /> },
  awaiting_payment: { label: "Aguardando pagamento", color: "bg-chart-5/20 text-chart-5", icon: <AlertCircle className="size-3.5" /> },
  confirmed: { label: "Confirmada", color: "bg-success/20 text-success", icon: <CheckCircle2 className="size-3.5" /> },
  in_progress: { label: "Em andamento", color: "bg-primary/20 text-primary", icon: <PlayCircle className="size-3.5" /> },
  completed: { label: "Concluída", color: "bg-emerald-500/20 text-emerald-400", icon: <CheckCircle2 className="size-3.5" /> },
  cancelled: { label: "Cancelada", color: "bg-destructive/20 text-destructive", icon: <XCircle className="size-3.5" /> },
  expired: { label: "Expirada", color: "bg-muted-foreground/20 text-muted-foreground", icon: <XCircle className="size-3.5" /> },
};

const modalityPt: Record<string, string> = {
  strength: "Musculação",
  functional: "Funcional",
  running: "Corrida",
  yoga: "Yoga",
  pilates: "Pilates",
  stretching: "Alongamento",
  other: "Outro",
};

const venuePt: Record<string, string> = {
  gym: "Academia",
  outdoor: "Ao ar livre",
  hotel: "Hotel",
  residence: "Residência",
  flexible: "Flexível",
};

export default function StudentSessionsPage() {
  const { user } = useAuth();
  const { data: requests, isLoading: loadingRequests } = useSessionRequests(
    user ? { user_id: user.id } : undefined,
  );
  const { data: sessions, isLoading: loadingSessions } = useSessions(
    user ? { user_id: user.id } : undefined,
  );

  const isLoading = loadingRequests || loadingSessions;

  // Merge requests and sessions into a unified timeline
  const activeRequests = (requests ?? []).filter(
    (r) => !["completed", "cancelled", "expired"].includes(r.status),
  );
  const pastRequests = (requests ?? []).filter((r) =>
    ["completed", "cancelled", "expired"].includes(r.status),
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-strong border-b border-white/5">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <Link
            href="/explore"
            className="glass rounded-full p-3 transition-transform hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="size-5 text-foreground" />
          </Link>
          <h1 className="font-display text-lg font-bold">Minhas Sessões</h1>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Active sessions  */}
            {(sessions ?? []).filter((s) => s.status === "confirmed" || s.status === "in_progress").length > 0 && (
              <section>
                <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-primary mb-3">
                  Sessões Confirmadas
                </h2>
                <div className="space-y-3">
                  {(sessions ?? [])
                    .filter((s) => s.status === "confirmed" || s.status === "in_progress")
                    .map((session) => (
                      <SessionCard key={session.id} session={session} />
                    ))}
                </div>
              </section>
            )}

            {/* Pending requests */}
            {activeRequests.length > 0 && (
              <section>
                <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-warning mb-3">
                  Solicitações em Andamento
                </h2>
                <div className="space-y-3">
                  {activeRequests.map((req) => (
                    <RequestCard key={req.id} request={req} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {activeRequests.length === 0 &&
              (sessions ?? []).filter((s) => s.status !== "completed" && s.status !== "cancelled").length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Calendar className="size-12 text-muted-foreground/30" />
                  <h3 className="mt-4 font-display text-lg font-bold">Nenhuma sessão agendada</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Encontre um profissional no mapa e agende sua primeira sessão.
                  </p>
                  <Link
                    href="/explore"
                    className="mt-4 rounded-2xl bg-gradient-to-r from-primary to-primary-hover px-6 py-3 text-sm font-bold text-primary-foreground transition-all hover:brightness-110"
                  >
                    Explorar Mapa
                  </Link>
                </div>
              )}

            {/* Past */}
            {((sessions ?? []).filter((s) => s.status === "completed" || s.status === "cancelled").length > 0 || pastRequests.length > 0) && (
              <section>
                <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Histórico
                </h2>
                <div className="space-y-3">
                  {(sessions ?? [])
                    .filter((s) => s.status === "completed" || s.status === "cancelled")
                    .map((session) => (
                      <SessionCard key={session.id} session={session} />
                    ))}
                  {pastRequests.map((req) => (
                    <RequestCard key={req.id} request={req} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function RequestCard({ request }: { request: SessionRequestRead }) {
  const cfg = statusConfig[request.status] ?? statusConfig.submitted;
  return (
    <div className="glass rounded-2xl p-4 transition-all hover:bg-white/[0.03]">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Dumbbell className="size-4 text-primary" />
            <span className="text-sm font-medium">
              {modalityPt[request.modality] || request.modality}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {new Date(request.requested_date + "T00:00:00").toLocaleDateString("pt-BR")}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {request.requested_time_start.slice(0, 5)} – {request.requested_time_end.slice(0, 5)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" />
            {request.neighborhood} · {venuePt[request.venue_type] || request.venue_type}
          </div>
        </div>
        <span className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium ${cfg.color}`}>
          {cfg.icon}
          {cfg.label}
        </span>
      </div>
    </div>
  );
}

function SessionCard({ session }: { session: SessionRead }) {
  const cfg = statusConfig[session.status] ?? statusConfig.confirmed;
  return (
    <div className="glass glass-shine rounded-2xl p-4 transition-all hover:bg-white/[0.03]">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-success" />
            <span className="text-sm font-medium">Sessão Confirmada</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {new Date(session.scheduled_date + "T00:00:00").toLocaleDateString("pt-BR")}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {session.scheduled_time_start.slice(0, 5)} – {session.scheduled_time_end.slice(0, 5)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" />
            {venuePt[session.venue_type] || session.venue_type}
            {session.venue_name && ` · ${session.venue_name}`}
          </div>
        </div>
        <div className="text-right">
          <span className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium ${cfg.color}`}>
            {cfg.icon}
            {cfg.label}
          </span>
          <p className="mt-1 font-mono text-sm font-bold tabular-nums text-foreground">
            R$ {session.gross_amount.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
