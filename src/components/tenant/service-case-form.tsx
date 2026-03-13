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
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 h-11 w-full rounded-lg border bg-transparent px-3 text-sm outline-none focus-visible:ring-3";

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

  return (
    <form
      className="space-y-4"
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
        <Label htmlFor="tenant-case-title">Titel</Label>
        <Input id="tenant-case-title" {...form.register("title")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tenant-case-priority">Prioritaet</Label>
        <select
          className={selectClassName}
          id="tenant-case-priority"
          {...form.register("priority")}
        >
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
          <option value="urgent">urgent</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tenant-case-description">Beschreibung</Label>
        <Textarea
          id="tenant-case-description"
          rows={5}
          {...form.register("description")}
        />
      </div>

      <Button className="h-11 rounded-full" disabled={mutation.isPending} type="submit">
        {mutation.isPending ? "Sende..." : "Servicefall melden"}
      </Button>
    </form>
  );
}
