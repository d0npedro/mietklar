"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import type { ManagerPortalData } from "@/lib/server/portal-queries";
import { updateServiceCaseStatusSchema } from "@/lib/validation/manager";

import {
  buildServiceDefaults,
  dashboardQueryKey,
  FieldError,
  FormFeedback,
  formatDateLabel,
  getServiceTone,
  priorityLabels,
  selectClassName,
  serviceStatusLabels,
  submitJson,
  textareaClassName,
} from "@/components/manager/manager-shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ServiceTab({ data }: { data: ManagerPortalData }) {
  const queryClient = useQueryClient();
  const [activeServiceCaseId, setActiveServiceCaseId] = useState(
    data.serviceCases[0]?.id ?? "",
  );
  const [feedback, setFeedback] = useState({
    error: null as string | null,
    message: null as string | null,
  });
  const resolvedActiveServiceCaseId = data.serviceCases.some(
    (serviceCase) => serviceCase.id === activeServiceCaseId,
  )
    ? activeServiceCaseId
    : data.serviceCases[0]?.id ?? "";

  const activeServiceCase =
    data.serviceCases.find(
      (serviceCase) => serviceCase.id === resolvedActiveServiceCaseId,
    ) ??
    data.serviceCases[0] ??
    null;

  const form = useForm({
    defaultValues: buildServiceDefaults(activeServiceCase ?? undefined),
    resolver: zodResolver(updateServiceCaseStatusSchema),
  });

  useEffect(() => {
    form.reset(buildServiceDefaults(activeServiceCase ?? undefined));
  }, [activeServiceCase, form]);

  const mutation = useMutation({
    mutationFn: (input: unknown) =>
      submitJson("/api/manager/service-cases", "PATCH", input),
    onError: (error: Error) =>
      setFeedback({ error: error.message, message: null }),
    onSuccess: async (result) => {
      setFeedback({
        error: null,
        message: result.message ?? "Servicefall aktualisiert.",
      });
      await queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    },
  });

  const errors = form.formState.errors;

  // UX-Grund: Servicearbeit startet immer mit einem sichtbar ausgewaehlten Fall, damit Statusaenderungen nicht auf das falsche Ticket gehen.
  return (
    <div className="space-y-6">
      <Card className="app-panel bg-white">
        <CardHeader>
          <CardDescription>Welchen Servicefall bearbeiten Sie?</CardDescription>
          <CardTitle className="font-display text-2xl">
            Servicefall aktualisieren
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service-case">Servicefall</Label>
            <select
              className={selectClassName}
              id="service-case"
              onChange={(event) => setActiveServiceCaseId(event.target.value)}
              value={resolvedActiveServiceCaseId}
            >
              {data.serviceCases.map((serviceCase) => (
                <option key={serviceCase.id} value={serviceCase.id}>
                  {serviceCase.caseNumber} - {serviceCase.title}
                </option>
              ))}
            </select>
          </div>

          {activeServiceCase ? (
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950">
                    {activeServiceCase.title}
                  </p>
                  <p className="text-sm text-slate-500">
                    {activeServiceCase.propertyName} - Einheit{" "}
                    {activeServiceCase.unitCode}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">
                    {priorityLabels[activeServiceCase.priority] ??
                      activeServiceCase.priority}
                  </Badge>
                  <Badge className={getServiceTone(activeServiceCase.status)}>
                    {serviceStatusLabels[activeServiceCase.status] ??
                      activeServiceCase.status}
                  </Badge>
                </div>
              </div>
            </div>
          ) : null}

          <FormFeedback error={feedback.error} message={feedback.message} />
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) => {
              setFeedback({ error: null, message: null });
              mutation.mutate(values);
            })}
          >
            <input type="hidden" {...form.register("serviceCaseId")} />
            <div className="space-y-2">
              <Label htmlFor="service-status">Neuer Status</Label>
              <select
                className={selectClassName}
                id="service-status"
                {...form.register("status")}
              >
                {Object.entries(serviceStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <FieldError message={errors.status?.message?.toString()} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-detail">Notiz</Label>
              <Textarea
                className={textareaClassName}
                id="service-detail"
                rows={4}
                {...form.register("detail")}
              />
            </div>
            <Button
              className="h-12 w-full rounded-[1.5rem] text-base font-semibold"
              disabled={mutation.isPending || !activeServiceCase}
              type="submit"
            >
              {mutation.isPending ? "Speichere..." : "Status speichern"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="app-panel bg-white">
          <CardHeader>
            <CardDescription>Alle offenen und letzten Faelle</CardDescription>
            <CardTitle className="font-display text-2xl">
              Servicefaelle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.serviceCases.map((serviceCase) => (
              <div
                key={serviceCase.id}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">
                      {serviceCase.caseNumber} - {serviceCase.title}
                    </p>
                    <p className="text-sm text-slate-500">
                      {serviceCase.propertyName} - Einheit {serviceCase.unitCode}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">
                      {priorityLabels[serviceCase.priority] ?? serviceCase.priority}
                    </Badge>
                    <Badge className={getServiceTone(serviceCase.status)}>
                      {serviceStatusLabels[serviceCase.status] ?? serviceCase.status}
                    </Badge>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Angelegt am {formatDateLabel(serviceCase.createdAt)} - zugewiesen
                  an {serviceCase.assignedToName ?? "Niemanden"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="app-panel bg-white">
          <CardHeader>
            <CardDescription>Nachvollziehbarkeit</CardDescription>
            <CardTitle className="font-display text-2xl">Audit-Log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.auditEntries.map((entry) => (
              <div
                key={entry.id}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <p className="font-semibold text-slate-950">{entry.summary}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {entry.entityType} - {entry.action}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {formatDateLabel(entry.createdAt)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
