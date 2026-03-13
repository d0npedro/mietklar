import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  detail: string;
  delta?: string;
  label: string;
  trend?: "down" | "neutral" | "up";
  value: string;
};

const trendStyles = {
  down: {
    className: "bg-emerald-100 text-emerald-900",
    icon: ArrowDownRight,
  },
  neutral: {
    className: "bg-slate-200 text-slate-700",
    icon: Minus,
  },
  up: {
    className: "bg-amber-100 text-amber-900",
    icon: ArrowUpRight,
  },
};

export function MetricCard({
  detail,
  delta,
  label,
  trend = "neutral",
  value,
}: MetricCardProps) {
  const trendConfig = trendStyles[trend];
  const Icon = trendConfig.icon;

  return (
    <Card className="border-white/80 bg-white/90 shadow-lg shadow-slate-900/5">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-muted-foreground text-sm">{label}</p>
          {delta ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                trendConfig.className,
              )}
            >
              <Icon className="size-3.5" />
              {delta}
            </span>
          ) : null}
        </div>
        <div className="space-y-2">
          <p className="font-display text-3xl font-semibold tracking-tight text-slate-950">
            {value}
          </p>
          <p className="text-sm leading-6 text-slate-600">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}
