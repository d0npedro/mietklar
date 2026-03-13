"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import type { ManagerPortalData } from "@/lib/server/portal-queries";
import {
  createLeaseCostItemSchema,
  publishSnapshotSchema,
  updateLeaseSchema,
} from "@/lib/validation/manager";
import { formatCurrency, formatDelta } from "@/lib/formatters";

import {
  buildCostItemDefaults,
  buildLeaseDefaults,
  buildSnapshotDefaults,
  dashboardQueryKey,
  FieldError,
  FormFeedback,
  formatDateLabel,
  getLeaseSummary,
  inputClassName,
  leaseStatusLabels,
  marginTypeLabels,
  selectClassName,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function LeaseTab({ data }: { data: ManagerPortalData }) {
  const queryClient = useQueryClient();
  const [activeLeaseId, setActiveLeaseId] = useState(data.leases[0]?.id ?? "");
  const [leaseFeedback, setLeaseFeedback] = useState({
    error: null as string | null,
    message: null as string | null,
  });
  const [costFeedback, setCostFeedback] = useState({
    error: null as string | null,
    message: null as string | null,
  });
  const [snapshotFeedback, setSnapshotFeedback] = useState({
    error: null as string | null,
    message: null as string | null,
  });
  const resolvedActiveLeaseId = data.leases.some(
    (lease) => lease.id === activeLeaseId,
  )
    ? activeLeaseId
    : data.leases[0]?.id ?? "";

  const activeLease =
    data.leases.find((lease) => lease.id === resolvedActiveLeaseId) ??
    data.leases[0] ??
    null;
  const currentSummary = getLeaseSummary(activeLease ?? undefined);

  const leaseForm = useForm({
    defaultValues: buildLeaseDefaults(activeLease ?? undefined),
    resolver: zodResolver(updateLeaseSchema),
  });

  const costItemForm = useForm({
    defaultValues: buildCostItemDefaults(
      activeLease?.id ?? "",
      data.costCategories[0],
    ),
    resolver: zodResolver(createLeaseCostItemSchema),
  });

  const snapshotForm = useForm({
    defaultValues: buildSnapshotDefaults(activeLease?.id ?? "", data.changeReasons[0]),
    resolver: zodResolver(publishSnapshotSchema),
  });

  useEffect(() => {
    leaseForm.reset(buildLeaseDefaults(activeLease ?? undefined));
    costItemForm.reset(
      buildCostItemDefaults(activeLease?.id ?? "", data.costCategories[0]),
    );
    snapshotForm.reset(
      buildSnapshotDefaults(activeLease?.id ?? "", data.changeReasons[0]),
    );
  }, [
    activeLease,
    costItemForm,
    data.changeReasons,
    data.costCategories,
    leaseForm,
    snapshotForm,
  ]);

  const leaseMutation = useMutation({
    mutationFn: (input: unknown) =>
      submitJson("/api/manager/leases", "PATCH", input),
    onError: (error: Error) =>
      setLeaseFeedback({ error: error.message, message: null }),
    onSuccess: async (result) => {
      setLeaseFeedback({
        error: null,
        message: result.message ?? "Mietvertrag aktualisiert.",
      });
      await queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    },
  });

  const costItemMutation = useMutation({
    mutationFn: (input: unknown) =>
      submitJson("/api/manager/cost-items", "POST", input),
    onError: (error: Error) =>
      setCostFeedback({ error: error.message, message: null }),
    onSuccess: async (result) => {
      costItemForm.reset(
        buildCostItemDefaults(activeLease?.id ?? "", data.costCategories[0]),
      );
      setCostFeedback({
        error: null,
        message: result.message ?? "Kostenposition angelegt.",
      });
      await queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    },
  });

  const snapshotMutation = useMutation({
    mutationFn: (input: unknown) =>
      submitJson("/api/manager/snapshots", "POST", input),
    onError: (error: Error) =>
      setSnapshotFeedback({ error: error.message, message: null }),
    onSuccess: async (result) => {
      setSnapshotFeedback({
        error: null,
        message: result.message ?? "Neue Miete veroeffentlicht.",
      });
      await queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    },
  });

  const leaseErrors = leaseForm.formState.errors;
  const costErrors = costItemForm.formState.errors;
  const snapshotErrors = snapshotForm.formState.errors;

  // UX-Grund: Mietpflege folgt einer festen Reihenfolge: Vertrag waehlen, Kosten pflegen, neue Miete veroeffentlichen.
  return (
    <div className="space-y-6">
      <Card className="app-panel bg-white">
        <CardHeader>
          <CardDescription>Welchen Vertrag bearbeiten Sie?</CardDescription>
          <CardTitle className="font-display text-2xl">
            Mietvertrag auswaehlen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="active-lease">Mietvertrag</Label>
            <select
              className={selectClassName}
              id="active-lease"
              onChange={(event) => setActiveLeaseId(event.target.value)}
              value={resolvedActiveLeaseId}
            >
              {data.leases.map((lease) => (
                <option key={lease.id} value={lease.id}>
                  {lease.reference} - {lease.propertyName} - {lease.unitCode}
                </option>
              ))}
            </select>
          </div>

          {activeLease ? (
            <div className="grid gap-3 lg:grid-cols-3">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Aktuelle Miete</p>
                <p className="font-display mt-2 text-3xl font-semibold text-slate-950">
                  {currentSummary.currentRent
                    ? formatCurrency(currentSummary.currentRent)
                    : "Noch offen"}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {activeLease.tenantNames.join(", ") || "Kein Mieter"}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Marge</p>
                <p className="font-display mt-2 text-3xl font-semibold text-slate-950">
                  {marginTypeLabels[activeLease.marginType] ?? activeLease.marginType}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Wert: {activeLease.marginValue}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Letzte Aenderung</p>
                <p className="font-display mt-2 text-3xl font-semibold text-slate-950">
                  {currentSummary.latestChange
                    ? formatDelta(currentSummary.latestChange.deltaAmount)
                    : "Noch keine"}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {currentSummary.latestChange
                    ? currentSummary.latestChange.reasonLabel
                    : "Noch nichts veroeffentlicht"}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Noch kein Mietvertrag vorhanden.
            </div>
          )}
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="app-panel bg-white">
          <CardHeader>
            <CardDescription>Schritt 1</CardDescription>
            <CardTitle className="font-display text-2xl">
              Vertragsdaten pflegen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormFeedback error={leaseFeedback.error} message={leaseFeedback.message} />
            <form
              className="space-y-4"
              onSubmit={leaseForm.handleSubmit((values) => {
                setLeaseFeedback({ error: null, message: null });
                leaseMutation.mutate(values);
              })}
            >
              <input type="hidden" {...leaseForm.register("leaseId")} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lease-status">Status</Label>
                  <select
                    className={selectClassName}
                    id="lease-status"
                    {...leaseForm.register("status")}
                  >
                    {Object.entries(leaseStatusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lease-billing-day">Abrechnungstag</Label>
                  <Input
                    className={inputClassName}
                    id="lease-billing-day"
                    inputMode="numeric"
                    type="number"
                    {...leaseForm.register("billingDay")}
                  />
                  <FieldError
                    message={leaseErrors.billingDay?.message?.toString()}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lease-margin-type">Art der Marge</Label>
                  <select
                    className={selectClassName}
                    id="lease-margin-type"
                    {...leaseForm.register("marginType")}
                  >
                    <option value="percentage">Prozentual</option>
                    <option value="fixed">Fester Betrag</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lease-margin-value">Wert</Label>
                  <Input
                    className={inputClassName}
                    id="lease-margin-value"
                    inputMode="decimal"
                    type="number"
                    {...leaseForm.register("marginValue")}
                  />
                  <FieldError
                    message={leaseErrors.marginValue?.message?.toString()}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lease-notes">Notiz</Label>
                <Textarea
                  className={textareaClassName}
                  id="lease-notes"
                  rows={4}
                  {...leaseForm.register("notes")}
                />
              </div>
              <Button
                className="h-12 w-full rounded-[1.5rem] text-base font-semibold"
                disabled={leaseMutation.isPending || !activeLease}
                type="submit"
              >
                {leaseMutation.isPending ? "Speichere..." : "Vertragsdaten speichern"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="app-panel bg-white">
          <CardHeader>
            <CardDescription>Schritt 2</CardDescription>
            <CardTitle className="font-display text-2xl">
              Kosten ergaenzen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormFeedback error={costFeedback.error} message={costFeedback.message} />
            <form
              className="space-y-4"
              onSubmit={costItemForm.handleSubmit((values) => {
                setCostFeedback({ error: null, message: null });
                costItemMutation.mutate(values);
              })}
            >
              <input type="hidden" {...costItemForm.register("leaseId")} />
              <div className="space-y-2">
                <Label htmlFor="cost-category">Kostenart</Label>
                <select
                  className={selectClassName}
                  id="cost-category"
                  {...costItemForm.register("costCategoryId", {
                    onChange: (event) => {
                      const category = data.costCategories.find(
                        (item) => item.id === event.target.value,
                      );
                      costItemForm.setValue(
                        "isExternal",
                        category?.isExternal ?? true,
                      );
                    },
                  })}
                >
                  {data.costCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <FieldError
                  message={costErrors.costCategoryId?.message?.toString()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost-label">Bezeichnung</Label>
                <Input
                  className={inputClassName}
                  id="cost-label"
                  {...costItemForm.register("label")}
                />
                <FieldError message={costErrors.label?.message?.toString()} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cost-amount">Betrag</Label>
                  <Input
                    className={inputClassName}
                    id="cost-amount"
                    inputMode="decimal"
                    type="number"
                    {...costItemForm.register("amount")}
                  />
                  <FieldError message={costErrors.amount?.message?.toString()} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost-from">Gueltig ab</Label>
                  <Input
                    className={inputClassName}
                    id="cost-from"
                    type="date"
                    {...costItemForm.register("effectiveFrom")}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cost-to">Gueltig bis</Label>
                  <Input
                    className={inputClassName}
                    id="cost-to"
                    type="date"
                    {...costItemForm.register("effectiveTo")}
                  />
                </div>
                <label className="flex items-center gap-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                  <input
                    className="size-4"
                    type="checkbox"
                    {...costItemForm.register("isExternal")}
                  />
                  Extern verursachte Kosten
                </label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost-note">Notiz</Label>
                <Textarea
                  className={textareaClassName}
                  id="cost-note"
                  rows={3}
                  {...costItemForm.register("note")}
                />
              </div>
              <Button
                className="h-12 w-full rounded-[1.5rem] text-base font-semibold"
                disabled={costItemMutation.isPending || !activeLease}
                type="submit"
              >
                {costItemMutation.isPending ? "Speichere..." : "Kosten speichern"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="app-panel bg-white">
          <CardHeader>
            <CardDescription>Schritt 3</CardDescription>
            <CardTitle className="font-display text-2xl">
              Neue Miete veroeffentlichen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormFeedback
              error={snapshotFeedback.error}
              message={snapshotFeedback.message}
            />
            <form
              className="space-y-4"
              onSubmit={snapshotForm.handleSubmit((values) => {
                setSnapshotFeedback({ error: null, message: null });
                snapshotMutation.mutate(values);
              })}
            >
              <input type="hidden" {...snapshotForm.register("leaseId")} />
              <div className="space-y-2">
                <Label htmlFor="snapshot-reason">Grund</Label>
                <select
                  className={selectClassName}
                  id="snapshot-reason"
                  {...snapshotForm.register("reasonId")}
                >
                  {data.changeReasons.map((reason) => (
                    <option key={reason.id} value={reason.id}>
                      {reason.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="snapshot-effective">Wirksam ab</Label>
                <Input
                  className={inputClassName}
                  id="snapshot-effective"
                  type="date"
                  {...snapshotForm.register("effectiveDate")}
                />
                <FieldError
                  message={snapshotErrors.effectiveDate?.message?.toString()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="snapshot-title">Titel</Label>
                <Input
                  className={inputClassName}
                  id="snapshot-title"
                  {...snapshotForm.register("title")}
                />
                <FieldError message={snapshotErrors.title?.message?.toString()} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="snapshot-description">Erklaerung</Label>
                <Textarea
                  className={textareaClassName}
                  id="snapshot-description"
                  rows={4}
                  {...snapshotForm.register("description")}
                />
                <FieldError
                  message={snapshotErrors.description?.message?.toString()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="snapshot-summary">Kurztext</Label>
                <Textarea
                  className={textareaClassName}
                  id="snapshot-summary"
                  rows={2}
                  {...snapshotForm.register("summary")}
                />
              </div>
              <Button
                className="h-12 w-full rounded-[1.5rem] text-base font-semibold"
                disabled={snapshotMutation.isPending || !activeLease}
                type="submit"
              >
                {snapshotMutation.isPending
                  ? "Veroeffentliche..."
                  : "Neue Miete veroeffentlichen"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <Card className="app-panel bg-white">
        <CardHeader>
          <CardDescription>Aktueller Stand</CardDescription>
          <CardTitle className="font-display text-2xl">
            Kosten, Snapshots und Historie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeLease ? (
            <div className="grid gap-4 xl:grid-cols-3">
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">
                  Kostenpositionen
                </p>
                {activeLease.costItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-950">{item.label}</p>
                      <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">
                        {formatCurrency(item.amount)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.categoryName} - ab {formatDateLabel(item.effectiveFrom)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">Snapshots</p>
                {activeLease.snapshots.map((snapshot) => (
                  <div
                    key={snapshot.id}
                    className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-950">
                        Version {snapshot.version}
                      </p>
                      <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">
                        {formatCurrency(snapshot.rentTotal)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Kosten {formatCurrency(snapshot.costTotal)} + Marge{" "}
                      {formatCurrency(snapshot.marginAmount)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Wirksam ab {formatDateLabel(snapshot.effectiveDate)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-700">Historie</p>
                {activeLease.recentChanges.map((change) => (
                  <div
                    key={change.id}
                    className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-950">{change.title}</p>
                      <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">
                        {formatDelta(change.deltaAmount)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {change.reasonLabel} - {formatDateLabel(change.effectiveDate)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Noch kein Mietvertrag vorhanden.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
