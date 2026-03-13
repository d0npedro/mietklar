import Link from "next/link";
import {
  ArrowRight,
  Building2,
  FileClock,
  HandCoins,
  ListChecks,
  Wrench,
} from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-styles";
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
import { cn } from "@/lib/utils";

const iconMap = {
  Building2,
  HandCoins,
  ListChecks,
  Wrench,
};

export default function ManagerPage() {
  // UX-Grund: Die Vorschau zeigt den Arbeitsalltag in drei klaren Schritten statt einer vollen Produktwand.
  return (
    <div className="min-h-screen">
      <SiteHeader activePath="/manager" />
      <main
        className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"
        id="main-content"
      >
        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="app-panel bg-white">
            <CardHeader className="gap-4">
              <Badge className="w-fit bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
                Verwaltungsvorschau
              </Badge>
              <div className="space-y-3">
                <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-950">
                  Ich verwalte Wohnungen
                </h1>
                <CardDescription className="max-w-2xl text-base leading-7 text-slate-600">
                  Sie sehen zuerst das Wesentliche: Bestand, Kosten,
                  Mietveraenderungen und offene Servicefaelle.
                </CardDescription>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  className={cn(
                    buttonVariants(),
                    "min-h-12 rounded-2xl px-4 text-base",
                  )}
                  href="/login?next=/portal/manager"
                >
                  Manager-Demo oeffnen
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "min-h-12 rounded-2xl px-4 text-base",
                  )}
                  href="/mieter"
                >
                  Mieteransicht ansehen
                </Link>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {[
                {
                  icon: Building2,
                  text: "Alle Haeuser und Wohnungen in einer Liste",
                  title: "Bestand sehen",
                },
                {
                  icon: HandCoins,
                  text: "Kosten und Marge getrennt pflegen",
                  title: "Miete berechnen",
                },
                {
                  icon: FileClock,
                  text: "Neue Miete mit Historie veroeffentlichen",
                  title: "Aenderung belegen",
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
                    <h2 className="mt-4 font-display text-xl font-semibold text-slate-950">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="app-panel bg-slate-950 text-slate-50">
            <CardHeader>
              <CardDescription className="text-slate-300">
                Beispiel aus der Demo
              </CardDescription>
              <CardTitle className="font-display text-2xl">
                Neue Miete auf einen Blick
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-300">Geplanter Mietstand</p>
                <p className="font-display mt-2 text-4xl font-semibold">
                  {formatCurrency(1720)}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Aus Kosten {formatCurrency(1550)} plus offener Marge{" "}
                  {formatCurrency(170)}.
                </p>
              </div>
              <div className="space-y-3">
                {rentBreakdownPreview.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-[1.35rem] border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {item.label}
                      </p>
                      <p className="text-xs leading-5 text-slate-300">
                        {item.detail}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-white">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {managerMetrics.slice(0, 3).map((metric) => (
            <Card key={metric.label} className="app-panel bg-white">
              <CardContent className="space-y-2 p-5">
                <p className="text-sm font-medium text-slate-500">
                  {metric.label}
                </p>
                <p className="font-display text-4xl font-semibold text-slate-950">
                  {metric.value}
                </p>
                <p className="text-sm leading-6 text-slate-600">
                  {metric.detail}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="app-panel bg-white">
            <CardHeader>
              <CardDescription>Heute zuerst</CardDescription>
              <CardTitle className="font-display text-2xl">
                Typischer Arbeitsablauf
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  step: "1",
                  text: "Haus oder Wohnung waehlen",
                  title: "Bestand oeffnen",
                },
                {
                  step: "2",
                  text: "Kosten aendern oder neue Position anlegen",
                  title: "Miete vorbereiten",
                },
                {
                  step: "3",
                  text: "Neue Miete mit Begruendung veroeffentlichen",
                  title: "Aenderung freigeben",
                },
              ].map((step) => (
                <div
                  key={step.title}
                  className="flex gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 font-display text-lg font-semibold text-white">
                    {step.step}
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-display text-xl font-semibold text-slate-950">
                      {step.title}
                    </h2>
                    <p className="text-sm leading-6 text-slate-600">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="app-panel bg-white">
            <CardHeader>
              <CardDescription>Was in der Demo sichtbar ist</CardDescription>
              <CardTitle className="font-display text-2xl">
                Arbeitsbereiche
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {managerActionCards.map((item) => {
                const Icon = iconMap[item.icon as keyof typeof iconMap];

                return (
                  <div
                    key={item.title}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-white p-2 text-slate-700 shadow-sm shadow-slate-900/5">
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
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="app-panel bg-white">
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
                  className="grid gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[0.8fr_1fr_auto]"
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

          <Card className="app-panel bg-white">
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
                  Externe Kostenbloecke und Margenparameter werden vorbereitet.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-medium text-amber-900">
                  2. Neue Miete berechnen
                </p>
                <p className="mt-1 text-sm leading-6 text-amber-800">
                  Delta, Begruendung und Aufschluesselung werden fixiert.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-sky-200 bg-sky-50 p-4">
                <p className="text-sm font-medium text-sky-900">
                  3. Veroeffentlichen
                </p>
                <p className="mt-1 text-sm leading-6 text-sky-800">
                  Mieter, Historie und Audit-Log sehen denselben Stand.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
