"use client";

import {
  Loader2,
  AlertTriangle,
  MapPin,
  Star,
  Building2,
  Plus,
  Trash2,
  Edit,
} from "lucide-react";
import { useGyms, useDeleteGym } from "@/lib/api";
import { PageHeader } from "@/components/layout";
import { useState } from "react";
import type { GymRead } from "@/lib/api";

const gymTypeLabels: Record<string, string> = {
  standard: "Academia",
  crossfit: "CrossFit",
  studio: "Estúdio",
  outdoor: "Ao Ar Livre",
  functional: "Funcional",
};

export default function GymsPage() {
  const [search, setSearch] = useState("");
  const { data: gyms, isLoading, error } = useGyms();
  const deleteGym = useDeleteGym();

  const filtered = gyms?.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.neighborhood.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !gyms) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2">
        <AlertTriangle className="size-8 text-destructive" />
        <p className="text-sm text-muted-foreground">
          Falha ao carregar academias.
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Academias"
        description={`${gyms.length} academias cadastradas`}
      />

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por nome ou bairro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border-subtle bg-surface px-4 py-2 pl-9 text-sm text-foreground placeholder:text-muted-foreground/40"
          />
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
        </div>
      </div>

      {/* Gym cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered?.map((gym) => (
          <div
            key={gym.id}
            className="group rounded-xl border border-border-subtle bg-surface p-5 transition-colors hover:bg-surface-elevated"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Building2 className="size-5" />
                </div>
                <div>
                  <h3 className="font-medium">{gym.name}</h3>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3" />
                    {gym.neighborhood}, {gym.city}
                  </div>
                </div>
              </div>
              <span className="rounded-md bg-primary-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                {gymTypeLabels[gym.gym_type] || gym.gym_type}
              </span>
            </div>

            {/* Stats */}
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="size-3.5 text-warning" />
                <span className="font-mono text-xs tabular-nums">
                  {gym.avg_rating.toFixed(1)}
                </span>
              </div>
              <span className="text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">
                {gym.total_reviews} avaliações
              </span>
            </div>

            {/* Description */}
            {gym.description && (
              <p className="mt-3 line-clamp-2 text-xs text-muted-foreground/70">
                {gym.description}
              </p>
            )}

            {/* Actions */}
            <div className="mt-4 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => deleteGym.mutate(gym.id)}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-3" />
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
