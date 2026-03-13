"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CircleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { createTenantServiceCaseSchema } from "@/lib/validation/tenant";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const selectClassName =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 h-12 w-full rounded-2xl border bg-transparent px-4 text-base outline-none focus-visible:ring-3";

const priorityOptions = [
  { label: "Niedrig", value: "low" },
  { label: "Mittel", value: "medium" },
  { label: "Hoch", value: "high" },
  { label: "Sofort", value: "urgent" },
] as const;

async function submitServiceCase(input: unknown) {
  const response = await fetch("/api/tenant/service-cases", {
    body: JSON.stringify(input),
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const payload = (await response.json().catch(() => null)) as
    | { error?: string; message?: string }
    | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? "Servicefall konnte nicht angelegt werden.");
  }

  return payload?.message ?? "Servicefall angelegt.";
}

export function TenantServiceCaseForm() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{
    error: string | null;
    message: string | null;
  }>({ error: null, message: null });
  const form = useForm({
    defaultValues: {
      description: "",
      priority: "medium" as const,
      title: "",
    },
    resolver: zodResolver(createTenantServiceCaseSchema),
  });

  const mutation = useMutation({
    mutationFn: submitServiceCase,
    onError: (error: Error) =>
      setFeedback({ error: error.message, message: null }),
    onSuccess: (message) => {
      form.reset();
      setFeedback({ error: null, message });
      router.refresh();
    },
  });

  // UX-Grund: Das Formular verwendet Alltagssprache und grosse Touch-Ziele, damit Mieter ihr Problem ohne Fachwissen erfassen koennen.
  return (
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit((values) => {
        setFeedback({ error: null, message: null });
        mutation.mutate(values);
      })}
    >
      {feedback.error || feedback.message ? (
        <Alert variant={feedback.error ? "destructive" : "default"}>
          <CircleAlert className="size-4" />
          <AlertTitle>
            {feedback.error ? "Anlage fehlgeschlagen" : "Servicefall erfasst"}
          </AlertTitle>
          <AlertDescription>{feedback.error ?? feedback.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="tenant-case-title">Worum geht es?</Label>
        <Input
          className="h-12 rounded-2xl px-4 text-base"
          id="tenant-case-title"
          placeholder="Zum Beispiel: Heizung wird nicht warm"
          {...form.register("title")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tenant-case-priority">Wie dringend ist es?</Label>
        <select
          className={selectClassName}
          id="tenant-case-priority"
          {...form.register("priority")}
        >
          {priorityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tenant-case-description">Was ist passiert?</Label>
        <Textarea
          className="min-h-32 rounded-3xl px-4 py-3 text-base"
          id="tenant-case-description"
          placeholder="Beschreiben Sie kurz, was nicht funktioniert und seit wann es auffaellt."
          rows={5}
          {...form.register("description")}
        />
      </div>

      <Button
        className="h-12 w-full rounded-[1.5rem] text-base font-semibold"
        disabled={mutation.isPending}
        type="submit"
      >
        {mutation.isPending ? "Sende..." : "Servicefall melden"}
      </Button>
    </form>
  );
}
