import { cn } from "@/lib/utils";

type StatusColor = "default" | "success" | "warning" | "destructive" | "primary";

const colorMap: Record<StatusColor, string> = {
  default: "bg-muted text-muted-foreground",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/15 text-destructive",
  primary: "bg-primary-muted text-primary",
};

export function StatusBadge({
  label,
  color = "default",
  className,
}: {
  label: string;
  color?: StatusColor;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 font-mono text-xs font-medium",
        colorMap[color],
        className,
      )}
    >
      {label}
    </span>
  );
}
