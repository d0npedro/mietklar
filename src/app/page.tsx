import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Building2,
  FileText,
  HomeIcon,
  ReceiptText,
  Wrench,
} from "lucide-react";

import { BrandMark } from "@/components/brand/brand-mark";
import { SiteHeader } from "@/components/layout/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-styles";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const entryPoints = [
  {
    description: "Miete sehen, Aenderungen verstehen, Unterlagen finden.",
    href: "/mieter",
    icon: HomeIcon,
    label: "Ich wohne hier",
    points: ["Mietaufschluesselung", "Dokumente", "Servicefall melden"],
  },
  {
    description: "Objekte pflegen, neue Mieten freigeben, Service koordinieren.",
    href: "/manager",
    icon: Building2,
    label: "Ich verwalte Wohnungen",
    points: ["Bestand pflegen", "Kosten und Marge", "Service steuern"],
  },
] as const;

const promises = [
  {
    description: "Jede Miete wird in Kosten und offene Marge zerlegt.",
    icon: ReceiptText,
    title: "Miete klar sehen",
  },
  {
    description: "Dokumente, Mitteilungen und Servicefaelle bleiben an einem Ort.",
    icon: FileText,
    title: "Alles schnell finden",
  },
  {
    description: "Aenderungen bleiben datiert, begruendet und spaeter nachvollziehbar.",
    icon: BellRing,
    title: "Aenderungen verstehen",
  },
] as const;

export default function Home() {
  // UX-Grund: Die Startseite stellt nur eine Kernfrage, damit niemand zuerst Marketing lesen muss.
  return (
    <div className="min-h-screen">
      <SiteHeader activePath="/" />
      <main
        className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8"
        id="main-content"
      >
        <section className="app-panel surface-grid px-5 py-6 sm:px-8 sm:py-8">
          <div className="max-w-3xl space-y-4">
            <Badge className="bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
              Oeffentliche Demo
            </Badge>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <BrandMark compact />
              <span>Transparente Vermietung ohne Fachsprache</span>
            </div>
            <h1 className="font-display text-4xl leading-tight font-semibold text-slate-950 sm:text-5xl">
              Was moechten Sie heute sehen?
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              MietKlar fuehrt Sie direkt in den passenden Bereich. Keine
              komplizierte Navigation, keine versteckten Schritte.
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {entryPoints.map((entry) => {
              const Icon = entry.icon;

              return (
                <Link
                  key={entry.href}
                  className="app-panel block rounded-[1.9rem] border border-slate-200 bg-white p-5 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/30"
                  href={entry.href}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex size-12 items-center justify-center rounded-[1.3rem] bg-slate-100 text-slate-700">
                      <Icon className="size-6" />
                    </div>
                    <ArrowRight className="mt-1 size-5 text-slate-400" />
                  </div>
                  <h2 className="mt-5 font-display text-2xl font-semibold text-slate-950">
                    {entry.label}
                  </h2>
                  <p className="mt-2 text-base leading-7 text-slate-600">
                    {entry.description}
                  </p>
                  <div className="mt-5 space-y-2">
                    {entry.points.map((point) => (
                      <div
                        key={point}
                        className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
                      >
                        {point}
                      </div>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {promises.map((item) => {
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
                    <p className="text-base leading-7 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="app-panel rounded-[2rem] bg-white px-5 py-6 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-2">
              <Badge className="bg-slate-900 text-slate-50 hover:bg-slate-900">
                Schnellstart
              </Badge>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-950">
                Bereits ein Konto oder direkt zur Demo?
              </h2>
              <p className="text-base leading-7 text-slate-600">
                Der Portalzugang bleibt immer derselbe. Von dort aus geht es
                automatisch in den passenden Bereich.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "min-h-12 rounded-2xl px-4 text-base",
                )}
                href="https://github.com/d0npedro/mietklar"
              >
                GitHub-Repo
              </Link>
              <Link
                className={cn(
                  buttonVariants(),
                  "min-h-12 rounded-2xl px-4 text-base",
                )}
                href="/login"
              >
                Zum Portal
                <Wrench className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
