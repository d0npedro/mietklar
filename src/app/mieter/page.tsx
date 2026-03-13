import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  FileText,
  Home,
  MessageCircleMore,
  ShieldCheck,
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
  announcementsPreview,
  rentBreakdownPreview,
  tenantDocumentsPreview,
  tenantTimeline,
} from "@/lib/demo-data";
import { formatCurrency, formatDelta } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export default function TenantPage() {
  // UX-Grund: Die Mieter-Vorschau spiegelt das spaetere Portal mit einer linearen, leicht lesbaren Reihenfolge wider.
  return (
    <div className="min-h-screen">
      <SiteHeader activePath="/mieter" />
      <main
        className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"
        id="main-content"
      >
        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="app-panel bg-white">
            <CardHeader className="gap-4">
              <Badge className="w-fit bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
                Mieterbereich
              </Badge>
              <div className="space-y-3">
                <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-950">
                  Ich wohne hier
                </h1>
                <CardDescription className="max-w-2xl text-base leading-7 text-slate-600">
                  Sie sehen Ihre Miete, Aenderungen, Dokumente und Hilfe an
                  einem Ort.
                </CardDescription>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  className={cn(
                    buttonVariants(),
                    "min-h-12 rounded-2xl px-4 text-base",
                  )}
                  href="/login?next=/portal/mieter"
                >
                  Mieter-Demo oeffnen
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "min-h-12 rounded-2xl px-4 text-base",
                  )}
                  href="/manager"
                >
                  Verwaltung ansehen
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
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
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-900">
                    <ShieldCheck className="size-4" />
                    <p className="text-sm font-medium">Nur meine Daten</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Ihre Ansicht zeigt nur Ihr Mietverhaeltnis, Ihre Dokumente
                    und Ihre Mitteilungen.
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-900">
                    <MessageCircleMore className="size-4" />
                    <p className="text-sm font-medium">Hilfe schnell melden</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Servicefaelle bleiben im Verlauf sichtbar, damit Sie nicht
                    nachfragen muessen.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="app-panel bg-slate-950 text-slate-50">
            <CardHeader>
              <CardDescription className="text-slate-300">
                Was sich geaendert hat
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

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Home,
              text: "Jede aktuelle Miete wird in Klartext erklaert.",
              title: "Miete verstehen",
            },
            {
              icon: FileText,
              text: "Freigegebene Unterlagen liegen gesammelt bereit.",
              title: "Unterlagen finden",
            },
            {
              icon: MessageCircleMore,
              text: "Probleme melden und den Status spaeter wiederfinden.",
              title: "Hilfe verfolgen",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} className="app-panel bg-white">
                <CardContent className="space-y-4 p-5">
                  <div className="flex size-12 items-center justify-center rounded-[1.3rem] bg-slate-100 text-slate-700">
                    <Icon className="size-6" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="font-display text-xl font-semibold text-slate-950">
                      {item.title}
                    </h2>
                    <p className="text-sm leading-6 text-slate-600">
                      {item.text}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
          <Card className="app-panel bg-white">
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
                  className="flex items-center justify-between gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-white p-2 text-slate-700 shadow-sm shadow-slate-900/5">
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

          <Card className="app-panel bg-white">
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
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center gap-2 text-slate-900">
                    <BellRing className="size-4" />
                    <p className="text-sm font-medium">{announcement.title}</p>
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
