"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, Building2, Home } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import type { LoginInput } from "@/lib/validation/auth";
import { loginSchema } from "@/lib/validation/auth";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormProps = {
  callbackUrl: string;
};

const demoAccounts = [
  {
    description: "Objekte, Mieten und Service bearbeiten",
    email: "manager@mietklar.demo",
    icon: Building2,
    label: "Als Verwalter testen",
    password: "Demo12345!",
  },
  {
    description: "Miete, Dokumente und Service sehen",
    email: "mieter@mietklar.demo",
    icon: Home,
    label: "Als Mieter testen",
    password: "Demo12345!",
  },
] as const;

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<LoginInput>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });

  const {
    formState: { errors },
    register,
  } = form;

  async function authenticate(values: LoginInput) {
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (!result || result.error) {
      setError("Login fehlgeschlagen. Bitte Zugangsdaten pruefen.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  // UX-Grund: Zwei grosse Direktaktionen erlauben einen Demo-Login ohne Tipparbeit, die manuelle Eingabe bleibt als sichere Ausweichmoeglichkeit erhalten.
  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit((values) => {
        setError(null);

        startTransition(async () => {
          await authenticate(values);
        });
      })}
    >
      <div className="space-y-3">
        {demoAccounts.map((account) => {
          const Icon = account.icon;

          return (
            <Button
              key={account.email}
              className="h-auto min-h-16 w-full justify-between rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 text-left text-slate-950 hover:bg-slate-50"
              disabled={isPending}
              onClick={() => {
                setError(null);
                startTransition(async () => {
                  await authenticate({
                    email: account.email,
                    password: account.password,
                  });
                });
              }}
              type="button"
              variant="outline"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <Icon className="size-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold">{account.label}</p>
                  <p className="text-sm font-normal text-slate-600">
                    {account.description}
                  </p>
                </div>
              </div>
              <ArrowRight className="size-4 shrink-0" />
            </Button>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
          oder mit E-Mail
        </p>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Anmeldung fehlgeschlagen</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">E-Mail</Label>
        <Input
          autoComplete="email"
          className="h-12 rounded-2xl px-4 text-base"
          id="email"
          placeholder="name@beispiel.de"
          {...register("email")}
        />
        {errors.email ? (
          <p className="text-destructive text-sm">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Passwort</Label>
        <Input
          autoComplete="current-password"
          className="h-12 rounded-2xl px-4 text-base"
          id="password"
          type="password"
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-destructive text-sm">{errors.password.message}</p>
        ) : null}
      </div>

      <Button
        className="h-12 w-full rounded-[1.5rem] text-base font-semibold"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Melde an..." : "Anmelden"}
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}
