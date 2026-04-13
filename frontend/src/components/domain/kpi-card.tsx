import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function KpiCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: {
  title: string;
  value: string | number | React.ReactNode;
  icon?: LucideIcon;
  description?: string;
  trend?: { value: number; positive: boolean };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group glass glass-shine rounded-2xl p-5 transition-all hover:glow-sm hover:scale-[1.01]",
        className,
      )}
    >
      <div className="relative z-10 flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground/60">{title}</p>
        {Icon && <Icon className="size-4 text-muted-foreground/40" />}
      </div>
      <div className="relative z-10 mt-2 flex items-baseline gap-2">
        <p className="font-display text-2xl font-bold tracking-tight">{value}</p>
        {trend && (
          <span
            className={cn(
              "font-mono text-xs",
              trend.positive ? "text-success" : "text-destructive",
            )}
          >
            {trend.positive ? "+" : ""}
            {trend.value}%
          </span>
        )}
      </div>
      {description && (
        <p className="relative z-10 mt-1 text-xs text-muted-foreground/50">{description}</p>
      )}
    </div>
  );
}
