"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight } from "lucide-react";
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

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<LoginInput>({
    defaultValues: {
      email: "manager@mietklar.demo",
      password: "Demo12345!",
    },
    resolver: zodResolver(loginSchema),
  });

  const {
    formState: { errors },
    register,
  } = form;

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        setError(null);

        startTransition(async () => {
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
        });
      })}
    >
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
          id="email"
          placeholder="manager@mietklar.demo"
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
          id="password"
          type="password"
          {...register("password")}
        />
        {errors.password ? (
          <p className="text-destructive text-sm">{errors.password.message}</p>
        ) : null}
      </div>

      <Button
        className="h-11 w-full rounded-full"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Melde an..." : "Anmelden"}
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}
