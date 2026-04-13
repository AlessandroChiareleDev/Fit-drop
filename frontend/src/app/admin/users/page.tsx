"use client";

import { Loader2, AlertTriangle, Phone, Mail, Search } from "lucide-react";
import { useUsers } from "@/lib/api";
import { PageHeader } from "@/components/layout";
import { useState } from "react";

const roleLabels: Record<string, string> = {
  student: "Aluno",
  trainer: "Trainer",
  gym_owner: "Dono de Academia",
  admin: "Admin",
};

const roleColors: Record<string, string> = {
  student: "bg-blue-500/10 text-blue-400",
  trainer: "bg-primary/10 text-primary",
  gym_owner: "bg-emerald-500/10 text-emerald-400",
  admin: "bg-violet-500/10 text-violet-400",
};

export default function UsersPage() {
  const { data: users, isLoading, error } = useUsers();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !users) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2">
        <AlertTriangle className="size-8 text-destructive" />
        <p className="text-sm text-muted-foreground">Falha ao carregar usuários.</p>
      </div>
    );
  }

  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.email?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <>
      <PageHeader title="Usuários" description={`${users.length} cadastrados`} />

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border-subtle bg-surface px-4 py-2 pl-9 text-sm text-foreground placeholder:text-muted-foreground/40"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-foreground"
        >
          <option value="">Todos os papéis</option>
          <option value="student">Aluno</option>
          <option value="trainer">Trainer</option>
          <option value="gym_owner">Dono de Academia</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border-subtle">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Papel</th>
              <th className="px-4 py-3">Telefone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Cidade</th>
              <th className="px-4 py-3">Bairro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {filtered.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-surface">
                <td className="px-4 py-3 font-medium">{user.name}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${roleColors[user.role] || "bg-muted text-muted-foreground"}`}>
                    {roleLabels[user.role] || user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Phone className="size-3" />
                    <span className="font-mono text-xs">{user.phone}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {user.email ? (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="size-3" />
                      <span className="text-xs">{user.email}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{user.city}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {user.neighborhood ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
