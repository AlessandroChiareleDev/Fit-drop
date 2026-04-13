"use client";

import { useEffect } from "react";
import {
  X,
  Star,
  MapPin,
  Clock,
  Users,
  ChevronRight,
  ChevronLeft,
  Dumbbell,
  Building2,
  TreePine,
} from "lucide-react";
import type { TrainerRead, GymRead, GymTrainerRead } from "@/lib/api";
import { useGymTrainers, useTrainers } from "@/lib/api";
import { useRouter } from "next/navigation";
import type { MapMarkerSelection } from "./map-view";

const modalityLabels: Record<string, string> = {
  strength: "Musculação",
  functional: "Funcional",
  running: "Corrida",
  yoga: "Yoga",
  pilates: "Pilates",
  stretching: "Alongamento",
  other: "Outro",
};

const gymTypeLabels: Record<string, { label: string; icon: typeof Building2 }> = {
  gym: { label: "Academia", icon: Building2 },
  outdoor: { label: "Ao ar livre", icon: TreePine },
  studio: { label: "Estúdio", icon: Dumbbell },
};

const dayLabels: Record<string, string> = {
  monday: "Segunda",
  tuesday: "Terça",
  wednesday: "Quarta",
  thursday: "Quinta",
  friday: "Sexta",
  saturday: "Sábado",
  sunday: "Domingo",
};

interface MapSidePanelProps {
  selection: MapMarkerSelection;
  trainers: TrainerRead[];
  gyms: GymRead[];
  onClose: () => void;
}

