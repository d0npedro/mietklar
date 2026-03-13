import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Building2, Home } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-styles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import {
  demoAccounts,
  getRecommendedDemoRole,
} from "@/lib/demo-accounts";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const authReady = Boolean(
    process.env.DATABASE_URL && process.env.NEXTAUTH_SECRET,
  );

  if (authReady) {
    const session = await auth();

    if (session?.user?.id) {
      redirect("/portal");
    }
  }

  const callbackUrl = params.next ?? "/portal";
  const recommendedDemoRole = getRecommendedDemoRole(callbackUrl);

  // UX-Grund: Login startet mit einer einfachen Rollenwahl und zeigt Demo-Zugaenge direkt am Ort der Entscheidung.
  return (
    <main
      className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-6 px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:px-8"
      id="main-content"
    >
      <section className="space-y-6">
        <Badge className="bg-primary/10 px-3 py-1 text-primary hover:bg-primary/10">
          Portalzugang
        </Badge>
        <div className="space-y-3">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Zum passenden Bereich anmelden
          </h1>
          <p className="max-w-xl text-lg leading-8 text-slate-600">
            Waehlen Sie direkt ein Demo-Konto oder melden Sie sich mit Ihren
            eigenen Zugangsdaten an.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {demoAccounts.map((account) => {
            const Icon = account.role === "manager" ? Building2 : Home;

            return (
              <Card key={account.email} className="app-panel bg-white">
                <CardHeader className="gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <CardDescription>
                      {account.role === "manager" ? "Verwaltung" : "Mieter"}
                    </CardDescription>
                    <CardTitle className="text-lg">{account.email}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">
                  Passwort:{" "}
                  <span className="font-semibold text-slate-950">
                    Demo12345!
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            className="text-primary underline-offset-4 hover:underline"
            href="/manager"
          >
            Verwaltung zuerst ansehen
          </Link>
          <Link
            className="text-primary underline-offset-4 hover:underline"
            href="/mieter"
          >
            Mieterbereich zuerst ansehen
          </Link>
        </div>
      </section>

      <Card className="app-panel bg-white">
        <CardHeader className="gap-3">
          <CardDescription>Sichere Anmeldung</CardDescription>
          <CardTitle className="font-display text-2xl">
            Jetzt ins Portal
          </CardTitle>
        </CardHeader>
        <CardContent>
          {authReady ? (
            <LoginForm callbackUrl={callbackUrl} />
          ) : (
            <div className="space-y-4 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <p className="font-medium">
                Online-Login ist in dieser Umgebung noch nicht freigeschaltet.
              </p>
              <p className="leading-6">
                Lokal funktioniert der Login mit den Seed-Daten bereits. Fuer
                die Live-Demo fehlen noch die benoetigten Vercel-Variablen fuer
                Datenbank und Auth. Bis dahin fuehren die Demo-Buttons direkt in
                die passende Ansicht.
              </p>
              <div className="space-y-3">
                {demoAccounts.map((account) => {
                  const Icon = account.role === "manager" ? Building2 : Home;
                  const isRecommended = account.role === recommendedDemoRole;

                  return (
                    <Link
                      key={account.email}
                      className={cn(
                        buttonVariants({
                          variant: isRecommended ? "default" : "outline",
                        }),
                        "flex min-h-16 w-full items-center justify-between rounded-[1.5rem] px-4 py-4 text-left text-base",
                        !isRecommended && "bg-white",
                      )}
                      href={account.previewHref}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex size-11 items-center justify-center rounded-2xl",
                            isRecommended
                              ? "bg-white/15 text-white"
                              : "bg-slate-100 text-slate-700",
                          )}
                        >
                          <Icon className="size-5" />
                        </span>
                        <span className="space-y-1">
                          <span className="block font-semibold">
                            {account.previewLabel}
                          </span>
                          <span
                            className={cn(
                              "block text-sm",
                              isRecommended
                                ? "text-white/80"
                                : "text-slate-600",
                            )}
                          >
                            {account.description}
                          </span>
                        </span>
                      </span>
                      <ArrowRight className="size-4 shrink-0" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
