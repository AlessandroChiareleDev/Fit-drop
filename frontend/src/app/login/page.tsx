"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, LogIn, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import type { UserRole } from "@/lib/api/types";

const DEMO_ACCOUNTS: { label: string; role: string; email: string; description: string; color: string }[] = [
  { label: "Admin", role: "admin", email: "admin@fitdrop.com", description: "Acesso total ao sistema", color: "from-primary/80 to-primary/40" },
  { label: "Aluno", role: "student", email: "lucas@email.com", description: "Buscar e agendar sessões", color: "from-success/80 to-success/40" },
  { label: "Aluna", role: "student", email: "ana@email.com", description: "Buscar e agendar sessões", color: "from-success/80 to-success/40" },
  { label: "Professor", role: "trainer", email: "cadu@fitdrop.com", description: "Gerenciar agenda e sessões", color: "from-warning/80 to-warning/40" },
  { label: "Professora", role: "trainer", email: "fernanda@fitdrop.com", description: "Gerenciar agenda e sessões", color: "from-warning/80 to-warning/40" },
  { label: "Dono Academia", role: "gym_owner", email: "marcos@smartfit.com", description: "Gerenciar espaço e trainers", color: "from-chart-5/80 to-chart-5/40" },
];

const roleRoutes: Record<string, string> = {
  admin: "/admin",
  student: "/explore",
  trainer: "/trainer",
  gym_owner: "/gym",
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    handleLoginWith(email, password);
  }

  async function handleLoginWith(loginEmail: string, loginPassword: string) {
    setError("");
    setLoading(true);
    try {
      const user = await login(loginEmail, loginPassword);
      router.push(roleRoutes[user.role] ?? "/explore");
    } catch {
      setError("Email ou senha inválidos");
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("fitdrop123");
    await handleLoginWith(demoEmail, "fitdrop123");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Background effects */}
      <div className="pointer-events-none absolute inset-0">
        {/* Radial glow top */}
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/8 blur-[120px]" />
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-[15%] size-64 rounded-full bg-primary/5 blur-[80px] animate-float" />
        <div className="absolute bottom-1/4 right-[10%] size-48 rounded-full bg-chart-5/8 blur-[80px] animate-float" style={{ animationDelay: "-2s" }} />
        <div className="absolute top-[60%] left-[60%] size-32 rounded-full bg-success/5 blur-[60px] animate-float" style={{ animationDelay: "-4s" }} />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="relative mx-auto flex size-20 items-center justify-center">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary to-primary/60 blur-xl opacity-50 animate-pulse-glow" />
            <div className="relative glass-strong glass-shine rounded-3xl p-4 glow-md">
              <Dumbbell className="size-10 text-primary" />
            </div>
          </div>
          <h1 className="mt-5 font-display text-4xl font-bold tracking-tight text-gradient">
            FitDrop
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sessões de treino personalizadas
          </p>
        </div>

        {/* Login form — glass card */}
        <div className="glass glass-shine noise rounded-3xl p-6 glow-sm">
          <form onSubmit={handleLogin} className="relative z-10 space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="mt-1.5 w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-foreground backdrop-blur-sm placeholder:text-muted-foreground/60 focus:border-primary/40 focus:bg-white/8 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-1.5 w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-foreground backdrop-blur-sm placeholder:text-muted-foreground/60 focus:border-primary/40 focus:bg-white/8 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary-hover px-4 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogIn className="size-4" />
              )}
              Entrar
            </button>
          </form>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-glass-border to-transparent" />
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="size-3 text-primary/60" />
            Acesso rápido
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-glass-border to-transparent" />
        </div>

        {/* Demo accounts — glass grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.email}
              onClick={() => handleDemoLogin(acc.email)}
              disabled={loading}
              className="group relative flex flex-col items-start gap-1 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] px-3.5 py-3 text-left backdrop-blur-sm transition-all hover:bg-white/[0.06] hover:border-primary/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/5 to-transparent" />
              <div className="relative z-10 flex items-center gap-2">
                <div className={`size-2.5 rounded-full bg-gradient-to-r ${acc.color}`} />
                <span className="text-sm font-medium text-foreground">
                  {acc.label}
                </span>
              </div>
              <span className="relative z-10 text-[11px] text-muted-foreground/70 leading-tight">
                {acc.description}
              </span>
              <span className="relative z-10 mt-0.5 font-mono text-[10px] text-muted-foreground/40">
                {acc.email}
              </span>
            </button>
          ))}
        </div>

        <p className="text-center text-[11px] text-muted-foreground/40">
          Senha padrão: <span className="font-mono text-muted-foreground/60">fitdrop123</span>
        </p>
      </div>
    </div>
  );
}
