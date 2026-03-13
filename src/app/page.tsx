import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BrandMark } from "@/components/brand/brand-mark";
import { SiteHeader } from "@/components/layout/site-header";
import { MetricCard } from "@/components/shared/metric-card";
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
  marketingStats,
  portalHighlights,
  rentBreakdownPreview,
  transparencyPillars,
} from "@/lib/demo-data";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

const toneClasses = {
  accent: "bg-amber-200 text-amber-950",
  primary: "bg-primary/15 text-primary",
  secondary: "bg-emerald-100 text-emerald-900",
};

export default function Home() {
  return (
    <div className="min-h-screen">
      <SiteHeader activePath="/" />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 pt-6 pb-16 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="overflow-hidden border-white/70 bg-white/90 shadow-xl shadow-slate-900/5 backdrop-blur">
            <CardContent className="surface-grid relative overflow-hidden px-5 py-6 sm:px-8 sm:py-8">
              <div className="via-primary/40 absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                  Mandantenfaehiges MVP
                </Badge>
                <Badge className="bg-white/80 text-slate-700 hover:bg-white/80">
                  Mobile-first
                </Badge>
                <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">
                  Transparenz statt Black Box
                </Badge>
              </div>

              <div className="mt-6 max-w-3xl space-y-5">
                <div className="text-muted-foreground flex items-center gap-3 text-sm font-medium">
                  <BrandMark compact />
                  <span>
                    Oeffentliche SaaS-Anwendung fuer faire, nachvollziehbare
                    Vermietung
                  </span>
                </div>
                <h1 className="font-display max-w-3xl text-4xl leading-tight font-semibold text-slate-950 sm:text-5xl">
                  Jede Miete. Jeder Kostenblock. Jede Aenderung offen erklaert.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                  MietKlar verbindet Vermieter und Mieter ueber dieselbe
                  Datenbasis: Kostenpositionen, offene Vermietermarge,
                  Servicefaelle, Dokumente und Mitteilungen bleiben
                  uebersichtlich, historisiert und nachvollziehbar.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  className={cn(
                    buttonVariants(),
                    "h-12 rounded-full px-5 text-sm font-semibold",
                  )}
                  href="/manager"
                >
                  Manager-Demo ansehen
                  <ArrowRight className="ml-2 size-4" />
                </Link>
                <Link
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-12 rounded-full px-5 text-sm font-semibold",
                  )}
                  href="/mieter"
                >
                  Mieter-Demo ansehen
                </Link>
              </div>
              <p className="text-muted-foreground mt-4 text-sm">
                Demo-Logins fuer geschuetzte Portale unter{" "}
                <Link
                  className="text-primary underline-offset-4 hover:underline"
                  href="/login"
                >
                  /login
                </Link>
                .
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/10 bg-slate-950 text-slate-50 shadow-xl shadow-slate-950/10">
            <CardHeader className="pb-3">
              <CardDescription className="text-slate-300">
                Live-Prinzip im Produkt
              </CardDescription>
              <CardTitle className="font-display text-2xl">
                Transparenz-Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-300">
                      Warmmiete Maerz 2026
                    </p>
                    <p className="font-display mt-1 text-3xl font-semibold">
                      {formatCurrency(1720)}
                    </p>
                  </div>
                  <Badge className="bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/15">
                    Delta -18 EUR
                  </Badge>
                </div>
                <div className="mt-5 space-y-3">
                  {rentBreakdownPreview.map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <div>
                          <p className="font-medium text-slate-100">
                            {item.label}
                          </p>
                          <p className="text-slate-400">{item.detail}</p>
                        </div>
                        <span className="font-semibold text-slate-50">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10">
                        <div
                          className={`h-2 rounded-full ${toneClasses[item.tone]}`}
                          style={{ width: `${item.share}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-300">
                    Veroeffentlichtes Snapshot-Modell
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-100">
                    Nach Freigabe ist jede Mietzusammensetzung revisionssicher
                    historisiert.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-slate-300">Tenant-Sichtbarkeit</p>
                  <p className="mt-2 text-sm leading-6 text-slate-100">
                    Mieter sehen nur die eigenen Vertraege, Dokumente,
                    Servicefaelle und Mitteilungen.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {marketingStats.map((item) => (
            <MetricCard
              key={item.label}
              detail={item.detail}
              label={item.label}
              trend={item.trend}
              value={item.value}
            />
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="border-primary/10 bg-white/90 shadow-lg shadow-slate-900/5">
            <CardHeader>
              <CardDescription>Warum MietKlar</CardDescription>
              <CardTitle className="font-display text-2xl">
                Produktlogik statt PDF-Silos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {transparencyPillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 text-primary rounded-2xl p-2">
                      <pillar.icon className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="font-display text-lg font-semibold text-slate-950">
                        {pillar.title}
                      </h2>
                      <p className="text-sm leading-6 text-slate-600">
                        {pillar.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            {portalHighlights.map((portal) => (
              <Card
                key={portal.title}
                className="border-primary/10 bg-white/90 shadow-lg shadow-slate-900/5"
              >
                <CardHeader>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/10 w-fit">
                    {portal.badge}
                  </Badge>
                  <CardTitle className="font-display text-2xl">
                    {portal.title}
                  </CardTitle>
                  <CardDescription>{portal.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {portal.points.map((point) => (
                    <div
                      key={point}
                      className="rounded-2xl border border-slate-200/70 bg-slate-50/70 px-4 py-3 text-sm text-slate-700"
                    >
                      {point}
                    </div>
                  ))}
                  <Link
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "mt-2 inline-flex w-full rounded-full",
                    )}
                    href={portal.href}
                  >
                    {portal.cta}
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200/70 bg-white/80 px-5 py-6 shadow-lg shadow-slate-900/5 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-2">
              <Badge className="bg-slate-900 text-slate-50 hover:bg-slate-900">
                MVP-Fokus
              </Badge>
              <h2 className="font-display text-3xl font-semibold text-slate-950">
                Schrittweise zum produktionsnahen Vermietungs-Backbone
              </h2>
              <p className="text-sm leading-6 text-slate-600 sm:text-base">
                Die naechsten Phasen bringen das Domainmodell, echte Rollen,
                Prisma, Snapshot-Logik, Tenant-Guards und End-to-End-Flows auf
                dieselbe Basis.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "rounded-full",
                )}
                href="https://github.com/d0npedro/mietklar"
              >
                GitHub-Repo
              </Link>
              <Link
                className={cn(buttonVariants(), "rounded-full")}
                href="/manager"
              >
                Demo starten
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
