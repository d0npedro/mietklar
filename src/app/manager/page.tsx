import { Building2, HandCoins, ListChecks, Wrench } from "lucide-react";

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
  managerActionCards,
  managerMetrics,
  managerWorkQueue,
  rentBreakdownPreview,
} from "@/lib/demo-data";
import { formatCurrency } from "@/lib/formatters";

const icons = {
  Building2,
  HandCoins,
  ListChecks,
  Wrench,
};

export default function ManagerPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader activePath="/manager" />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pt-6 pb-16 sm:px-6 lg:px-8">
        <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-primary/10 bg-white/90 shadow-xl shadow-slate-900/5">
            <CardHeader className="gap-3">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10 w-fit">
                Manager-Portal Vorschau
              </Badge>
              <h1 className="font-display text-3xl font-semibold tracking-tight">
                Objekte, Kosten, Snapshots und Veroeffentlichung in einem Ablauf
              </h1>
              <CardDescription className="max-w-2xl text-sm leading-6">
                Diese erste Demo zeigt die Informationsarchitektur fuer
                Verwalter: Uebersichten, offene Aktionen, Kostenstruktur und den
                Snapshot-Publish-Flow.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {managerActionCards.map((item) => {
                const Icon = icons[item.icon as keyof typeof icons];

                return (
                  <div
                    key={item.title}
                    className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/70 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/10 text-primary rounded-2xl p-2">
                        <Icon className="size-5" />
                      </div>
                      <div className="space-y-1">
                        <h2 className="font-display text-lg font-semibold text-slate-950">
                          {item.title}
                        </h2>
                        <p className="text-sm leading-6 text-slate-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-slate-900/10 bg-slate-950 text-slate-50 shadow-xl shadow-slate-950/10">
            <CardHeader>
              <CardDescription className="text-slate-300">
                Aktuelles Release-Ziel
              </CardDescription>
              <CardTitle className="font-display text-2xl">
                Snapshot-Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-300">Vorgemerkter Snapshot</p>
                <p className="font-display mt-1 text-3xl font-semibold">
                  {formatCurrency(1720)}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                  Zusammensetzung aus Objektkosten {formatCurrency(1550)} und
                  offener Marge {formatCurrency(170)}.
                </p>
              </div>
              <div className="space-y-3">
                {rentBreakdownPreview.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-100">
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-400">{item.detail}</p>
                    </div>
                    <span className="font-semibold text-slate-50">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {managerMetrics.map((metric) => (
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

        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-primary/10 bg-white/90 shadow-lg shadow-slate-900/5">
            <CardHeader>
              <CardDescription>Offene Arbeitsliste</CardDescription>
              <CardTitle className="font-display text-2xl">
                Einheiten und Releases im Blick
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {managerWorkQueue.map((row) => (
                <div
                  key={`${row.unit}-${row.topic}`}
                  className="grid gap-3 rounded-[1.5rem] border border-slate-200/80 bg-slate-50/70 p-4 sm:grid-cols-[0.8fr_1fr_auto]"
                >
                  <div>
                    <p className="text-muted-foreground text-sm">Einheit</p>
                    <p className="font-display text-lg font-semibold text-slate-950">
                      {row.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Aufgabe</p>
                    <p className="text-sm leading-6 text-slate-700">
                      {row.topic}
                    </p>
                  </div>
                  <div className="flex items-center justify-start sm:justify-end">
                    <Badge className="bg-slate-900 text-slate-50 hover:bg-slate-900">
                      {row.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-white/90 shadow-lg shadow-slate-900/5">
            <CardHeader>
              <CardDescription>Freigabe-Kette</CardDescription>
              <CardTitle className="font-display text-2xl">
                So wird eine Mietaenderung transparent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-medium text-emerald-900">
                  1. Kosten aktualisieren
                </p>
                <p className="mt-1 text-sm leading-6 text-emerald-800">
                  Externe Kostenbloecke und Margenparameter werden versioniert
                  vorbereitet.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-medium text-amber-900">
                  2. Snapshot berechnen
                </p>
                <p className="mt-1 text-sm leading-6 text-amber-800">
                  Delta, Begruendung und Mietaufschluesselung werden fuer die
                  Einheit fixiert.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-sky-200 bg-sky-50 p-4">
                <p className="text-sm font-medium text-sky-900">
                  3. Veroeffentlichen
                </p>
                <p className="mt-1 text-sm leading-6 text-sky-800">
                  Tenant-Portal, Historie und Benachrichtigung greifen auf
                  denselben Stand zu.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
