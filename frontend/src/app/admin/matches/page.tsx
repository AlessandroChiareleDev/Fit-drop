"use client";

import { Loader2, AlertTriangle } from "lucide-react";
import { useMatches } from "@/lib/api";
import { PageHeader } from "@/components/layout";
import { StatusBadge } from "@/components/domain";
import type { MatchStatus } from "@/lib/api";

const statusColorMap: Record<MatchStatus, "success" | "warning" | "destructive" | "default" | "primary"> = {
  candidate: "default",
  offered: "primary",
  accepted: "success",
  declined: "destructive",
  expired: "default",
};

export default function MatchesPage() {
  const { data: matches, isLoading, error } = useMatches();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !matches) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2">
        <AlertTriangle className="size-8 text-destructive" />
        <p className="text-sm text-muted-foreground">Falha ao carregar matches.</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Matches" description={`${matches.length} registrados`} />

      <div className="overflow-x-auto rounded-xl border border-border-subtle">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Tentativa</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Oferecido em</th>
              <th className="px-4 py-3">Operador</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {matches.map((m) => (
              <tr key={m.id} className="transition-colors hover:bg-surface">
                <td className="px-4 py-3 font-mono text-xs tabular-nums">
                  #{m.attempt_number}
                </td>
                <td className="px-4 py-3 font-mono text-xs tabular-nums">
                  {m.score.toFixed(1)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge label={m.status} color={statusColorMap[m.status]} />
                </td>
                <td className="px-4 py-3 font-mono text-xs tabular-nums text-muted-foreground">
                  {m.offered_at
                    ? new Date(m.offered_at).toLocaleDateString("pt-BR")
                    : "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {m.operated_by ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
