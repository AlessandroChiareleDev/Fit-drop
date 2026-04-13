"use client";

import { Loader2, AlertTriangle } from "lucide-react";
import { useSessions } from "@/lib/api";
import { PageHeader } from "@/components/layout";
import { StatusBadge, PriceMono, TimeMono } from "@/components/domain";
import type { SessionStatus } from "@/lib/api";

const statusColorMap: Record<SessionStatus, "success" | "warning" | "destructive" | "default" | "primary"> = {
  confirmed: "primary",
  in_progress: "warning",
  completed: "success",
  cancelled: "destructive",
};

export default function SessionsPage() {
  const { data: sessions, isLoading, error } = useSessions();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !sessions) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2">
        <AlertTriangle className="size-8 text-destructive" />
        <p className="text-sm text-muted-foreground">Falha ao carregar sessões.</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Sessões" description={`${sessions.length} registradas`} />

      <div className="overflow-x-auto rounded-xl border border-border-subtle">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Horário</th>
              <th className="px-4 py-3">Local</th>
              <th className="px-4 py-3">Bruto</th>
              <th className="px-4 py-3">Taxa</th>
              <th className="px-4 py-3">Payout</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {sessions.map((session) => (
              <tr key={session.id} className="transition-colors hover:bg-surface">
                <td className="px-4 py-3 font-mono text-xs tabular-nums">
                  {session.scheduled_date}
                </td>
                <td className="px-4 py-3">
                  <TimeMono
                    value={`${session.scheduled_time_start} – ${session.scheduled_time_end}`}
                  />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {session.venue_name ?? session.venue_type}
                </td>
                <td className="px-4 py-3">
                  <PriceMono value={session.gross_amount} />
                </td>
                <td className="px-4 py-3">
                  <PriceMono
                    value={session.platform_fee_amount + session.convenience_fee_amount}
                    className="text-muted-foreground"
                  />
                </td>
                <td className="px-4 py-3">
                  <PriceMono value={session.trainer_payout_amount} className="text-success" />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={session.status.replace("_", " ")}
                    color={statusColorMap[session.status]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
