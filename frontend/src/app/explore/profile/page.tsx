"use client";

import {
  User,
  MapPin,
  Phone,
  Mail,
  Heart,
  Star,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useFavorites, useTrainers, useGyms } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: favorites } = useFavorites(user?.id);
  const { data: trainers } = useTrainers();
  const { data: gyms } = useGyms();

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const favTrainers = favorites
    ?.filter((f) => f.target_type === "trainer")
    .map((f) => trainers?.find((t) => t.id === f.target_id))
    .filter(Boolean) ?? [];

  const favGyms = favorites
    ?.filter((f) => f.target_type === "gym")
    .map((f) => gyms?.find((g) => g.id === f.target_id))
    .filter(Boolean) ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative h-40 bg-gradient-to-br from-primary/20 to-primary/5">
        <button
          onClick={() => router.back()}
          className="absolute left-4 top-4 glass rounded-full p-3"
        >
          <ArrowLeft className="size-5 text-foreground" />
        </button>
      </div>

      <div className="mx-auto max-w-2xl px-4 -mt-16 relative z-10">
        {/* Profile card */}
        <div className="glass glass-shine noise rounded-2xl p-6 glow-md">
          <div className="flex items-start gap-4">
            <div className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-2xl font-bold text-primary-foreground">
              {initials}
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold">{user.name}</h1>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="size-3.5" />
                {user.neighborhood ? `${user.neighborhood}, ` : ""}
                {user.city}
              </div>
              <span className="mt-1 inline-flex items-center rounded-full bg-success/15 border border-success/20 px-2 py-0.5 text-[10px] font-medium text-success">
                {user.role === "student" ? "Aluno" : user.role}
              </span>
            </div>
          </div>

          {/* Contact info */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="size-4" />
              {user.phone}
            </div>
            {user.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4" />
                {user.email}
              </div>
            )}
          </div>
        </div>

        {/* Favorite trainers */}
        <div className="mt-4 glass rounded-2xl p-5">
          <h2 className="font-display font-semibold flex items-center gap-2">
            <Heart className="size-4 text-primary" />
            Trainers Favoritos ({favTrainers.length})
          </h2>
          {favTrainers.length > 0 ? (
            <div className="mt-3 space-y-2">
              {favTrainers.map((trainer) => trainer && (
                <Link
                  key={trainer.id}
                  href={`/explore/trainer/${trainer.id}`}
                  className="flex items-center gap-3 rounded-lg bg-white/[0.03] p-3 hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {trainer.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-sm">{trainer.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="size-3 text-warning" />
                      {trainer.avg_rating.toFixed(1)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground/60">
              Nenhum trainer favoritado ainda.
            </p>
          )}
        </div>

        {/* Favorite gyms */}
        <div className="mt-4 glass rounded-2xl p-5">
          <h2 className="font-display font-semibold flex items-center gap-2">
            <Heart className="size-4 text-primary" />
            Academias Favoritas ({favGyms.length})
          </h2>
          {favGyms.length > 0 ? (
            <div className="mt-3 space-y-2">
              {favGyms.map((gym) => gym && (
                <Link
                  key={gym.id}
                  href={`/explore/gym/${gym.id}`}
                  className="flex items-center gap-3 rounded-lg bg-white/[0.03] p-3 hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    {gym.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-sm">{gym.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" />
                      {gym.neighborhood}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground/60">
              Nenhuma academia favoritada ainda.
            </p>
          )}
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
