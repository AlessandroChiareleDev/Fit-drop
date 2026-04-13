"use client";

import { Loader2, AlertTriangle, Star, MapPin, Phone, Search, ShieldCheck, Ban, CheckCircle, XCircle } from "lucide-react";
import { useTrainers, useUpdateTrainer } from "@/lib/api";
import { PageHeader } from "@/components/layout";
import { StatusBadge, PriceMono } from "@/components/domain";
import { TrainerOperationalStatus } from "@/lib/api";
import { useState } from "react";

const statusColorMap: Record<TrainerOperationalStatus, "success" | "warning" | "destructive" | "default"> = {
  active: "success",
  pending_review: "warning",
  suspended: "destructive",
  inactive: "default",
};

export default function TrainersPage() {
  const { data: trainers, isLoading, error } = useTrainers();
  const updateTrainer = useUpdateTrainer();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !trainers) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2">
        <AlertTriangle className="size-8 text-destructive" />
        <p className="text-sm text-muted-foreground">Falha ao carregar trainers.</p>
      </div>
    );
  }

  const filtered = trainers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.specialties.some((s) => s.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = !statusFilter || t.operational_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  function handleStatusChange(trainerId: string, status: TrainerOperationalStatus) {
    updateTrainer.mutate({ id: trainerId, data: { operational_status: status } });
  }

  return (
    <>
      <PageHeader
        title="Trainers"
        description={`${trainers.length} profissionais cadastrados`}
      />

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Buscar por nome ou especialidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border-subtle bg-surface px-4 py-2 pl-9 text-sm text-foreground placeholder:text-muted-foreground/40"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-foreground"
        >
          <option value="">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="pending_review">Pendente</option>
          <option value="suspended">Suspenso</option>
          <option value="inactive">Inativo</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((trainer) => (
          <div
            key={trainer.id}
            className="group rounded-xl border border-border-subtle bg-surface p-5 transition-colors hover:bg-surface-elevated"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{trainer.name}</h3>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  {trainer.city}
                </div>
                {trainer.cref_number && (
                  <div className="mt-1 flex items-center gap-1 text-xs text-primary/80">
                    <ShieldCheck className="size-3" />
                    CREF: {trainer.cref_number}
                  </div>
                )}
              </div>
              <StatusBadge
                label={trainer.operational_status.replace("_", " ")}
                color={statusColorMap[trainer.operational_status]}
              />
            </div>

            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="size-3.5 text-warning" />
                <span className="font-mono text-xs tabular-nums">
                  {trainer.avg_rating.toFixed(1)}
                </span>
              </div>
              <span className="text-muted-foreground">·</span>
              <span className="font-mono text-xs tabular-nums">
                {trainer.total_sessions} sessões
              </span>
              <span className="text-muted-foreground">·</span>
              <PriceMono value={trainer.base_price_per_session} className="text-xs" />
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              {trainer.specialties.map((s) => (
                <span
                  key={s}
                  className="rounded-md bg-primary-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary"
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="size-3" />
              {trainer.phone}
            </div>

            {/* Action buttons */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border-subtle pt-3">
              {trainer.operational_status === "pending_review" && (
                <>
                  <button
                    onClick={() => handleStatusChange(trainer.id, TrainerOperationalStatus.ACTIVE)}
                    className="flex items-center gap-1 rounded-lg bg-success/10 px-2 py-1 text-[11px] font-medium text-success hover:bg-success/20 transition-colors"
                  >
                    <CheckCircle className="size-3" />
                    Aprovar
                  </button>
                  <button
                    onClick={() => handleStatusChange(trainer.id, TrainerOperationalStatus.INACTIVE)}
                    className="flex items-center gap-1 rounded-lg bg-destructive/10 px-2 py-1 text-[11px] font-medium text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    <XCircle className="size-3" />
                    Rejeitar
                  </button>
                </>
              )}
              {trainer.operational_status === "active" && (
                <button
                  onClick={() => handleStatusChange(trainer.id, TrainerOperationalStatus.SUSPENDED)}
                  className="flex items-center gap-1 rounded-lg bg-warning/10 px-2 py-1 text-[11px] font-medium text-warning hover:bg-warning/20 transition-colors"
                >
                  <Ban className="size-3" />
                  Suspender
                </button>
              )}
              {trainer.operational_status === "suspended" && (
                <button
                  onClick={() => handleStatusChange(trainer.id, TrainerOperationalStatus.ACTIVE)}
                  className="flex items-center gap-1 rounded-lg bg-success/10 px-2 py-1 text-[11px] font-medium text-success hover:bg-success/20 transition-colors"
                >
                  <CheckCircle className="size-3" />
                  Reativar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
