"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Dumbbell,
  MapPin,
  Clock,
  Shield,
  Star,
  ChevronRight,
  Zap,
  Users,
  Target,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import Link from "next/link";

const roleRoutes: Record<string, string> = {
  admin: "/admin",
  student: "/explore",
  trainer: "/trainer",
  gym_owner: "/gym",
};

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace(roleRoutes[user.role] ?? "/explore");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-primary/8 blur-[150px]" />
        <div className="absolute top-[30%] left-[10%] size-80 rounded-full bg-primary/5 blur-[100px] animate-float" />
        <div className="absolute bottom-[20%] right-[5%] size-64 rounded-full bg-chart-5/8 blur-[100px] animate-float" style={{ animationDelay: "-2s" }} />
        <div className="absolute top-[60%] left-[55%] size-48 rounded-full bg-success/5 blur-[80px] animate-float" style={{ animationDelay: "-4s" }} />
      </div>

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-5 md:px-12 lg:px-20">
        <div className="flex items-center gap-3">
          <div className="relative flex size-10 items-center justify-center">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-primary/60 blur-lg opacity-50" />
            <div className="relative glass-strong rounded-xl p-2">
              <Dumbbell className="size-5 text-primary" />
            </div>
          </div>
          <span className="font-display text-xl font-bold text-gradient">FitDrop</span>
        </div>
        <Link
          href="/login"
          className="group flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-white/[0.06]"
        >
          Entrar
          <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-16 pb-24 md:px-12 lg:px-20 lg:pt-24">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-8 flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.08] px-4 py-1.5 text-xs font-medium text-primary">
            <Zap className="size-3.5" />
            Plataforma #1 de Vitória, ES
          </div>

          <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
            <span className="text-foreground">Treino premium, </span>
            <span className="text-gradient">do seu jeito</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Conectamos você aos melhores personal trainers de Vitória. 
            Escolha o local, o horário — e treine com quem entende do assunto.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/login"
              className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary-hover px-8 py-4 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              Encontrar meu trainer
              <ChevronRight className="size-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-8 py-4 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-white/[0.06]"
            >
              Sou personal trainer
            </Link>
          </div>

          {/* Social proof */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="flex size-8 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br from-primary/60 to-primary/30 text-[10px] font-bold text-primary-foreground"
                  >
                    {["L", "A", "C", "F"][i]}
                  </div>
                ))}
              </div>
              <span>+200 alunos ativos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="size-4 fill-warning text-warning" />
              <span className="font-medium text-foreground">4.9</span>
              <span>de avaliação média</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="size-4 text-primary" />
              <span>32 bairros cobertos</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24 md:px-12 lg:px-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: MapPin,
              title: "Onde você quiser",
              desc: "Parques, academias, condomínios ou na praia — escolha o local.",
            },
            {
              icon: Clock,
              title: "Agendamento rápido",
              desc: "Match em minutos. Confirme via Pix e treine hoje mesmo.",
            },
            {
              icon: Shield,
              title: "Trainers verificados",
              desc: "CREF validado, avaliações reais e taxa de presença transparente.",
            },
            {
              icon: Target,
              title: "Personalizado",
              desc: "Musculação, funcional, yoga, corrida — seu treino, sua escolha.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group glass glass-shine noise rounded-3xl p-6 transition-all hover:glow-sm"
            >
              <div className="relative z-10">
                <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <f.icon className="size-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24 md:px-12 lg:px-20">
        <h2 className="mb-12 text-center font-display text-2xl font-bold md:text-3xl">
          Como funciona
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              step: "01",
              icon: MapPin,
              title: "Escolha local e horário",
              desc: "Selecione seu bairro, modalidade e o melhor horário no mapa interativo.",
            },
            {
              step: "02",
              icon: Users,
              title: "Match com trainer ideal",
              desc: "Nosso algoritmo encontra o profissional perfeito para seu objetivo.",
            },
            {
              step: "03",
              icon: Zap,
              title: "Treine e evolua",
              desc: "Confirme via Pix, treine com acompanhamento e avalie a sessão.",
            },
          ].map((s) => (
            <div key={s.step} className="relative flex flex-col items-center text-center">
              <div className="mb-5 flex size-16 items-center justify-center rounded-3xl glass glass-shine">
                <div className="relative z-10">
                  <s.icon className="size-7 text-primary" />
                </div>
              </div>
              <span className="mb-2 font-mono text-xs text-primary/60">{s.step}</span>
              <h3 className="text-base font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24 md:px-12 lg:px-20">
        <div className="glass glass-shine noise rounded-3xl p-10 text-center md:p-16">
          <div className="relative z-10">
            <h2 className="font-display text-2xl font-bold md:text-4xl">
              Pronto para <span className="text-gradient">transformar</span> seu treino?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground md:text-base">
              Cadastre-se em segundos e encontre seu trainer ideal em Vitória.
            </p>
            <Link
              href="/login"
              className="group relative mt-8 inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary-hover px-10 py-4 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.03] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              Começar agora — é grátis
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 px-6 py-8 md:px-12 lg:px-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Dumbbell className="size-4 text-primary/60" />
            <span>FitDrop © 2026 — Vitória, ES</span>
          </div>
          <div className="flex gap-6 text-xs text-muted-foreground/60">
            <span>Termos</span>
            <span>Privacidade</span>
            <span>Contato</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
