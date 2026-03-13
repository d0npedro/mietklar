import { redirect } from "next/navigation";
import {
  BellRing,
  FileText,
  Home,
  MessageCircleMore,
  ShieldCheck,
} from "lucide-react";

import { TenantServiceCaseForm } from "@/components/tenant/service-case-form";
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

const serviceStatusLabels: Record<string, string> = {
  closed: "Abgeschlossen",
  in_progress: "In Arbeit",
  open: "Offen",
  resolved: "Geloest",
  waiting_vendor: "Wartet auf Firma",
};

const priorityLabels: Record<string, string> = {
  high: "Hoch",
  low: "Niedrig",
  medium: "Mittel",
  urgent: "Sofort",
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("de-DE").format(value);
}

function getServiceTone(status: string) {
  if (status === "closed" || status === "resolved") {
    return "bg-emerald-100 text-emerald-900 hover:bg-emerald-100";
  }

  if (status === "waiting_vendor") {
    return "bg-amber-100 text-amber-900 hover:bg-amber-100";
  }

  return "bg-slate-900 text-slate-50 hover:bg-slate-900";
}

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

  const activeServiceCaseCount = data.serviceCases.filter(
    (serviceCase) =>
      serviceCase.status !== "closed" && serviceCase.status !== "resolved",
  ).length;

  // UX-Grund: Das Portal ordnet die Informationen entlang der Alltagssicht eines Mieters: Was zahle ich, was ist neu, wo bekomme ich Hilfe.
  return (
    <div className="min-h-screen">
      <PortalHeader
        subtitle={`${data.propertyName} - Einheit ${data.unitCode}`}
        title="Mein Zuhause"
        userName={data.tenantName}
        userRole={session.user.role ?? "tenant"}
      />
      <main
        className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"
        id="main-content"
      >
        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="app-panel bg-white">
            <CardHeader>
              <CardDescription>Das bezahle ich gerade</CardDescription>
              <CardTitle className="font-display text-2xl">
                Meine aktuelle Miete
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.snapshot ? (
                <>
                  <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">Warmmiete</p>
                    <p className="font-display mt-2 text-4xl font-semibold text-slate-950">
                      {formatCurrency(data.snapshot.rentTotal)}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Kosten {formatCurrency(data.snapshot.costTotal)} plus
                      offene Marge {formatCurrency(data.snapshot.marginAmount)}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {data.snapshot.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-900/5"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-950">
                            {item.label}
                          </p>
                          <p className="text-xs text-slate-500">
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
                  </div>
                </>
              ) : (
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Fuer dieses Mietverhaeltnis wurde noch keine Miete
                  veroeffentlicht.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="app-panel bg-white">
            <CardHeader>
              <CardDescription>Heute wichtig</CardDescription>
              <CardTitle className="font-display text-2xl">
                Schnellueberblick
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: Home,
                  text: data.snapshot
                    ? formatCurrency(data.snapshot.rentTotal)
                    : "Noch offen",
                  title: "Aktuelle Miete",
                },
                {
                  icon: MessageCircleMore,
                  text: `${activeServiceCaseCount} offen`,
                  title: "Servicefaelle",
                },
                {
                  icon: FileText,
                  text: `${data.documents.length} freigegeben`,
                  title: "Dokumente",
                },
                {
                  icon: BellRing,
                  text: `${data.announcements.length} neu`,
                  title: "Mitteilungen",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm shadow-slate-900/5">
                      <Icon className="size-5" />
                    </div>
                    <p className="mt-4 text-sm text-slate-500">{item.title}</p>
                    <p className="mt-1 font-display text-2xl font-semibold text-slate-950">
                      {item.text}
                    </p>
                  </div>
                );
              })}
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                <div className="flex items-center gap-2 text-slate-900">
                  <ShieldCheck className="size-4" />
                  <p className="text-sm font-medium">Nur fuer mich sichtbar</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Sie sehen nur Ihr Mietverhaeltnis, Ihre Unterlagen und Ihre
                  Nachrichten.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="app-panel bg-white">
            <CardHeader>
              <CardDescription>Was sich geaendert hat</CardDescription>
              <CardTitle className="font-display text-2xl">
                Mietaenderungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.changes.length > 0 ? (
                data.changes.map((change) => (
                  <div
                    key={change.id}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">
                          {change.title}
                        </p>
                        <p className="text-sm text-slate-500">
                          {change.reasonLabel} am {formatDate(change.effectiveDate)}
                        </p>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">
                        {formatDelta(change.deltaAmount)}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Noch keine veroeffentlichten Mietaenderungen.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="app-panel bg-white">
            <CardHeader>
              <CardDescription>Nachrichten vom Haus</CardDescription>
              <CardTitle className="font-display text-2xl">
                Mitteilungen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.announcements.length > 0 ? (
                data.announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-center gap-2 text-slate-900">
                      <BellRing className="size-4" />
                      <p className="font-semibold">{announcement.title}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {announcement.content}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      Veroeffentlicht am {formatDate(announcement.publishedAt)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Aktuell gibt es keine neuen Mitteilungen.
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="app-panel bg-white">
            <CardHeader>
              <CardDescription>Hilfe anfordern</CardDescription>
              <CardTitle className="font-display text-2xl">
                Problem melden
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TenantServiceCaseForm />
            </CardContent>
          </Card>

          <Card className="app-panel bg-white">
            <CardHeader>
              <CardDescription>Mein Verlauf</CardDescription>
              <CardTitle className="font-display text-2xl">
                Meine Servicefaelle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.serviceCases.length > 0 ? (
                data.serviceCases.map((serviceCase) => (
                  <div
                    key={serviceCase.id}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">
                          {serviceCase.title}
                        </p>
                        <p className="text-sm text-slate-500">
                          {serviceCase.caseNumber} - {formatDate(serviceCase.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">
                          {priorityLabels[serviceCase.priority] ??
                            serviceCase.priority}
                        </Badge>
                        <Badge className={getServiceTone(serviceCase.status)}>
                          {serviceStatusLabels[serviceCase.status] ??
                            serviceCase.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {serviceCase.description}
                    </p>
                    <p className="mt-3 text-xs text-slate-500">
                      {serviceCase.latestEvent ?? "Noch kein neues Status-Update."}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Noch keine Servicefaelle vorhanden.
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="app-panel bg-white">
            <CardHeader>
              <CardDescription>Meine Unterlagen</CardDescription>
              <CardTitle className="font-display text-2xl">
                Dokumente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.documents.length > 0 ? (
                data.documents.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-white p-2 text-slate-700 shadow-sm shadow-slate-900/5">
                        <FileText className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          {document.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {document.fileName}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                      {document.publishedAt
                        ? formatDate(document.publishedAt)
                        : "Entwurf"}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Aktuell sind keine Dokumente freigegeben.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="app-panel bg-white">
            <CardHeader>
              <CardDescription>Warum das hier so aufgebaut ist</CardDescription>
              <CardTitle className="font-display text-2xl">
                Das bleibt fuer mich klar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Jede Miete wird in Kostenbloecke und offene Marge zerlegt.",
                "Veroeffentlichte Mietstaende und Aenderungen bleiben spaeter sichtbar.",
                "Servicefaelle zeigen den letzten Bearbeitungsschritt.",
                "Nur meine Dokumente und Mitteilungen erscheinen hier.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
                >
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
