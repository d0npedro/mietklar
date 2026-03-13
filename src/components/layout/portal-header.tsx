import { Badge } from "@/components/ui/badge";

import { BrandMark } from "@/components/brand/brand-mark";
import { SignOutButton } from "@/components/auth/sign-out-button";

type PortalHeaderProps = {
  title: string;
  subtitle: string;
  userName: string;
  userRole: string;
};

const roleLabels: Record<string, string> = {
  admin_platform: "Plattform-Admin",
  org_manager: "Organisation",
  org_owner: "Eigentuemer",
  property_manager: "Verwaltung",
  tenant: "Mieter",
};

export function PortalHeader({
  subtitle,
  title,
  userName,
  userRole,
}: PortalHeaderProps) {
  // UX-Grund: Kopfzeile zeigt immer nur Ort, Bereich und Person, damit die Orientierung sofort klar ist.
  return (
    <header className="bg-background/95 border-b border-slate-200/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <BrandMark />
            <div className="space-y-1">
              <p className="text-sm text-slate-600">{subtitle}</p>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-950">
                {title}
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-900/5">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                Angemeldet
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {userName}
              </p>
              <Badge className="mt-2 bg-slate-100 text-slate-800 hover:bg-slate-100">
                {roleLabels[userRole] ?? userRole}
              </Badge>
            </div>
            <SignOutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
