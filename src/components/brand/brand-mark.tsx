import { cn } from "@/lib/utils";

type BrandMarkProps = {
  compact?: boolean;
  className?: string;
};

export function BrandMark({ compact = false, className }: BrandMarkProps) {
  // UX-Grund: Eine klare Wortmarke mit Buchstaben ist leichter wiederzuerkennen als ein abstraktes Symbol.
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-[1.15rem] shadow-sm shadow-slate-900/10">
        <span className="font-display text-lg font-semibold tracking-tight">
          MK
        </span>
      </div>
      {compact ? (
        <p className="font-display text-lg font-semibold tracking-tight text-slate-950">
          MietKlar
        </p>
      ) : (
        <div className="space-y-0.5 leading-tight">
          <p className="font-display text-lg font-semibold tracking-tight text-slate-950">
            MietKlar
          </p>
          <p className="text-muted-foreground text-xs">
            Miete verstehen. Wohnungen klar verwalten.
          </p>
        </div>
      )}
    </div>
  );
}
