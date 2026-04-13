"use client";

import { Loader2, AlertTriangle } from "lucide-react";
import { usePayments } from "@/lib/api";
import { PageHeader } from "@/components/layout";
import { StatusBadge, PriceMono } from "@/components/domain";
import type { PaymentStatus } from "@/lib/api";

const statusColorMap: Record<PaymentStatus, "success" | "warning" | "destructive" | "default"> = {
  pending: "warning",
  paid: "success",
  failed: "destructive",
  refunded: "default",
};

export default function PaymentsPage() {
  const { data: payments, isLoading, error } = usePayments();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !payments) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2">
        <AlertTriangle className="size-8 text-destructive" />
        <p className="text-sm text-muted-foreground">Falha ao carregar pagamentos.</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Pagamentos" description={`${payments.length} registrados`} />

      <div className="overflow-x-auto rounded-xl border border-border-subtle">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Método</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Referência</th>
              <th className="px-4 py-3">Criado em</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {payments.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-surface">
                <td className="px-4 py-3">
                  <span className="rounded-md bg-primary-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                    {p.method.replace("_", " ")}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <PriceMono value={p.amount} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge label={p.status} color={statusColorMap[p.status]} />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {p.external_reference ?? "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs tabular-nums text-muted-foreground">
                  {new Date(p.created_at).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
