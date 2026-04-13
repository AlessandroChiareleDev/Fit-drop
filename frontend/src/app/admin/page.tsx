"use client";

import {
  Users,
  Dumbbell,
  CalendarCheck,
  DollarSign,
  Wallet,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Clock,
  Building2,
} from "lucide-react";
import { useDashboard, useGyms, useAuditLogs } from "@/lib/api";
import { PageHeader } from "@/components/layout";
import { KpiCard } from "@/components/domain";
import { PriceMono } from "@/components/domain";

export default function DashboardPage() {
  const { data, isLoading, error } = useDashboard();
  const { data: gyms } = useGyms();
  const { data: auditLogs } = useAuditLogs();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2">
        <AlertTriangle className="size-8 text-destructive" />
        <p className="text-sm text-muted-foreground">
          Falha ao carregar dashboard. Verifique se o backend está rodando.
        </p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Visão geral da operação FitDrop"
      />

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Usuários"
          value={data.totals.users}
          icon={Users}
          description="Total cadastrados"
        />
        <KpiCard
          title="Trainers"
          value={data.totals.trainers}
          icon={Dumbbell}
          description="Total cadastrados"
        />
        <KpiCard
          title="Pedidos"
          value={data.totals.requests}
          icon={Clock}
          description={`${data.pipeline.requests_submitted} submetidos`}
        />
        <KpiCard
          title="Sessões"
          value={data.totals.sessions}
          icon={CheckCircle2}
          description={`${data.pipeline.sessions_completed} concluídas`}
        />
      </div>

      {/* Financial row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          title="GMV"
          value={<PriceMono value={data.financial.gmv} />}
          icon={DollarSign}
        />
        <KpiCard
          title="Repasses Pendentes"
          value={<PriceMono value={data.financial.pending_payouts} />}
          icon={Wallet}
          description="Aguardando aprovação"
        />
        <KpiCard
          title="Avaliação Média"
          value={data.quality.avg_rating.toFixed(1)}
          icon={CalendarCheck}
          description={`${data.quality.conversion_pct.toFixed(0)}% conversão`}
        />
      </div>

      {/* Extra KPI */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        <KpiCard
          title="Academias"
          value={gyms?.length ?? 0}
          icon={Building2}
          description="Cadastradas na plataforma"
        />
        <KpiCard
          title="Logs de Auditoria"
          value={auditLogs?.length ?? 0}
          icon={Clock}
          description="Ações registradas"
        />
      </div>

      {/* Recent audit log */}
      <div className="glass glass-shine noise rounded-2xl p-6 glow-sm">
        <h2 className="relative z-10 font-display text-lg font-semibold tracking-tight">
          Atividade Recente
        </h2>
        {auditLogs && auditLogs.length > 0 ? (
          <div className="relative z-10 mt-3 space-y-2">
            {auditLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-3 rounded-lg bg-white/[0.02] px-3 py-2 text-sm"
              >
                <span className="rounded-md bg-primary-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                  {log.action}
                </span>
                <span className="font-medium">{log.actor_name}</span>
                <span className="text-muted-foreground/60">·</span>
                <span className="text-muted-foreground/60">{log.entity_type}</span>
                <span className="ml-auto text-xs text-muted-foreground/40">
                  {new Date(log.created_at).toLocaleString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="relative z-10 mt-2 text-sm text-muted-foreground/60">
            Nenhuma atividade registrada ainda.
          </p>
        )}
      </div>
    </>
  );
}
