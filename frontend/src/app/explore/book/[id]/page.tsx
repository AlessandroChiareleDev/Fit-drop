"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Dumbbell,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useTrainer, useTrainerAvailabilities, useCreateSessionRequest } from "@/lib/api";
import { PriceMono } from "@/components/domain";
import { useAuth } from "@/lib/auth";
import type { Modality, VenueType } from "@/lib/api/types";
import { Urgency, LeadSource } from "@/lib/api/types";

const modalityOptions: { value: string; label: string }[] = [
  { value: "strength", label: "Musculação" },
  { value: "functional", label: "Funcional" },
  { value: "running", label: "Corrida" },
  { value: "yoga", label: "Yoga" },
  { value: "pilates", label: "Pilates" },
  { value: "stretching", label: "Alongamento" },
  { value: "other", label: "Outro" },
];

const venueOptions: { value: string; label: string }[] = [
  { value: "gym", label: "Academia" },
  { value: "outdoor", label: "Ao ar livre" },
  { value: "residence", label: "Residência" },
  { value: "hotel", label: "Hotel" },
  { value: "flexible", label: "Flexível" },
];

const dayLabels: Record<number, string> = {
  0: "Seg",
  1: "Ter",
  2: "Qua",
  3: "Qui",
  4: "Sex",
  5: "Sáb",
  6: "Dom",
};

export default function BookTrainerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const { data: trainer, isLoading } = useTrainer(id);
  const { data: availability } = useTrainerAvailabilities(id);
  const createRequest = useCreateSessionRequest();

  const [date, setDate] = useState("");
  const [timeStart, setTimeStart] = useState("08:00");
  const [timeEnd, setTimeEnd] = useState("09:00");
  const [neighborhood, setNeighborhood] = useState("");
  const [modality, setModality] = useState("functional");
  const [venueType, setVenueType] = useState("flexible");
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);

  // Set default neighborhood from trainer
  useState(() => {
    if (trainer?.coverage_neighborhoods?.length) {
      setNeighborhood(trainer.coverage_neighborhoods[0]);
    }
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !date) return;

    createRequest.mutate(
      {
        user_id: user.id,
        requested_date: date,
        requested_time_start: timeStart,
        requested_time_end: timeEnd,
        neighborhood: neighborhood || trainer?.coverage_neighborhoods?.[0] || "Centro",
        venue_type: venueType as VenueType,
        modality: modality as Modality,
        urgency: Urgency.STANDARD,
        notes: notes || null,
        lead_source: LeadSource.LANDING_PAGE,
      },
      {
        onSuccess: () => setSuccess(true),
      },
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-background">
        <AlertTriangle className="size-8 text-destructive" />
        <p className="text-sm text-muted-foreground">Trainer não encontrado.</p>
        <Link href="/explore" className="text-xs text-primary hover:underline">
          Voltar ao mapa
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
        <div className="glass glass-shine noise rounded-3xl p-8 text-center max-w-md glow-md">
          <CheckCircle2 className="mx-auto size-16 text-success" />
          <h2 className="mt-4 font-display text-2xl font-bold">Solicitação Enviada!</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sua solicitação de sessão com <strong>{trainer.name}</strong> foi enviada.
            Você receberá uma confirmação em breve.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => router.push("/explore/sessions")}
              className="rounded-2xl bg-gradient-to-r from-primary to-primary-hover py-3 text-sm font-bold text-primary-foreground transition-all hover:brightness-110"
            >
              Ver Minhas Sessões
            </button>
            <button
              onClick={() => router.push("/explore")}
              className="rounded-2xl bg-white/5 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-white/10"
            >
              Voltar ao Mapa
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Min date = tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5" />
        <div className="absolute inset-x-0 top-0 z-10 flex items-center p-4">
          <Link
            href={`/explore/trainer/${id}`}
            className="glass rounded-full p-3 transition-transform hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="size-5 text-foreground" />
          </Link>
          <span className="ml-3 font-display font-semibold">Agendar Sessão</span>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 -mt-10 relative z-10">
        {/* Trainer mini card */}
        <div className="glass rounded-2xl p-4 flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-hover text-lg font-bold text-primary-foreground">
            {trainer.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="font-display font-bold">{trainer.name}</h2>
            <p className="text-xs text-muted-foreground">{trainer.specialties.join(", ")}</p>
          </div>
          <PriceMono value={trainer.base_price_per_session} className="text-lg font-bold" />
        </div>

        {/* Booking form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Date */}
          <div className="glass rounded-2xl p-4">
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Calendar className="size-4 text-primary" />
              Data
            </label>
            <input
              type="date"
              required
              min={minDate}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            {/* Show available days hint */}
            {availability && availability.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Disponível:{" "}
                {[...new Set(availability.map((a) => {
                  const day = typeof a.day_of_week === "number" ? a.day_of_week : parseInt(a.day_of_week);
                  return dayLabels[day] || a.day_of_week;
                }))].join(", ")}
              </p>
            )}
          </div>

          {/* Time */}
          <div className="glass rounded-2xl p-4">
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Clock className="size-4 text-primary" />
              Horário
            </label>
            <div className="flex items-center gap-3">
              <input
                type="time"
                required
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
                className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              <span className="text-muted-foreground text-sm">até</span>
              <input
                type="time"
                required
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
                className="flex-1 rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Modality */}
          <div className="glass rounded-2xl p-4">
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Dumbbell className="size-4 text-primary" />
              Modalidade
            </label>
            <div className="flex flex-wrap gap-2">
              {modalityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setModality(opt.value)}
                  className={`rounded-xl px-3 py-2 text-xs font-medium transition-all ${modality === opt.value ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Venue */}
          <div className="glass rounded-2xl p-4">
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <MapPin className="size-4 text-primary" />
              Local
            </label>
            <select
              value={venueType}
              onChange={(e) => setVenueType(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
            >
              {venueOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Neighborhood */}
            <select
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
            >
              <option value="">Selecione o bairro</option>
              {trainer.coverage_neighborhoods.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="glass rounded-2xl p-4">
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Sparkles className="size-4 text-primary" />
              Observações (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Alguma preferência ou informação importante..."
              className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-foreground resize-none focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={createRequest.isPending || !date}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary-hover py-4 text-base font-bold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed glow-md"
          >
            {createRequest.isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                <Calendar className="size-5" />
                Confirmar Agendamento
              </>
            )}
          </button>

          {createRequest.isError && (
            <p className="text-center text-sm text-destructive">
              Erro ao enviar solicitação. Tente novamente.
            </p>
          )}
        </form>

        <div className="h-8" />
      </div>
    </div>
  );
}
