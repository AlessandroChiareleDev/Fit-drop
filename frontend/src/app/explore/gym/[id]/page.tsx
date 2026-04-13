"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Clock,
  Heart,
  Loader2,
  AlertTriangle,
  Tag,
  Dumbbell,
} from "lucide-react";
import {
  useGym,
  useGymReviews,
  useCoupons,
  useGymTrainers,
  useAddFavorite,
  useRemoveFavorite,
  useFavorites,
} from "@/lib/api";
import { useAuth } from "@/lib/auth";

const dayLabels: Record<string, string> = {
  monday: "Segunda",
  tuesday: "Terça",
  wednesday: "Quarta",
  thursday: "Quinta",
  friday: "Sexta",
  saturday: "Sábado",
  sunday: "Domingo",
};

export default function GymDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const { data: gym, isLoading, error } = useGym(id);
  const { data: reviews } = useGymReviews(id);
  const { data: coupons } = useCoupons({ gym_id: id, active_only: true });
  const { data: gymTrainers } = useGymTrainers({ gym_id: id });
  const { data: favorites } = useFavorites(user?.id);
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const isFavorited = favorites?.some(
    (f) => f.target_type === "gym" && f.target_id === id,
  );
  const favoriteEntry = favorites?.find(
    (f) => f.target_type === "gym" && f.target_id === id,
  );

  function toggleFavorite() {
    if (!user) return;
    if (isFavorited && favoriteEntry) {
      removeFavorite.mutate(favoriteEntry.id);
    } else {
      addFavorite.mutate({ user_id: user.id, target_type: "gym", target_id: id });
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !gym) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-background">
        <AlertTriangle className="size-8 text-destructive" />
        <p className="text-sm text-muted-foreground">Academia não encontrada.</p>
        <Link href="/explore" className="text-xs text-primary hover:underline">
          Voltar ao mapa
        </Link>
      </div>
    );
  }

  const operatingHours = gym.operating_hours as Record<string, string> | null;
  const amenities = gym.amenities as string[] | null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative">
        {gym.photo_url ? (
          <img
            src={gym.photo_url}
            alt={gym.name}
            className="h-56 w-full object-cover"
          />
        ) : (
          <div className="h-56 bg-gradient-to-br from-primary/20 to-primary/5" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
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

      <div className="mx-auto max-w-2xl px-4 -mt-20 relative z-10">
        {/* Main card */}
        <div className="glass glass-shine noise rounded-2xl p-6 glow-md">
          <h1 className="font-display text-2xl font-bold">{gym.name}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-3.5" />
            {gym.address ? `${gym.address}, ` : ""}
            {gym.neighborhood}, {gym.city}
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <Star className="size-4 text-warning" />
              <span className="font-display text-lg font-bold">{gym.avg_rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({gym.total_reviews} avaliações)</span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <span className="rounded-md bg-primary-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
              {gym.gym_type}
            </span>
            {gymTrainers && gymTrainers.length > 0 && (
              <>
                <div className="h-6 w-px bg-white/10" />
                <div className="flex items-center gap-1 text-sm">
                  <Dumbbell className="size-3.5 text-primary" />
                  <span className="font-mono tabular-nums">{gymTrainers.length}</span>
                  <span className="text-muted-foreground">trainers</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        {gym.description && (
          <div className="mt-4 glass rounded-2xl p-5">
            <h2 className="font-display font-semibold">Sobre</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {gym.description}
            </p>
          </div>
        )}

        {/* Operating hours */}
        {operatingHours && Object.keys(operatingHours).length > 0 && (
          <div className="mt-4 glass rounded-2xl p-5">
            <h2 className="font-display font-semibold flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              Horários
            </h2>
            <div className="mt-3 space-y-1.5">
              {Object.entries(operatingHours).map(([day, hours]) => (
                <div key={day} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {dayLabels[day] || day}
                  </span>
                  <span className="font-mono text-xs tabular-nums">{hours}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Amenities */}
        {amenities && amenities.length > 0 && (
          <div className="mt-4 glass rounded-2xl p-5">
            <h2 className="font-display font-semibold">Comodidades</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {amenities.map((a) => (
                <span
                  key={a}
                  className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Coupons */}
        {coupons && coupons.length > 0 && (
          <div className="mt-4 glass rounded-2xl p-5">
            <h2 className="font-display font-semibold flex items-center gap-2">
              <Tag className="size-4 text-primary" />
              Cupons Disponíveis
            </h2>
            <div className="mt-3 space-y-2">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3"
                >
                  <div>
                    <span className="font-mono text-sm font-bold text-primary">
                      {coupon.code}
                    </span>
                    {coupon.description && (
                      <p className="text-xs text-muted-foreground">{coupon.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-display text-lg font-bold text-primary">
                      {coupon.discount_type === "percentage"
                        ? `${coupon.discount_value}%`
                        : `R$ ${coupon.discount_value.toFixed(0)}`}
                    </span>
                    <p className="text-[10px] text-muted-foreground/60">desconto</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact */}
        {gym.phone && (
          <div className="mt-4 glass rounded-2xl p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="size-4" />
              {gym.phone}
            </div>
          </div>
        )}

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
