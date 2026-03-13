import { redirect } from "next/navigation";

import { PortalHeader } from "@/components/layout/portal-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth, canAccessTenantPortal } from "@/lib/auth";
import { formatCurrency, formatDelta } from "@/lib/formatters";
import { getTenantPortalData } from "@/lib/server/portal-queries";

export const dynamic = "force-dynamic";

export default async function PortalTenantPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?next=/portal/mieter");
  }

  if (!canAccessTenantPortal(session.user.role)) {
    redirect("/portal");
  }

  const data = await getTenantPortalData(session.user.id);

  if (!data) {
    redirect("/portal");
  }

  return (
    <div className="min-h-screen">
      <PortalHeader
        subtitle={`${data.propertyName} · Einheit ${data.unitCode}`}
        title="Mieterportal"
        userName={data.tenantName}
        userRole={session.user.role ?? "tenant"}
      />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="bg-white/90">
            <CardHeader>
              <CardDescription>Aktueller Miet-Snapshot</CardDescription>
              <CardTitle className="font-display text-2xl">
                Zusammensetzung der Warmmiete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.snapshot ? (
                <>
                  <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/70 p-4">
                    <p className="text-muted-foreground text-sm">
                      Aktuelle Warmmiete
                    </p>
                    <p className="font-display mt-2 text-4xl font-semibold">
                      {formatCurrency(data.snapshot.rentTotal)}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Kosten {formatCurrency(data.snapshot.costTotal)} plus
                      offene Marge {formatCurrency(data.snapshot.marginAmount)}
                    </p>
                  </div>
                  {data.snapshot.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-[1.5rem] border border-slate-200/80 bg-slate-50/70 px-4 py-3"
                    >
                      <div>
                        <p className="font-medium text-slate-950">
                          {item.label}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Anteil {item.sharePercent.toFixed(1)} %
                        </p>
                      </div>
                      <Badge
                        className={
                          item.isMargin
                            ? "bg-amber-100 text-amber-900 hover:bg-amber-100"
                            : "bg-primary/10 text-primary hover:bg-primary/10"
                        }
                      >
                        {formatCurrency(item.amount)}
                      </Badge>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Kein Snapshot verfuegbar.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/90">
            <CardHeader>
              <CardDescription>Aktuelle Historie</CardDescription>
              <CardTitle className="font-display text-2xl">
                Aenderungen & Hinweise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.changes.map((change) => (
                <div
                  key={change.id}
                  className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/70 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-950">
                        {change.title}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {change.reasonLabel}
                      </p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">
                      {formatDelta(change.deltaAmount)}
                    </Badge>
                  </div>
                </div>
              ))}
              {data.announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/70 p-4"
                >
                  <p className="font-medium text-slate-950">
                    {announcement.title}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    veroeffentlicht am{" "}
                    {new Intl.DateTimeFormat("de-DE").format(
                      announcement.publishedAt,
                    )}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="bg-white/90">
            <CardHeader>
              <CardDescription>Dokumente</CardDescription>
              <CardTitle className="font-display text-2xl">
                Freigegebene Unterlagen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.documents.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between rounded-[1.5rem] border border-slate-200/80 bg-slate-50/70 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-slate-950">
                      {document.title}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {document.fileName}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-white/90">
            <CardHeader>
              <CardDescription>Servicefaelle</CardDescription>
              <CardTitle className="font-display text-2xl">
                Aktuelle Tickets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.serviceCases.map((serviceCase) => (
                <div
                  key={serviceCase.id}
                  className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/70 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-medium text-slate-950">
                      {serviceCase.title}
                    </p>
                    <Badge className="bg-slate-900 text-slate-50 hover:bg-slate-900">
                      {serviceCase.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {serviceCase.latestEvent ?? "Noch kein Status-Update."}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
