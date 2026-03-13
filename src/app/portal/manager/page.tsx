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
import { auth, isManagerRole } from "@/lib/auth";
import { formatCurrency, formatDelta } from "@/lib/formatters";
import { getManagerPortalData } from "@/lib/server/portal-queries";

export const dynamic = "force-dynamic";

export default async function PortalManagerPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?next=/portal/manager");
  }

  if (!isManagerRole(session.user.role)) {
    redirect("/portal");
  }

  const data = await getManagerPortalData(session.user.id);

  if (!data) {
    redirect("/portal");
  }

  return (
    <div className="min-h-screen">
      <PortalHeader
        subtitle={data.organizationName}
        title="Manager-Portal"
        userName={session.user.name ?? session.user.email ?? "Unbekannt"}
        userRole={session.user.role ?? "property_manager"}
      />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Objekte", value: `${data.propertyCount}` },
            { label: "Einheiten", value: `${data.unitCount}` },
            { label: "Aktive Leases", value: `${data.activeLeaseCount}` },
            {
              label: "Offene Servicefaelle",
              value: `${data.openServiceCaseCount}`,
            },
          ].map((item) => (
            <Card key={item.label} className="bg-white/90">
              <CardContent className="space-y-2 p-5">
                <p className="text-muted-foreground text-sm">{item.label}</p>
                <p className="font-display text-3xl font-semibold">
                  {item.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="bg-white/90">
            <CardHeader>
              <CardDescription>Seed-gestuetzter Datenzugriff</CardDescription>
              <CardTitle className="font-display text-2xl">
                Aktueller Referenz-Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.featuredLease ? (
                <>
                  <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/70 p-4">
                    <p className="text-muted-foreground text-sm">
                      {data.featuredLease.propertyName} ·{" "}
                      {data.featuredLease.unitCode}
                    </p>
                    <p className="font-display mt-2 text-4xl font-semibold">
                      {formatCurrency(data.featuredLease.rentTotal)}
                    </p>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">
                    Dieser Wert kommt bereits aus dem lokal migrierten und
                    geseedeten Prisma-/PostgreSQL-Stack. In Phase 4 wird darauf
                    das eigentliche CRUD- und Publishing-Portal aufgebaut.
                  </p>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Kein Referenz-Snapshot gefunden.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/90">
            <CardHeader>
              <CardDescription>Veroeffentlichte Aenderungen</CardDescription>
              <CardTitle className="font-display text-2xl">
                Letzte Lease-Deltas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.recentChanges.map((change) => (
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
                        {change.unitCode} · {change.leaseReference} ·{" "}
                        {change.reasonLabel}
                      </p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">
                      {formatDelta(change.deltaAmount)}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
