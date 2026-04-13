"use client";

import { Star, MapPin, ChevronRight } from "lucide-react";
import type { TrainerRead } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const modalityLabels: Record<string, string> = {
  strength: "Musculação",
  functional: "Funcional",
  running: "Corrida",
  yoga: "Yoga",
  pilates: "Pilates",
  stretching: "Alongamento",
  other: "Outro",
};

export function TrainerCard({
  trainer,
  selected,
  onClick,
}: {
  trainer: TrainerRead;
  selected?: boolean;
  onClick?: () => void;
}) {
  const router = useRouter();

  function handleClick() {
    onClick?.();
  }

  function handleDetailClick(e: React.MouseEvent) {
    e.stopPropagation();
    router.push(`/explore/trainer/${trainer.id}`);
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border p-4 text-left transition-all active:scale-[0.98]",
        selected
          ? "border-primary/40 bg-primary/10 shadow-[0_0_30px_rgba(200,119,64,0.15)]"
          : "border-white/5 bg-white/[0.03] hover:bg-white/[0.06] hover:border-primary/20",
      )}
    >
      {/* Hover gradient */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-primary/5 via-transparent to-transparent" />

      {/* Avatar placeholder */}
      <div className="relative flex size-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10">
        <span className="font-display text-lg font-bold text-primary">
          {trainer.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")}
        </span>
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-medium text-foreground">
            {trainer.name}
          </h3>
          {trainer.operational_status === "active" && (
            <span className="size-2 shrink-0 rounded-full bg-success" />
          )}
        </div>

        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <Star className="size-3 fill-warning text-warning" />
          <span className="font-mono tabular-nums">{trainer.avg_rating.toFixed(1)}</span>
          <span>·</span>
          <span className="font-mono tabular-nums">{trainer.total_sessions} sessões</span>
        </div>

        <div className="mt-1 flex flex-wrap gap-1">
          {trainer.specialties.slice(0, 3).map((s) => (
            <span
              key={s}
              className="rounded-full bg-primary/10 border border-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary/80"
            >
              {modalityLabels[s] ?? s}
            </span>
          ))}
        </div>

        <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
          <MapPin className="size-3" />
          <span className="truncate">
            {trainer.coverage_neighborhoods.slice(0, 2).join(", ")}
          </span>
        </div>
      </div>

      {/* Price + arrow */}
      <div className="relative z-10 flex shrink-0 flex-col items-end gap-1">
        <div className="text-right">
          <span className="font-display text-xl font-bold text-gradient">
            R${trainer.base_price_per_session.toFixed(0)}
          </span>
          <p className="text-[10px] text-muted-foreground/60">/sessão</p>
        </div>
        <ChevronRight
          onClick={handleDetailClick}
          className="size-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors cursor-pointer hover:scale-125"
        />
      </div>
    </button>
  );
}