export function MapSidePanel({ selection, trainers, gyms, onClose }: MapSidePanelProps) {
  const router = useRouter();
  const isOpen = !!selection;

  // Fetch gym trainers when a gym is selected
  const gymId = selection?.type === "gym" ? selection.id : undefined;
  const { data: gymTrainerLinks } = useGymTrainers(
    gymId ? { gym_id: gymId } : undefined,
  );

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const selectedTrainer =
    selection?.type === "trainer"
      ? trainers.find((t) => t.id === selection.id)
      : null;

  const selectedGym =
    selection?.type === "gym"
      ? gyms.find((g) => g.id === selection.id)
      : null;

  // Resolve trainer objects for the gym
  const gymTrainers = (gymTrainerLinks ?? [])
    .map((link: GymTrainerRead) => trainers.find((t) => t.id === link.trainer_id))
    .filter(Boolean) as TrainerRead[];

  return (
    <>
      {/* Backdrop (mobile - click to close) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[2px] md:hidden"
          onClick={onClose}
        />
      )}

      {/* Side panel */}
      <div
        className={`fixed right-0 top-0 z-40 h-full w-full max-w-sm transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col glass-strong noise overflow-hidden border-l border-white/5">
          {/* Close / back button */}
          <button
            onClick={onClose}
            className="absolute left-3 top-3 z-50 flex h-10 items-center gap-1.5 rounded-full bg-black/60 pl-2.5 pr-4 text-sm font-medium text-white backdrop-blur-md transition-colors active:bg-black/80"
          >
            <ChevronLeft className="size-5" />
            Voltar
          </button>

          <div className="relative z-10 flex-1 overflow-y-auto">
            {selectedGym && (
              <GymPanel
                gym={selectedGym}
                gymTrainers={gymTrainers}
                onTrainerClick={(id) => router.push(`/explore/trainer/${id}`)}
                onViewDetail={() => router.push(`/explore/gym/${selectedGym.id}`)}
              />
            )}
            {selectedTrainer && (
              <TrainerPanel
                trainer={selectedTrainer}
                onViewDetail={() => router.push(`/explore/trainer/${selectedTrainer.id}`)}
                onBook={() => router.push(`/explore/book/${selectedTrainer.id}`)}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Gym Panel ──

function GymPanel({
  gym,
  gymTrainers,
  onTrainerClick,
  onViewDetail,
}: {
  gym: GymRead;
  gymTrainers: TrainerRead[];
  onTrainerClick: (id: string) => void;
  onViewDetail: () => void;
}) {
  const typeInfo = gymTypeLabels[gym.gym_type] ?? gymTypeLabels.gym;
  const TypeIcon = typeInfo.icon;

  return (
    <div className="pb-8">
      {/* Hero image */}
      {gym.photo_url ? (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={gym.photo_url}
            alt={gym.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>
      ) : (
        <div className="relative flex h-48 w-full items-center justify-center bg-gradient-to-br from-primary/20 via-surface to-surface-elevated">
          <TypeIcon className="size-16 text-primary/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      {/* Main info */}
      <div className="px-5 -mt-8 relative z-10">
        <div className="rounded-2xl glass glass-shine p-5 glow-sm">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-lg font-bold text-foreground leading-tight">
                {gym.name}
              </h2>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="size-3 text-primary/60" />
                <span>{gym.neighborhood}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1">
              <TypeIcon className="size-3.5 text-primary" />
              <span className="text-[11px] font-medium text-primary">{typeInfo.label}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Star className="size-4 fill-warning text-warning" />
              <span className="font-mono text-sm font-semibold text-foreground">
                {gym.avg_rating.toFixed(1)}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {gym.total_reviews} {gym.total_reviews === 1 ? "avaliação" : "avaliações"}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      {gym.description && (
        <div className="px-5 mt-4">
          <p className="text-sm leading-relaxed text-muted-foreground">{gym.description}</p>
        </div>
      )}

      {/* Operating Hours */}
      {Object.keys(gym.operating_hours).length > 0 && (
        <div className="px-5 mt-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="size-4 text-primary/70" />
            <h3 className="text-sm font-semibold text-foreground">Horário de funcionamento</h3>
          </div>
          <div className="space-y-1.5">
            {Object.entries(gym.operating_hours).map(([day, hours]) => (
              <div
                key={day}
                className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/5 px-3 py-2"
              >
                <span className="text-xs font-medium text-muted-foreground">
                  {dayLabels[day] ?? day}
                </span>
                <span className="font-mono text-xs text-foreground">{hours}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Amenities */}
      {gym.amenities.length > 0 && (
        <div className="px-5 mt-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Comodidades</h3>
          <div className="flex flex-wrap gap-1.5">
            {gym.amenities.map((a) => (
              <span
                key={a}
                className="rounded-full bg-primary/10 border border-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary/80"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Trainers at this gym */}
      <div className="px-5 mt-5">
        <div className="flex items-center gap-2 mb-3">
          <Users className="size-4 text-primary/70" />
          <h3 className="text-sm font-semibold text-foreground">
            Profissionais disponíveis
            {gymTrainers.length > 0 && (
              <span className="ml-1.5 font-normal text-muted-foreground">
                ({gymTrainers.length})
              </span>
            )}
          </h3>
        </div>

        {gymTrainers.length === 0 ? (
          <p className="text-xs text-muted-foreground/60 py-3">
            Nenhum profissional vinculado ainda.
          </p>
        ) : (
          <div className="space-y-2">
            {gymTrainers.map((t) => (
              <button
                key={t.id}
                onClick={() => onTrainerClick(t.id)}
                className="group flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-3 text-left transition-all hover:bg-white/[0.06] hover:border-primary/20"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/10">
                  <span className="text-xs font-bold text-primary">
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{t.name}</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Star className="size-3 fill-warning text-warning" />
                    <span className="font-mono">{t.avg_rating.toFixed(1)}</span>
                    <span>·</span>
                    <span className="font-mono">{t.total_sessions} sessões</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gradient">
                  R${t.base_price_per_session.toFixed(0)}
                </span>
                <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* View detail CTA */}
      <div className="px-5 mt-6">
        <button
          onClick={onViewDetail}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary-hover px-4 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
          Ver detalhes completos
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}

// ── Trainer Panel ──

function TrainerPanel({
  trainer,
  onViewDetail,
  onBook,
}: {
  trainer: TrainerRead;
  onViewDetail: () => void;
  onBook: () => void;
}) {
  const initials = trainer.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="relative flex h-36 w-full items-center justify-center bg-gradient-to-br from-primary/20 via-surface to-surface-elevated">
        <div className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/20">
          <span className="font-display text-2xl font-bold text-primary">{initials}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="px-5 -mt-6 relative z-10">
        <div className="rounded-2xl glass glass-shine p-5 glow-sm">
          <h2 className="font-display text-lg font-bold text-foreground">{trainer.name}</h2>

          <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
            <MapPin className="size-3 text-primary/60" />
            <span>{trainer.coverage_neighborhoods.slice(0, 2).join(", ")}</span>
          </div>

          {/* Stats row */}
          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="size-4 fill-warning text-warning" />
              <span className="font-mono text-sm font-semibold">{trainer.avg_rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {trainer.total_sessions} sessões
            </span>
            <span className="ml-auto font-display text-xl font-bold text-gradient">
              R${trainer.base_price_per_session.toFixed(0)}
              <span className="text-xs font-normal text-muted-foreground/60">/sessão</span>
            </span>
          </div>

          {/* CREF */}
          {trainer.cref_status === "verified" && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-success/10 border border-success/20 px-2 py-0.5 text-[10px] font-medium text-success">
              CREF Verificado
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      {trainer.bio && (
        <div className="px-5 mt-4">
          <p className="text-sm leading-relaxed text-muted-foreground">{trainer.bio}</p>
        </div>
      )}

      {/* Specialties */}
      <div className="px-5 mt-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">Especialidades</h3>
        <div className="flex flex-wrap gap-1.5">
          {trainer.specialties.map((s) => (
            <span
              key={s}
              className="rounded-full bg-primary/10 border border-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary/80"
            >
              {modalityLabels[s] ?? s}
            </span>
          ))}
        </div>
      </div>

      {/* Coverage */}
      <div className="px-5 mt-4">
        <h3 className="text-sm font-semibold text-foreground mb-2">Áreas de atendimento</h3>
        <div className="flex flex-wrap gap-1.5">
          {trainer.coverage_neighborhoods.map((n) => (
            <span
              key={n}
              className="flex items-center gap-1 rounded-full bg-white/[0.05] border border-white/5 px-2.5 py-1 text-[11px] text-muted-foreground"
            >
              <MapPin className="size-3" />
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 mt-6 space-y-2.5">
        <button
          onClick={onBook}
          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary-hover px-4 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
          Agendar Sessão — R${trainer.base_price_per_session.toFixed(0)}
        </button>
        <button
          onClick={onViewDetail}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-white/[0.06] hover:border-primary/20"
        >
          Ver perfil completo
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
