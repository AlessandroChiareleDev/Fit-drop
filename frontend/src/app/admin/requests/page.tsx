"use client";

import { Loader2, AlertTriangle, CalendarDays, MapPin } from "lucide-react";
import { useSessionRequests } from "@/lib/api";
import { PageHeader } from "@/components/layout";
import { StatusBadge, TimeMono } from "@/components/domain";
import type { SessionRequestStatus } from "@/lib/api";

const statusColorMap: Record<SessionRequestStatus, "success" | "warning" | "destructive" | "default" | "primary"> = {
  submitted: "primary",
  matching: "warning",
  awaiting_payment: "warning",
  confirmed: "success",
  completed: "success",
  cancelled: "destructive",
  expired: "default",
};

export default function RequestsPage() {
  const { data: requests, isLoading, error } = useSessionRequests();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !requests) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2">
        <AlertTriangle className="size-8 text-destructive" />
        <p className="text-sm text-muted-foreground">Falha ao carregar pedidos.</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Pedidos"
        description={`${requests.length} session requests`}
      />

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border-subtle">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Horário</th>
              <th className="px-4 py-3">Bairro</th>
              <th className="px-4 py-3">Modalidade</th>
              <th className="px-4 py-3">Urgência</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {requests.map((req) => (
              <tr
                key={req.id}
                className="transition-colors hover:bg-surface"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="size-3.5 text-muted-foreground" />
                    <span className="font-mono text-xs tabular-nums">
                      {req.requested_date}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <TimeMono value={`${req.requested_time_start} – ${req.requested_time_end}`} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-muted-foreground" />
                    {req.neighborhood}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-primary-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                    {req.modality}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={req.urgency}
                    color={req.urgency === "urgent" ? "destructive" : "default"}
                  />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge
                    label={req.status.replace("_", " ")}
                    color={statusColorMap[req.status]}
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
