"use client";

import { Loader2, AlertTriangle } from "lucide-react";
import { useIncidents } from "@/lib/api";
import { PageHeader } from "@/components/layout";
import { StatusBadge } from "@/components/domain";
import type { IncidentStatus } from "@/lib/api";

const statusColorMap: Record<IncidentStatus, "success" | "warning" | "destructive" | "default"> = {
  open: "destructive",
  investigating: "warning",
  resolved: "success",
  dismissed: "default",
};

export default function IncidentsPage() {
  const { data: incidents, isLoading, error } = useIncidents();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !incidents) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2">
        <AlertTriangle className="size-8 text-destructive" />
        <p className="text-sm text-muted-foreground">Falha ao carregar incidentes.</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Incidentes" description={`${incidents.length} registrados`} />

      <div className="overflow-x-auto rounded-xl border border-border-subtle">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Reportado por</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Impacto</th>
              <th className="px-4 py-3">Descrição</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {incidents.map((inc) => (
              <tr key={inc.id} className="transition-colors hover:bg-surface">
                <td className="px-4 py-3">
                  <span className="rounded-md bg-destructive/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-destructive">
                    {inc.type.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{inc.reported_by}</td>
                <td className="px-4 py-3">
                  <StatusBadge label={inc.status} color={statusColorMap[inc.status]} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={inc.impact_on_trainer}
                    color={
                      inc.impact_on_trainer === "suspension"
                        ? "destructive"
                        : inc.impact_on_trainer === "warning"
                          ? "warning"
                          : "default"
                    }
                  />
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                  {inc.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
