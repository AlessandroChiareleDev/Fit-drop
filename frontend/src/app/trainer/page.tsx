"use client";

import { useAuth } from "@/lib/auth";
import { useTrainer, useTrainers, useMatches, useSessions, useAcceptMatch, useDeclineMatch } from "@/lib/api";
import type { MatchRead, SessionRead } from "@/lib/api/types";
import {
  Calendar,
  Star,
  MapPin,
  Clock,
  CheckCircle2,
  TrendingUp,
  LogOut,
  User,
  Dumbbell,
  Loader2,
  Sparkles,
  Settings,
  XCircle,
  PlayCircle,
  Bell,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const modalityPt: Record<string, string> = {
  strength: "Musculação",
  functional: "Funcional",
  running: "Corrida",
  yoga: "Yoga",
  pilates: "Pilates",
  stretching: "Alongamento",
  other: "Outro",
};

const dayNames = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export default function TrainerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const trainerId = user?.trainer_id;
  const { data: trainer, isLoading } = useTrainer(trainerId ?? "");
  const { data: matches } = useMatches(trainerId ? { trainer_id: trainerId, status: "offered" } : undefined);
  const { data: sessions } = useSessions(trainerId ? { trainer_id: trainerId } : undefined);
  const acceptMatch = useAcceptMatch();
  const declineMatch = useDeclineMatch();

  const pendingMatches = matches ?? [];
  const activeSessions = (sessions ?? []).filter((s) => s.status === "confirmed" || s.status === "in_progress");
  const pastSessions = (sessions ?? []).filter((s) => s.status === "completed" || s.status === "cancelled");

  const initials = user?.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "?";

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-primary/6 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 glass-strong border-b border-white/5">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-sm font-bold text-primary-foreground">
              {initials}
            </div>
            <div>
              <h1 className="font-display text-base font-bold text-foreground">
                {user?.name}
              </h1>
              <p className="text-xs text-muted-foreground/70">Painel do Professor</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/trainer/settings"
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-muted-foreground/70 hover:bg-white/5 hover:text-foreground transition-all"
            >
              <Settings className="size-4" />
              Configurações
            </Link>
            <button
              onClick={() => { logout(); router.push("/login"); }}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-muted-foreground/70 hover:bg-white/5 hover:text-foreground transition-all"
            >
              <LogOut className="size-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-4xl space-y-5 px-4 py-6">
        {/* Profile card */}
        {trainer && (
          <div className="glass glass-shine noise rounded-3xl p-6 glow-sm">
            <div className="relative z-10 flex items-start gap-4">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-xl font-bold text-primary-foreground">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-xl font-bold text-foreground">
                  {trainer.name}
                </h2>
                <p className="text-sm text-muted-foreground/70">{trainer.bio}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {trainer.specialties.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-primary/10 border border-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary"
                    >
                      {modalityPt[s] ?? s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1">
                  <Star className="size-4 fill-warning text-warning" />
                  <span className="font-mono text-lg font-bold text-gradient">
                    {trainer.avg_rating.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground/50">
                  {trainer.cref_number}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* KPI Grid */}
        {trainer && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: CheckCircle2, label: "Sessões", value: String(trainer.total_sessions) },
              { icon: TrendingUp, label: "Aceitação", value: `${(trainer.acceptance_rate * 100).toFixed(0)}%` },
              { icon: Clock, label: "Frequência", value: `${(trainer.attendance_rate * 100).toFixed(0)}%` },
              { icon: Dumbbell, label: "Preço/sessão", value: `R$${trainer.base_price_per_session}` },
            ].map((kpi) => (
              <div key={kpi.label} className="group glass glass-shine rounded-2xl p-4 transition-all hover:glow-sm hover:scale-[1.02]">
                <div className="relative z-10 flex items-center gap-2 text-muted-foreground/60">
                  <kpi.icon className="size-4" />
                  <span className="text-xs">{kpi.label}</span>
                </div>
                <p className="relative z-10 mt-1 font-mono text-2xl font-bold text-foreground">
                  {kpi.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Coverage */}
        {trainer && (
          <div className="glass glass-shine noise rounded-3xl p-6 glow-sm">
            <h3 className="relative z-10 flex items-center gap-2 font-display text-base font-semibold text-foreground">
              <MapPin className="size-4 text-primary" />
              Área de Cobertura
            </h3>
            <div className="relative z-10 mt-3 flex flex-wrap gap-2">
              {trainer.coverage_neighborhoods.map((n) => (
                <span
                  key={n}
                  className="rounded-xl border border-white/8 bg-white/5 px-3 py-1.5 text-sm text-foreground/80"
                >
                  {n}
                </span>
              ))}
            </div>
            {trainer.max_travel_radius_km && (
              <p className="relative z-10 mt-2 text-xs text-muted-foreground/50">
                Raio máximo: {trainer.max_travel_radius_km} km
              </p>
            )}
          </div>
        )}

        {/* Status */}
        {trainer && (
          <div className="glass glass-shine noise rounded-3xl p-6 glow-sm">
            <h3 className="relative z-10 flex items-center gap-2 font-display text-base font-semibold text-foreground">
              <Calendar className="size-4 text-primary" />
              Status
            </h3>
            <div className="relative z-10 mt-3 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground/50">Status Operacional</p>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium mt-1 border ${
                  trainer.operational_status === "active"
                    ? "bg-success/10 border-success/20 text-success"
                    : "bg-warning/10 border-warning/20 text-warning"
                }`}>
                  <span className={`size-1.5 rounded-full ${
                    trainer.operational_status === "active" ? "bg-success animate-pulse-glow" : "bg-warning"
                  }`} />
                  {trainer.operational_status === "active" ? "Ativo" : "Pendente"}
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground/50">CREF</p>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium mt-1 border ${
                  trainer.cref_status === "verified"
                    ? "bg-success/10 border-success/20 text-success"
                    : "bg-warning/10 border-warning/20 text-warning"
                }`}>
                  {trainer.cref_status === "verified" ? "Verificado" : "Pendente"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Pending Match Requests */}
        {pendingMatches.length > 0 && (
          <div className="glass glass-shine noise rounded-3xl p-6 glow-sm">
            <h3 className="relative z-10 flex items-center gap-2 font-display text-base font-semibold text-foreground">
              <Bell className="size-4 text-warning" />
              Novas Solicitações ({pendingMatches.length})
            </h3>
            <div className="relative z-10 mt-3 space-y-3">
              {pendingMatches.map((match) => (
                <div key={match.id} className="rounded-2xl bg-white/[0.03] p-4 border border-warning/10">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        Sessão #{match.attempt_number}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Solicitação: {match.request_id.slice(0, 8)}...
                      </p>
                      {match.response_deadline && (
                        <p className="text-xs text-warning">
                          <Clock className="inline size-3 mr-1" />
                          Responder até: {new Date(match.response_deadline).toLocaleString("pt-BR")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => declineMatch.mutate(match.id)}
                        disabled={declineMatch.isPending}
                        className="flex items-center gap-1 rounded-xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/20 transition-all"
                      >
                        <XCircle className="size-3.5" />
                        Recusar
                      </button>
                      <button
                        onClick={() => acceptMatch.mutate(match.id)}
                        disabled={acceptMatch.isPending}
                        className="flex items-center gap-1 rounded-xl bg-success/10 px-3 py-2 text-xs font-medium text-success hover:bg-success/20 transition-all"
                      >
                        <CheckCircle2 className="size-3.5" />
                        Aceitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Sessions */}
        {activeSessions.length > 0 && (
          <div className="glass glass-shine noise rounded-3xl p-6 glow-sm">
            <h3 className="relative z-10 flex items-center gap-2 font-display text-base font-semibold text-foreground">
              <PlayCircle className="size-4 text-success" />
              Sessões Ativas ({activeSessions.length})
            </h3>
            <div className="relative z-10 mt-3 space-y-3">
              {activeSessions.map((session) => (
                <div key={session.id} className="rounded-2xl bg-white/[0.03] p-4 border border-success/10">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="size-3" />
                        {new Date(session.scheduled_date + "T00:00:00").toLocaleDateString("pt-BR")}
                        <Clock className="size-3 ml-2" />
                        {session.scheduled_time_start.slice(0, 5)} – {session.scheduled_time_end.slice(0, 5)}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3" />
                        {session.venue_name || session.venue_type}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium ${
                        session.status === "in_progress"
                          ? "bg-primary/20 text-primary"
                          : "bg-success/20 text-success"
                      }`}>
                        {session.status === "in_progress" ? "Em andamento" : "Confirmada"}
                      </span>
                      <p className="mt-1 font-mono text-sm font-bold tabular-nums">
                        R$ {session.trainer_payout_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Sessions */}
        {pastSessions.length > 0 && (
          <div className="glass glass-shine noise rounded-3xl p-6 glow-sm">
            <h3 className="relative z-10 flex items-center gap-2 font-display text-base font-semibold text-foreground">
              <CheckCircle2 className="size-4 text-muted-foreground" />
              Histórico ({pastSessions.length})
            </h3>
            <div className="relative z-10 mt-3 space-y-2">
              {pastSessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between rounded-xl bg-white/[0.02] px-3 py-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {new Date(session.scheduled_date + "T00:00:00").toLocaleDateString("pt-BR")}
                    </span>
                    <span className={`inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                      session.status === "completed" ? "bg-emerald-500/15 text-emerald-400" : "bg-destructive/15 text-destructive"
                    }`}>
                      {session.status === "completed" ? "Concluída" : "Cancelada"}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold tabular-nums text-muted-foreground">
                    R$ {session.trainer_payout_amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!trainer && (
          <div className="glass glass-shine noise rounded-3xl p-8 text-center glow-sm">
            <User className="relative z-10 mx-auto size-12 text-muted-foreground/40" />
            <h3 className="relative z-10 mt-3 font-display text-lg font-bold text-foreground">
              Perfil não vinculado
            </h3>
            <p className="relative z-10 mt-1 text-sm text-muted-foreground/60">
              Seu perfil de professor ainda não foi vinculado. Contacte o admin.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
