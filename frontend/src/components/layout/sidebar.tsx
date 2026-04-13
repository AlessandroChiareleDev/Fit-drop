"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  CalendarCheck,
  GitCompareArrows,
  CreditCard,
  Wallet,
  Star,
  AlertTriangle,
  Menu,
  X,
  LogOut,
  Building2,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/requests", label: "Pedidos", icon: CalendarCheck },
  { href: "/admin/trainers", label: "Trainers", icon: Dumbbell },
  { href: "/admin/users", label: "Usuários", icon: Users },
  { href: "/admin/matches", label: "Matches", icon: GitCompareArrows },
  { href: "/admin/sessions", label: "Sessões", icon: CalendarCheck },
  { href: "/admin/payments", label: "Pagamentos", icon: CreditCard },
  { href: "/admin/payouts", label: "Repasses", icon: Wallet },
  { href: "/admin/reviews", label: "Avaliações", icon: Star },
  { href: "/admin/incidents", label: "Incidentes", icon: AlertTriangle },
  { href: "/admin/gyms", label: "Academias", icon: Building2 },
  { href: "/admin/audit-logs", label: "Auditoria", icon: ScrollText },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all",
        active
          ? "bg-primary/15 text-primary border border-primary/15 shadow-[0_0_20px_rgba(200,119,64,0.08)]"
          : "text-muted-foreground/70 hover:bg-white/5 hover:text-foreground border border-transparent",
      )}
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.name
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "A";

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-white/5 bg-[#0d0d0d]/95 backdrop-blur-xl px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-1.5 text-foreground"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <span className="font-display text-lg font-bold tracking-tight text-gradient">
            FitDrop
          </span>
        </div>
        <button
          onClick={() => { logout(); router.push("/login"); }}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <LogOut className="size-3.5" />
          Sair
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-surface-overlay backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/5 bg-[#0d0d0d]/95 backdrop-blur-xl transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-white/5 px-6">
          <Link href="/admin" className="font-display text-xl font-bold tracking-tight text-gradient">
            FitDrop
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1 text-muted-foreground hover:text-foreground lg:hidden"
            aria-label="Close menu"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              {...item}
              active={pathname === item.href}
              onClick={() => setMobileOpen(false)}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/5 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-xs font-bold text-primary-foreground">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-medium text-foreground">
                {user?.name}
              </p>
              <p className="truncate text-[10px] text-muted-foreground/50">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-muted-foreground/60 hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <LogOut className="size-3.5" />
            Sair
          </button>
        </div>
      </aside>
    </>
  );
}
