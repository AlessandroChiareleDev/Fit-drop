import { cn } from "@/lib/utils";

export function PriceMono({
  value,
  currency = "BRL",
  className,
}: {
  value: number;
  currency?: string;
  className?: string;
}) {
  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(value);

  return (
    <span className={cn("font-mono text-sm tabular-nums", className)}>
      {formatted}
    </span>
  );
}

export function TimeMono({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return (
    <span className={cn("font-mono text-sm tabular-nums", className)}>
      {value}
    </span>
  );
}
