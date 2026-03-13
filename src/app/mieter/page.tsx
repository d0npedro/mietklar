import {
  BellRing,
  FileText,
  MessageCircleMore,
  ShieldCheck,
} from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { MetricCard } from "@/components/shared/metric-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  announcementsPreview,
  rentBreakdownPreview,
  tenantDocumentsPreview,
  tenantMetrics,
  tenantTimeline,
} from "@/lib/demo-data";
import { formatCurrency, formatDelta } from "@/lib/formatters";

export default function TenantPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader activePath="/mieter" />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pt-6 pb-16 sm:px-6 lg:px-8">
        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-primary/10 bg-white/90 shadow-xl shadow-slate-900/5">
            <CardHeader className="gap-3">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10 w-fit">
                Mieterportal Vorschau
              </Badge>
              <h1 className="font-display text-3xl font-semibold tracking-tight">
                Deine Miete, dein Verlauf, deine Dokumente in Klartext
              </h1>
              <CardDescription className="max-w-2xl text-sm leading-6">
                MietKlar zeigt Mietern nicht nur einen Betrag, sondern die
                zugrunde liegenden Kostenbloecke, die offene Vermietermarge und
                jede relevante Aenderung.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[1.75rem] border border-slate-200/80 bg-slate-50/70 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Warmmiete Maerz 2026
                    </p>
                    <p className="font-display mt-2 text-4xl font-semibold text-slate-950">
                      {formatCurrency(1720)}
                    </p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">
                    {formatDelta(-18)}
                  </Badge>
                </div>
                <div className="mt-5 space-y-3">
                  {rentBreakdownPreview.map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {item.label}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.detail}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-slate-950">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${item.share}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2 text-emerald-900">
                    <ShieldCheck className="size-4" />
                    <p className="text-sm font-medium">
                      Sichtbarkeit sauber begrenzt
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-emerald-800">
                    Tenant sieht nur das eigene Lease, zugeordnete Dokumente und
                    relevante Mitteilungen.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-sky-200 bg-sky-50 p-4">
                  <div className="flex items-center gap-2 text-sky-900">
                    <MessageCircleMore className="size-4" />
                    <p className="text-sm font-medium">
                      Service klar nachvollziehbar
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-sky-800">
                    Statusaenderungen, Kommentare und Reaktionszeiten bleiben im
                    Verlauf sichtbar.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-900/10 bg-slate-950 text-slate-50 shadow-xl shadow-slate-950/10">
            <CardHeader>
              <CardDescription className="text-slate-300">
                Veroeffentlichte Historie
              </CardDescription>
              <CardTitle className="font-display text-2xl">
                Aenderungsverlauf
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tenantTimeline.map((entry) => (
                <div
                  key={`${entry.date}-${entry.title}`}
                  className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-300">{entry.date}</p>
                      <p className="font-display mt-1 text-lg font-semibold text-slate-50">
                        {entry.title}
                      </p>
                    </div>
                    <Badge className="bg-white/10 text-slate-100 hover:bg-white/10">
                      {formatDelta(entry.delta)}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-200">
                    {entry.detail}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {tenantMetrics.map((metric) => (
            <MetricCard
              key={metric.label}
              detail={metric.detail}
              delta={metric.delta}
              label={metric.label}
              trend={metric.trend}
              value={metric.value}
            />
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <Card className="border-primary/10 bg-white/90 shadow-lg shadow-slate-900/5">
            <CardHeader>
              <CardDescription>Dokumente</CardDescription>
              <CardTitle className="font-display text-2xl">
                Fuer das Lease freigegebene Unterlagen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tenantDocumentsPreview.map((document) => (
                <div
                  key={document.title}
                  className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-slate-200/80 bg-slate-50/70 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary rounded-2xl p-2">
                      <FileText className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-950">
                        {document.title}
                      </p>
                      <p className="text-xs text-slate-500">{document.meta}</p>
                    </div>
                  </div>
                  <Badge className="bg-slate-900 text-slate-50 hover:bg-slate-900">
                    {document.visibility}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-white/90 shadow-lg shadow-slate-900/5">
            <CardHeader>
              <CardDescription>Mitteilungen</CardDescription>
              <CardTitle className="font-display text-2xl">
                Neue Hinweise und Service-Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {announcementsPreview.map((announcement) => (
                <div
                  key={announcement.title}
                  className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/70 p-4"
                >
                  <div className="text-primary flex items-center gap-2">
                    <BellRing className="size-4" />
                    <p className="text-sm font-medium text-slate-950">
                      {announcement.title}
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {announcement.detail}
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
