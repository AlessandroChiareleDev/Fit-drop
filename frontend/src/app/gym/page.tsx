"use client";

import { useAuth } from "@/lib/auth";
import { useGyms, useGymTrainers, useCoupons, useGymReviews } from "@/lib/api";
import {
  Building2,
  Users,
  MapPin,
  Star,
  LogOut,
  Dumbbell,
  Loader2,
  Tag,
  MessageSquare,
  Settings,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function GymDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { data: gyms, isLoading } = useGyms({ owner_id: user?.id });
  const myGym = gyms?.[0]; // First gym owned by this user

  const { data: gymTrainers } = useGymTrainers({ gym_id: myGym?.id });
  const { data: coupons } = useCoupons({ gym_id: myGym?.id });
  const { data: reviews } = useGymReviews(myGym?.id);

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
        <div className="absolute -top-40 left-1/2 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-chart-5/8 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 glass-strong border-b border-white/5">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-chart-5 to-chart-5/60 text-sm font-bold text-foreground">
              {initials}
            </div>
            <div>
              <h1 className="font-display text-base font-bold text-foreground">
                {user?.name}
              </h1>
              <p className="text-xs text-muted-foreground/70">Painel da Academia</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {myGym && (
              <Link
                href="/gym/settings"
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-muted-foreground/70 hover:bg-white/5 hover:text-foreground transition-all"
              >
                <Settings className="size-4" />
                Configurações
              </Link>
            )}
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
        {myGym ? (
          <>
            {/* Gym profile card */}
            <div className="glass glass-shine noise rounded-3xl p-6 glow-sm">
              <div className="relative z-10 flex items-start gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-chart-5/15 border border-chart-5/20 text-chart-5">
                  <Building2 className="size-7" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-xl font-bold text-foreground">
                    {myGym.name}
                  </h2>
                  <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground/70">
                    <MapPin className="size-3.5" />
                    {myGym.address && `${myGym.address}, `}
                    {myGym.neighborhood}, {myGym.city}
                  </div>
                  {myGym.description && (
                    <p className="mt-2 text-sm text-muted-foreground/60 line-clamp-2">
                      {myGym.description}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1">
                    <Star className="size-4 fill-warning text-warning" />
                    <span className="font-mono text-lg font-bold text-gradient">
                      {myGym.avg_rating.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/50">
                    {myGym.total_reviews} avaliações
                  </p>
                </div>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: Users, label: "Trainers", value: String(gymTrainers?.length ?? 0) },
                { icon: Tag, label: "Cupons", value: String(coupons?.length ?? 0) },
                { icon: MessageSquare, label: "Avaliações", value: String(reviews?.length ?? 0) },
                { icon: Star, label: "Nota média", value: myGym.avg_rating.toFixed(1) },
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

            {/* Coupons */}
            <div className="glass glass-shine noise rounded-3xl p-6 glow-sm">
              <h3 className="relative z-10 flex items-center gap-2 font-display text-base font-semibold">
                <Tag className="size-4 text-primary" />
                Cupons ({coupons?.length ?? 0})
              </h3>
              <div className="relative z-10 mt-3 space-y-2">
                {!coupons || coupons.length === 0 ? (
                  <p className="text-sm text-muted-foreground/60 py-4 text-center">
                    Nenhum cupom criado ainda.
                  </p>
                ) : (
                  coupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="flex items-center justify-between rounded-xl border border-primary/15 bg-primary/5 px-4 py-3"
                    >
                      <div>
                        <span className="font-mono font-bold text-primary">{coupon.code}</span>
                        {coupon.description && (
                          <p className="text-xs text-muted-foreground/60">{coupon.description}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground/40">
                          {coupon.used_count}/{coupon.max_uses ?? "∞"} usos
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-display text-lg font-bold text-primary">
                          {coupon.discount_type === "percentage"
                            ? `${coupon.discount_value}%`
                            : `R$ ${coupon.discount_value.toFixed(0)}`}
                        </span>
                        <p className="text-[10px] text-muted-foreground/40">
                          {coupon.is_active ? "Ativo" : "Inativo"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Trainer partnerships */}
            <div className="glass glass-shine noise rounded-3xl p-6 glow-sm">
              <h3 className="relative z-10 flex items-center gap-2 font-display text-base font-semibold">
                <Dumbbell className="size-4 text-primary" />
                Trainers Vinculados ({gymTrainers?.length ?? 0})
              </h3>
              <div className="relative z-10 mt-3 space-y-2">
                {!gymTrainers || gymTrainers.length === 0 ? (
                  <p className="text-sm text-muted-foreground/60 py-4 text-center">
                    Nenhum trainer vinculado.
                  </p>
                ) : (
                  gymTrainers.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2"
                    >
                      <div className="text-sm">
                        <span className="font-medium">Trainer {link.trainer_id.slice(0, 8)}…</span>
                        {link.notes && (
                          <p className="text-xs text-muted-foreground/60">{link.notes}</p>
                        )}
                      </div>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                        link.status === "active"
                          ? "bg-success/10 text-success"
                          : link.status === "pending"
                            ? "bg-warning/10 text-warning"
                            : "bg-muted text-muted-foreground"
                      }`}>
                        {link.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Reviews */}
            {reviews && reviews.length > 0 && (
              <div className="glass glass-shine noise rounded-3xl p-6 glow-sm">
                <h3 className="relative z-10 flex items-center gap-2 font-display text-base font-semibold">
                  <MessageSquare className="size-4 text-primary" />
                  Últimas Avaliações
                </h3>
                <div className="relative z-10 mt-3 space-y-2">
                  {reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="rounded-lg bg-white/[0.03] p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`size-3 ${i < review.rating ? "fill-warning text-warning" : "text-white/10"}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground/50">
                          {new Date(review.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="mt-1 text-xs text-muted-foreground/70">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* No gym yet */
          <div className="glass glass-shine noise rounded-3xl p-8 text-center glow-sm">
            <Building2 className="relative z-10 mx-auto size-12 text-muted-foreground/40" />
            <h3 className="relative z-10 mt-3 font-display text-lg font-bold text-foreground">
              Nenhuma academia cadastrada
            </h3>
            <p className="relative z-10 mt-1 text-sm text-muted-foreground/60">
              Você ainda não possui uma academia vinculada ao seu perfil.
            </p>
            <Link
              href="/gym/settings"
              className="relative z-10 mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Building2 className="size-4" />
              Cadastrar Academia
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
