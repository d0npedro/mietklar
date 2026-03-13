import { cn } from "@/lib/utils";

type BrandMarkProps = {
  compact?: boolean;
  className?: string;
};

export function BrandMark({ compact = false, className }: BrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="bg-primary text-primary-foreground shadow-primary/20 flex size-11 items-center justify-center rounded-[1.15rem] shadow-lg">
        <div className="grid grid-cols-2 gap-1">
          <span className="h-3 w-1.5 rounded-full bg-current opacity-90" />
          <span className="h-5 w-1.5 rounded-full bg-current" />
          <span className="h-5 w-1.5 rounded-full bg-current" />
          <span className="h-3 w-1.5 rounded-full bg-current opacity-90" />
        </div>
      </div>
      {!compact ? (
        <div className="space-y-0.5">
          <p className="font-display text-lg font-semibold tracking-tight text-slate-950">
            MietKlar
          </p>
          <p className="text-muted-foreground text-xs">
            Transparente Vermietung
          </p>
        </div>
      ) : null}
    </div>
  );
}
