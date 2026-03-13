import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { BrandMark } from "@/components/brand/brand-mark";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  const params = await searchParams;
  const authReady = Boolean(
    process.env.DATABASE_URL && process.env.NEXTAUTH_SECRET,
  );

  if (session?.user?.id) {
    redirect("/portal");
  }

  const callbackUrl = params.next ?? "/portal";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center gap-6 px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
      <section className="space-y-5">
        <BrandMark />
        <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
          Auth & Rollen
        </Badge>
        <div className="space-y-3">
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Geschuetzte Portale fuer Manager und Mieter
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-600">
            Phase 3 fuehrt Login, Session-Handling und Rollenwachen ein. Die
            Zugriffe greifen auf die lokal geseedete PostgreSQL-Datenbasis zu.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="bg-white/80">
            <CardHeader>
              <CardDescription>Demo Manager</CardDescription>
              <CardTitle className="text-lg">manager@mietklar.demo</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Passwort:{" "}
              <span className="font-medium text-slate-950">Demo12345!</span>
            </CardContent>
          </Card>
          <Card className="bg-white/80">
            <CardHeader>
              <CardDescription>Demo Mieter</CardDescription>
              <CardTitle className="text-lg">mieter@mietklar.demo</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Passwort:{" "}
              <span className="font-medium text-slate-950">Demo12345!</span>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            className="text-primary underline-offset-4 hover:underline"
            href="/manager"
          >
            Oeffentliche Manager-Vorschau
          </Link>
          <Link
            className="text-primary underline-offset-4 hover:underline"
            href="/mieter"
          >
            Oeffentliche Mieter-Vorschau
          </Link>
        </div>
      </section>

      <Card className="border-primary/10 bg-white/92 shadow-xl shadow-slate-900/5">
        <CardHeader>
          <CardDescription>Sichere Anmeldung</CardDescription>
          <CardTitle className="font-display text-2xl">
            Zum Portal einloggen
          </CardTitle>
        </CardHeader>
        <CardContent>
          {authReady ? (
            <LoginForm callbackUrl={callbackUrl} />
          ) : (
            <div className="space-y-4 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
              <p className="font-medium">
                Portal-Login ist in dieser Umgebung noch nicht freigeschaltet.
              </p>
              <p className="leading-6">
                Fuer den produktiven Online-Login werden spaeter mindestens
                `DATABASE_URL`, `NEXTAUTH_SECRET` und `NEXTAUTH_URL` in Vercel
                benoetigt. Lokal funktioniert der Login bereits mit den
                Seed-Daten.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
