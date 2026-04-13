"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Calendar,
  Heart,
  Loader2,
  AlertTriangle,
  ShieldCheck,
  Clock,
  CalendarPlus,
} from "lucide-react";
import { useTrainer, useReviewsByTrainer, useTrainerAvailabilities, useAddFavorite, useRemoveFavorite, useFavorites } from "@/lib/api";
import { PriceMono, StatusBadge } from "@/components/domain";
import { useAuth } from "@/lib/auth";

export default function TrainerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const { data: trainer, isLoading, error } = useTrainer(id);
  const { data: reviews } = useReviewsByTrainer(id);
  const { data: availability } = useTrainerAvailabilities(id);
  const { data: favorites } = useFavorites(user?.id);
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const isFavorited = favorites?.some(
    (f) => f.target_type === "trainer" && f.target_id === id,
  );
  const favoriteEntry = favorites?.find(
    (f) => f.target_type === "trainer" && f.target_id === id,
  );

  function toggleFavorite() {
    if (!user) return;
    if (isFavorited && favoriteEntry) {
      removeFavorite.mutate(favoriteEntry.id);
    } else {
      addFavorite.mutate({ user_id: user.id, target_type: "trainer", target_id: id });
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !trainer) {
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

  const dayLabels: Record<string, string> = {
    monday: "Seg",
    tuesday: "Ter",
    wednesday: "Qua",
    thursday: "Qui",
    friday: "Sex",
    saturday: "Sáb",
    sunday: "Dom",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5" />
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4">
          <Link
            href="/explore"
            className="glass rounded-full p-3 transition-transform hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="size-5 text-foreground" />
          </Link>
          <button
            onClick={toggleFavorite}
            className="glass rounded-full p-3 transition-transform hover:scale-105 active:scale-95"
          >
            <Heart
              className={`size-5 ${isFavorited ? "fill-primary text-primary" : "text-foreground"}`}
            />
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 -mt-16 relative z-10">
        {/* Profile card */}
        <div className="glass glass-shine noise rounded-2xl p-6 glow-md">
          <div className="flex items-start gap-4">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-2xl font-bold text-primary-foreground">
              {trainer.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold">{trainer.name}</h1>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-3.5" />
                {trainer.city}
              </div>
              {trainer.cref_number && (
                <div className="mt-1 flex items-center gap-1 text-xs text-primary/80">
                  <ShieldCheck className="size-3.5" />
                  CREF: {trainer.cref_number}
                </div>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-6 flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <Star className="size-4 text-warning" />
              <span className="font-display text-lg font-bold">{trainer.avg_rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({reviews?.length ?? 0} avaliações)</span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-sm">
              <span className="font-mono font-bold tabular-nums">{trainer.total_sessions}</span>
              <span className="ml-1 text-muted-foreground">sessões</span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <PriceMono value={trainer.base_price_per_session} className="text-lg font-bold" />
            <span className="text-xs text-muted-foreground">/sessão</span>
          </div>

          {/* Specialties */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {trainer.specialties.map((s) => (
              <span
                key={s}
                className="rounded-lg bg-primary-muted px-2.5 py-1 text-xs font-medium uppercase tracking-wider text-primary"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Bio */}
        {trainer.bio && (
          <div className="mt-4 glass rounded-2xl p-5">
            <h2 className="font-display font-semibold">Sobre</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {trainer.bio}
            </p>
          </div>
        )}

        {/* Coverage */}
        <div className="mt-4 glass rounded-2xl p-5">
          <h2 className="font-display font-semibold">Área de Atuação</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {trainer.coverage_neighborhoods.map((n) => (
              <span
                key={n}
                className="flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1 text-xs text-muted-foreground"
              >
                <MapPin className="size-3" />
                {n}
              </span>
            ))}
          </div>
        </div>

        {/* Availability */}
        {availability && availability.length > 0 && (
          <div className="mt-4 glass rounded-2xl p-5">
            <h2 className="font-display font-semibold flex items-center gap-2">
              <Calendar className="size-4 text-primary" />
              Disponibilidade
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {availability.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs"
                >
                  <span className="font-medium">{dayLabels[slot.day_of_week] || slot.day_of_week}</span>
                  <Clock className="size-3 text-muted-foreground" />
                  <span className="font-mono tabular-nums text-muted-foreground">
                    {slot.start_time} – {slot.end_time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Book session CTA */}
        <div className="mt-4">
          <button
            onClick={() => router.push(`/explore/book/${id}`)}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary-hover py-4 text-base font-bold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98] glow-md"
          >
            <CalendarPlus className="size-5" />
            Agendar Sessão — <PriceMono value={trainer.base_price_per_session} className="text-base font-bold" />
          </button>
        </div>

        {/* Contact */}
        <div className="mt-4 glass rounded-2xl p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="size-4" />
            {trainer.phone}
          </div>
        </div>

        {/* Reviews */}
        {reviews && reviews.length > 0 && (
          <div className="mt-4 glass rounded-2xl p-5">
            <h2 className="font-display font-semibold">
              Avaliações ({reviews.length})
            </h2>
            <div className="mt-3 space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-lg bg-white/[0.03] p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3.5 ${i < review.rating ? "fill-warning text-warning" : "text-white/10"}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="mt-1.5 text-xs text-muted-foreground/80">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}
