"use client";

import { Loader2, AlertTriangle, ScrollText, Search } from "lucide-react";
import { useAuditLogs } from "@/lib/api";
import { PageHeader } from "@/components/layout";
import { useState } from "react";

export default function AuditLogsPage() {
  const [entityFilter, setEntityFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const { data: logs, isLoading, error } = useAuditLogs({
    entity_type: entityFilter || undefined,
    action: actionFilter || undefined,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !logs) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2">
        <AlertTriangle className="size-8 text-destructive" />
        <p className="text-sm text-muted-foreground">Falha ao carregar logs de auditoria.</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Logs de Auditoria"
        description={`${logs.length} registros`}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-foreground"
        >
          <option value="">Todas as entidades</option>
          <option value="user">Usuário</option>
          <option value="trainer">Trainer</option>
          <option value="gym">Academia</option>
          <option value="session">Sessão</option>
          <option value="payment">Pagamento</option>
        </select>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-lg border border-border-subtle bg-surface px-3 py-2 text-sm text-foreground"
        >
          <option value="">Todas as ações</option>
          <option value="create">Criar</option>
          <option value="update">Atualizar</option>
          <option value="delete">Deletar</option>
          <option value="approve">Aprovar</option>
          <option value="reject">Rejeitar</option>
          <option value="suspend">Suspender</option>
        </select>
      </div>

      {/* Logs table */}
      <div className="overflow-x-auto rounded-xl border border-border-subtle">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-subtle bg-surface text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Quando</th>
              <th className="px-4 py-3">Ator</th>
              <th className="px-4 py-3">Ação</th>
              <th className="px-4 py-3">Entidade</th>
              <th className="px-4 py-3">Detalhes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  <ScrollText className="mx-auto size-8 opacity-30" />
                  <p className="mt-2">Nenhum log encontrado</p>
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="transition-colors hover:bg-surface">
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(log.created_at).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 font-medium">{log.actor_name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-primary-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {log.entity_type}
                    {log.entity_id && (
                      <span className="ml-1 font-mono text-[10px] text-muted-foreground/50">
                        {log.entity_id.slice(0, 8)}…
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {log.details ? (
                      <span className="max-w-[200px] truncate block">
                        {typeof log.details === "string"
                          ? log.details
                          : JSON.stringify(log.details)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
