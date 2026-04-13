"use client";

import { Loader2, AlertTriangle } from "lucide-react";
import { usePayouts } from "@/lib/api";
import { PageHeader } from "@/components/layout";
import { StatusBadge, PriceMono } from "@/components/domain";
import type { PayoutStatus } from "@/lib/api";

const statusColorMap: Record<PayoutStatus, "success" | "warning" | "destructive" | "default"> = {
  pending: "warning",
  approved: "primary" as "success",
  paid: "success",
  failed: "destructive",
};

export default function PayoutsPage() {
  const { data: payouts, isLoading, error } = usePayouts();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !payouts) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2">
        <AlertTriangle className="size-8 text-destructive" />
        <p className="text-sm text-muted-foreground">Falha ao carregar repasses.</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Repasses" description={`${payouts.length} registrados`} />

      <div className="overflow-x-auto rounded-xl border border-border-subtle">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Data Agendada</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Aprovado por</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {payouts.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-surface">
                <td className="px-4 py-3">
                  <PriceMono value={p.amount} />
                </td>
                <td className="px-4 py-3 font-mono text-xs tabular-nums">
                  {p.scheduled_date}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge label={p.status} color={statusColorMap[p.status]} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {p.approved_by ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
