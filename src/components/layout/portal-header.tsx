import { Badge } from "@/components/ui/badge";

import { BrandMark } from "@/components/brand/brand-mark";
import { SignOutButton } from "@/components/auth/sign-out-button";

type PortalHeaderProps = {
  title: string;
  subtitle: string;
  userName: string;
  userRole: string;
};

export function PortalHeader({
  subtitle,
  title,
  userName,
  userRole,
}: PortalHeaderProps) {
  return (
    <header className="bg-background/85 border-b border-white/70 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BrandMark />
          <div className="flex items-center gap-2">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
              {userRole}
            </Badge>
            <SignOutButton />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm">{subtitle}</p>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              {title}
            </h1>
            <p className="text-muted-foreground text-sm">
              angemeldet als {userName}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
