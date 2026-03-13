"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CircleAlert,
  Home,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import type { ManagerPortalData } from "@/lib/server/portal-queries";
import type { UpdateLeaseInput } from "@/lib/validation/manager";
import {
  createLeaseCostItemSchema,
  createPropertySchema,
  createUnitSchema,
  publishSnapshotSchema,
  updateLeaseSchema,
  updateServiceCaseStatusSchema,
} from "@/lib/validation/manager";
import { formatCurrency, formatDelta } from "@/lib/formatters";

import { PortalHeader } from "@/components/layout/portal-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type ManagerDashboardProps = {
  initialData: ManagerPortalData;
  userName: string;
  userRole: string;
};

type MutationResult = {
  message?: string;
};

const dashboardQueryKey = ["manager-dashboard"];

const selectClassName =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 h-11 w-full rounded-lg border bg-transparent px-3 text-sm outline-none focus-visible:ring-3";

function formatDateLabel(value: string | null | undefined) {
  if (!value) {
    return "offen";
  }

  return new Intl.DateTimeFormat("de-DE").format(new Date(value));
}

function formatStatusLabel(value: string) {
  return value.replaceAll("_", " ");
}

async function fetchDashboard() {
  const response = await fetch("/api/manager/dashboard", {
    credentials: "same-origin",
  });
  const payload = (await response.json().catch(() => null)) as
    | ManagerPortalData
    | { error?: string }
    | null;

  if (!response.ok) {
    throw new Error(
      payload && "error" in payload
        ? payload.error
        : "Daten konnten nicht geladen werden.",
    );
  }

  return payload as ManagerPortalData;
}

async function submitJson<TInput>(
  path: string,
  method: "PATCH" | "POST",
  input: TInput,
) {
  const response = await fetch(path, {
    body: JSON.stringify(input),
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    method,
  });
  const payload = (await response.json().catch(() => null)) as
    | MutationResult
    | { error?: string }
    | null;

  if (!response.ok) {
    throw new Error(
      payload && "error" in payload ? payload.error : "Aktion fehlgeschlagen.",
    );
  }

  return payload as MutationResult;
}

function Feedback({
  error,
  message,
}: {
  error: string | null;
  message: string | null;
}) {
  if (!error && !message) {
    return null;
  }

  return (
    <Alert variant={error ? "destructive" : "default"}>
      <CircleAlert className="size-4" />
      <AlertTitle>
        {error ? "Aktion fehlgeschlagen" : "Aktion erfolgreich"}
      </AlertTitle>
      <AlertDescription>{error ?? message}</AlertDescription>
    </Alert>
  );
}

function PortfolioTab({
  canCreateProperty,
  data,
}: {
  canCreateProperty: boolean;
  data: ManagerPortalData;
}) {
  const queryClient = useQueryClient();
  const [propertyFeedback, setPropertyFeedback] = useState({
    error: null as string | null,
    message: null as string | null,
  });
  const [unitFeedback, setUnitFeedback] = useState({
    error: null as string | null,
    message: null as string | null,
  });
  const propertyForm = useForm({
    defaultValues: {
      addressLine1: "",
      city: "Berlin",
      code: "",
      country: "DE",
      name: "",
      postalCode: "10115",
    },
    resolver: zodResolver(createPropertySchema),
  });
  const unitForm = useForm({
    defaultValues: {
      areaSqm: 55,
      code: "",
      floor: "",
      propertyId: data.properties[0]?.id ?? "",
      roomCount: 2,
    },
    resolver: zodResolver(createUnitSchema),
  });

  const propertyMutation = useMutation({
    mutationFn: (input: unknown) =>
      submitJson("/api/manager/properties", "POST", input),
    onError: (error: Error) =>
      setPropertyFeedback({ error: error.message, message: null }),
    onSuccess: async (result) => {
      propertyForm.reset();
      setPropertyFeedback({
        error: null,
        message: result.message ?? "Objekt angelegt.",
      });
      await queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    },
  });

  const unitMutation = useMutation({
    mutationFn: (input: unknown) =>
      submitJson("/api/manager/units", "POST", input),
    onError: (error: Error) =>
      setUnitFeedback({ error: error.message, message: null }),
    onSuccess: async (result) => {
      unitForm.reset({
        areaSqm: 55,
        code: "",
        floor: "",
        propertyId: data.properties[0]?.id ?? "",
        roomCount: 2,
      });
      setUnitFeedback({
        error: null,
        message: result.message ?? "Einheit angelegt.",
      });
      await queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    },
  });

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-2">
        {canCreateProperty ? (
          <Card className="bg-white/90">
            <CardHeader>
              <CardDescription>Portfolio erweitern</CardDescription>
              <CardTitle className="font-display text-2xl">
                Neues Objekt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Feedback
                error={propertyFeedback.error}
                message={propertyFeedback.message}
              />
              <form
                className="space-y-4"
                onSubmit={propertyForm.handleSubmit((values) => {
                  setPropertyFeedback({ error: null, message: null });
                  propertyMutation.mutate(values);
                })}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="property-name">Name</Label>
                    <Input
                      id="property-name"
                      {...propertyForm.register("name")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="property-code">Code</Label>
                    <Input
                      id="property-code"
                      {...propertyForm.register("code")}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property-address">Adresse</Label>
                  <Input
                    id="property-address"
                    {...propertyForm.register("addressLine1")}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="property-postal">PLZ</Label>
                    <Input
                      id="property-postal"
                      {...propertyForm.register("postalCode")}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="property-city">Stadt</Label>
                    <Input
                      id="property-city"
                      {...propertyForm.register("city")}
                    />
                  </div>
                </div>
                <Button
                  className="h-11 rounded-full"
                  disabled={propertyMutation.isPending}
                  type="submit"
                >
                  {propertyMutation.isPending ? "Lege an..." : "Objekt anlegen"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/90">
            <CardHeader>
              <CardDescription>Zugriffsumfang</CardDescription>
              <CardTitle className="font-display text-2xl">
                Objektanlage ist deaktiviert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-slate-600">
                Property-Manager bearbeiten in diesem MVP nur zugewiesene
                Objekte und Einheiten. Neue Objekte werden durch
                Organisationseigner oder Manager angelegt.
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white/90">
          <CardHeader>
            <CardDescription>Bestand erweitern</CardDescription>
            <CardTitle className="font-display text-2xl">
              Neue Einheit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Feedback
              error={unitFeedback.error}
              message={unitFeedback.message}
            />
            <form
              className="space-y-4"
              onSubmit={unitForm.handleSubmit((values) => {
                setUnitFeedback({ error: null, message: null });
                unitMutation.mutate(values);
              })}
            >
              <div className="space-y-2">
                <Label htmlFor="unit-property">Objekt</Label>
                <select
                  className={selectClassName}
                  id="unit-property"
                  {...unitForm.register("propertyId")}
                >
                  {data.properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="unit-code">Einheitscode</Label>
                  <Input id="unit-code" {...unitForm.register("code")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit-floor">Lage</Label>
                  <Input id="unit-floor" {...unitForm.register("floor")} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="unit-rooms">Zimmer</Label>
                  <Input
                    id="unit-rooms"
                    type="number"
                    {...unitForm.register("roomCount")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit-area">Flaeche (qm)</Label>
                  <Input
                    id="unit-area"
                    type="number"
                    {...unitForm.register("areaSqm")}
                  />
                </div>
              </div>
              <Button
                className="h-11 rounded-full"
                disabled={unitMutation.isPending}
                type="submit"
              >
                {unitMutation.isPending ? "Lege an..." : "Einheit anlegen"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <Card className="bg-white/90">
        <CardHeader>
          <CardDescription>Portfolio-Transparenz</CardDescription>
          <CardTitle className="font-display text-2xl">
            Objekte und Einheiten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.properties.map((property) => (
            <div
              key={property.id}
              className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/70 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-950">{property.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {property.code} - {property.addressLine1},{" "}
                    {property.postalCode} {property.city}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                    {property.unitCount} Einheiten
                  </Badge>
                  <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">
                    {property.activeLeaseCount} aktive Leases
                  </Badge>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {property.units.map((unit) => (
                  <div
                    key={unit.id}
                    className="rounded-[1.25rem] border border-slate-200/80 bg-white/80 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-950">{unit.code}</p>
                      <Badge className="bg-slate-900 text-slate-50 hover:bg-slate-900">
                        {unit.areaSqm} qm
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm">
                      {unit.floor ?? "Lage offen"} - {unit.roomCount ?? "-"}{" "}
                      Zimmer
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      Aktives Lease:{" "}
                      {unit.activeLeaseReference ?? "noch nicht belegt"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function LeaseTab({ data }: { data: ManagerPortalData }) {
  const queryClient = useQueryClient();
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

  const leaseDefaults = useMemo(
    () =>
      ({
        billingDay: data.leases[0]?.billingDay ?? 1,
        leaseId: data.leases[0]?.id ?? "",
        marginType:
          data.leases[0]?.marginType === "percentage" ? "percentage" : "fixed",
        marginValue: data.leases[0]?.marginValue ?? 0,
        notes: data.leases[0]?.notes ?? "",
        status:
          data.leases[0]?.status === "draft" ||
          data.leases[0]?.status === "active" ||
          data.leases[0]?.status === "notice" ||
          data.leases[0]?.status === "ended"
            ? data.leases[0].status
            : "active",
      }) satisfies UpdateLeaseInput,
    [data.leases],
  );

  const leaseForm = useForm({
    defaultValues: leaseDefaults,
    resolver: zodResolver(updateLeaseSchema),
  });
  const costItemForm = useForm({
    defaultValues: {
      amount: 0,
      costCategoryId: data.costCategories[0]?.id ?? "",
      effectiveFrom: new Date().toISOString().slice(0, 10),
      effectiveTo: "",
      isExternal: data.costCategories[0]?.isExternal ?? true,
      label: "",
      leaseId: data.leases[0]?.id ?? "",
      note: "",
    },
    resolver: zodResolver(createLeaseCostItemSchema),
  });
  const snapshotForm = useForm({
    defaultValues: {
      description:
        "Aenderung wurde transparent mit aktualisierten Kostenbloeken veroeffentlicht.",
      effectiveDate: new Date().toISOString().slice(0, 10),
      leaseId: data.leases[0]?.id ?? "",
      reasonId: data.changeReasons[0]?.id ?? "",
      summary: "Aktualisierte Mietzusammensetzung",
      title: "Aktualisierte Mietzusammensetzung",
    },
    resolver: zodResolver(publishSnapshotSchema),
  });

  const leaseMutation = useMutation({
    mutationFn: (input: unknown) =>
      submitJson("/api/manager/leases", "PATCH", input),
    onError: (error: Error) =>
      setLeaseFeedback({ error: error.message, message: null }),
    onSuccess: async (result) => {
      setLeaseFeedback({
        error: null,
        message: result.message ?? "Lease aktualisiert.",
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
      costItemForm.reset({
        amount: 0,
        costCategoryId: data.costCategories[0]?.id ?? "",
        effectiveFrom: new Date().toISOString().slice(0, 10),
        effectiveTo: "",
        isExternal: data.costCategories[0]?.isExternal ?? true,
        label: "",
        leaseId: data.leases[0]?.id ?? "",
        note: "",
      });
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
        message: result.message ?? "Snapshot veroeffentlicht.",
      });
      await queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    },
  });

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-3">
        <Card className="bg-white/90">
          <CardHeader>
            <CardDescription>Mietverhaeltnis verwalten</CardDescription>
            <CardTitle className="font-display text-2xl">Lease-Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Feedback
              error={leaseFeedback.error}
              message={leaseFeedback.message}
            />
            <form
              className="space-y-4"
              onSubmit={leaseForm.handleSubmit((values) => {
                setLeaseFeedback({ error: null, message: null });
                leaseMutation.mutate(values);
              })}
            >
              <div className="space-y-2">
                <Label htmlFor="lease-config-id">Lease</Label>
                <select
                  className={selectClassName}
                  id="lease-config-id"
                  {...leaseForm.register("leaseId")}
                >
                  {data.leases.map((lease) => (
                    <option key={lease.id} value={lease.id}>
                      {lease.reference} - {lease.unitCode}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lease-billing-day">Abrechnungstag</Label>
                  <Input
                    id="lease-billing-day"
                    type="number"
                    {...leaseForm.register("billingDay")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lease-status">Status</Label>
                  <select
                    className={selectClassName}
                    id="lease-status"
                    {...leaseForm.register("status")}
                  >
                    <option value="draft">draft</option>
                    <option value="active">active</option>
                    <option value="notice">notice</option>
                    <option value="ended">ended</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lease-margin-type">Margentyp</Label>
                  <select
                    className={selectClassName}
                    id="lease-margin-type"
                    {...leaseForm.register("marginType")}
                  >
                    <option value="fixed">fixed</option>
                    <option value="percentage">percentage</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lease-margin-value">Margenwert</Label>
                  <Input
                    id="lease-margin-value"
                    type="number"
                    {...leaseForm.register("marginValue")}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lease-notes">Notiz</Label>
                <Textarea
                  id="lease-notes"
                  rows={4}
                  {...leaseForm.register("notes")}
                />
              </div>
              <Button
                className="h-11 rounded-full"
                disabled={leaseMutation.isPending}
                type="submit"
              >
                {leaseMutation.isPending ? "Speichere..." : "Lease speichern"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-white/90">
          <CardHeader>
            <CardDescription>Kostenpositionen pflegen</CardDescription>
            <CardTitle className="font-display text-2xl">
              Neue Kostenposition
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Feedback
              error={costFeedback.error}
              message={costFeedback.message}
            />
            <form
              className="space-y-4"
              onSubmit={costItemForm.handleSubmit((values) => {
                setCostFeedback({ error: null, message: null });
                costItemMutation.mutate(values);
              })}
            >
              <div className="space-y-2">
                <Label htmlFor="cost-lease">Lease</Label>
                <select
                  className={selectClassName}
                  id="cost-lease"
                  {...costItemForm.register("leaseId")}
                >
                  {data.leases.map((lease) => (
                    <option key={lease.id} value={lease.id}>
                      {lease.reference} - {lease.unitCode}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost-category">Kategorie</Label>
                <select
                  className={selectClassName}
                  id="cost-category"
                  {...costItemForm.register("costCategoryId")}
                >
                  {data.costCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cost-label">Label</Label>
                  <Input id="cost-label" {...costItemForm.register("label")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost-amount">Betrag</Label>
                  <Input
                    id="cost-amount"
                    type="number"
                    {...costItemForm.register("amount")}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cost-from">Gueltig ab</Label>
                  <Input
                    id="cost-from"
                    type="date"
                    {...costItemForm.register("effectiveFrom")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost-to">Gueltig bis</Label>
                  <Input
                    id="cost-to"
                    type="date"
                    {...costItemForm.register("effectiveTo")}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-[1rem] border border-slate-200/80 bg-slate-50/70 px-3 py-3">
                <input
                  className="size-4 rounded border-slate-300"
                  id="cost-external"
                  type="checkbox"
                  {...costItemForm.register("isExternal")}
                />
                <Label htmlFor="cost-external">Extern verursachte Kosten</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost-note">Notiz</Label>
                <Textarea
                  id="cost-note"
                  rows={3}
                  {...costItemForm.register("note")}
                />
              </div>
              <Button
                className="h-11 rounded-full"
                disabled={costItemMutation.isPending}
                type="submit"
              >
                {costItemMutation.isPending
                  ? "Speichere..."
                  : "Kostenposition anlegen"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-white/90">
          <CardHeader>
            <CardDescription>Mietaenderungs-Workflow</CardDescription>
            <CardTitle className="font-display text-2xl">
              Snapshot veroeffentlichen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Feedback
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
              <div className="space-y-2">
                <Label htmlFor="snapshot-lease">Lease</Label>
                <select
                  className={selectClassName}
                  id="snapshot-lease"
                  {...snapshotForm.register("leaseId")}
                >
                  {data.leases.map((lease) => (
                    <option key={lease.id} value={lease.id}>
                      {lease.reference} - {lease.unitCode}
                    </option>
                  ))}
                </select>
              </div>
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
                  id="snapshot-effective"
                  type="date"
                  {...snapshotForm.register("effectiveDate")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="snapshot-title">Titel</Label>
                <Input
                  id="snapshot-title"
                  {...snapshotForm.register("title")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="snapshot-description">Beschreibung</Label>
                <Textarea
                  id="snapshot-description"
                  rows={4}
                  {...snapshotForm.register("description")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="snapshot-summary">Kurztext</Label>
                <Textarea
                  id="snapshot-summary"
                  rows={2}
                  {...snapshotForm.register("summary")}
                />
              </div>
              <Button
                className="h-11 rounded-full"
                disabled={snapshotMutation.isPending}
                type="submit"
              >
                {snapshotMutation.isPending
                  ? "Veroeffentliche..."
                  : "Snapshot publizieren"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <Card className="bg-white/90">
        <CardHeader>
          <CardDescription>Transparenz pro Mietverhaeltnis</CardDescription>
          <CardTitle className="font-display text-2xl">
            Leases im Zugriff
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.leases.map((lease) => (
            <div
              key={lease.id}
              className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/70 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-950">
                    {lease.reference}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {lease.propertyName} - Einheit {lease.unitCode} -{" "}
                    {lease.tenantNames.join(", ") || "kein Tenant"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                    {lease.marginType} / {lease.marginValue}
                  </Badge>
                  <Badge className="bg-slate-900 text-slate-50 hover:bg-slate-900">
                    {lease.status}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-700">
                    Kostenpositionen
                  </p>
                  {lease.costItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[1rem] border border-slate-200/80 bg-white/80 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-slate-950">
                          {item.label}
                        </p>
                        <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">
                          {formatCurrency(item.amount)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {item.categoryName} - ab{" "}
                        {formatDateLabel(item.effectiveFrom)}
                        {item.effectiveTo
                          ? ` bis ${formatDateLabel(item.effectiveTo)}`
                          : ""}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-700">
                    Snapshots
                  </p>
                  {lease.snapshots.map((snapshot) => (
                    <div
                      key={snapshot.id}
                      className="rounded-[1rem] border border-slate-200/80 bg-white/80 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-slate-950">
                          Version {snapshot.version}
                        </p>
                        <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">
                          {formatCurrency(snapshot.rentTotal)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm">
                        Kosten {formatCurrency(snapshot.costTotal)} + Marge{" "}
                        {formatCurrency(snapshot.marginAmount)}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        wirksam ab {formatDateLabel(snapshot.effectiveDate)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-700">Historie</p>
                  {lease.recentChanges.map((change) => (
                    <div
                      key={change.id}
                      className="rounded-[1rem] border border-slate-200/80 bg-white/80 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-slate-950">
                          {change.title}
                        </p>
                        <Badge className="bg-emerald-100 text-emerald-900 hover:bg-emerald-100">
                          {formatDelta(change.deltaAmount)}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {change.reasonLabel} -{" "}
                        {formatDateLabel(change.effectiveDate)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ServiceTab({ data }: { data: ManagerPortalData }) {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState({
    error: null as string | null,
    message: null as string | null,
  });
  const serviceCaseForm = useForm({
    defaultValues: {
      detail: "",
      serviceCaseId: data.serviceCases[0]?.id ?? "",
      status:
        data.serviceCases[0]?.status === "open" ||
        data.serviceCases[0]?.status === "in_progress" ||
        data.serviceCases[0]?.status === "waiting_vendor" ||
        data.serviceCases[0]?.status === "resolved" ||
        data.serviceCases[0]?.status === "closed"
          ? data.serviceCases[0].status
          : "open",
    },
    resolver: zodResolver(updateServiceCaseStatusSchema),
  });

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

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="bg-white/90">
          <CardHeader>
            <CardDescription>Service workflow</CardDescription>
            <CardTitle className="font-display text-2xl">
              Status aktualisieren
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Feedback error={feedback.error} message={feedback.message} />
            <form
              className="space-y-4"
              onSubmit={serviceCaseForm.handleSubmit((values) => {
                setFeedback({ error: null, message: null });
                mutation.mutate(values);
              })}
            >
              <div className="space-y-2">
                <Label htmlFor="service-case-id">Servicefall</Label>
                <select
                  className={selectClassName}
                  id="service-case-id"
                  {...serviceCaseForm.register("serviceCaseId")}
                >
                  {data.serviceCases.map((serviceCase) => (
                    <option key={serviceCase.id} value={serviceCase.id}>
                      {serviceCase.caseNumber} - {serviceCase.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-case-status">Neuer Status</Label>
                <select
                  className={selectClassName}
                  id="service-case-status"
                  {...serviceCaseForm.register("status")}
                >
                  <option value="open">open</option>
                  <option value="in_progress">in_progress</option>
                  <option value="waiting_vendor">waiting_vendor</option>
                  <option value="resolved">resolved</option>
                  <option value="closed">closed</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-detail">Statusnotiz</Label>
                <Textarea
                  id="service-detail"
                  rows={4}
                  {...serviceCaseForm.register("detail")}
                />
              </div>
              <Button
                className="h-11 rounded-full"
                disabled={mutation.isPending}
                type="submit"
              >
                {mutation.isPending ? "Aktualisiere..." : "Status speichern"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-white/90">
          <CardHeader>
            <CardDescription>Aktuelle Bearbeitung</CardDescription>
            <CardTitle className="font-display text-2xl">
              Servicefaelle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.serviceCases.map((serviceCase) => (
              <div
                key={serviceCase.id}
                className="rounded-[1.25rem] border border-slate-200/80 bg-slate-50/70 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-950">
                      {serviceCase.caseNumber} - {serviceCase.title}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {serviceCase.propertyName} - Einheit{" "}
                      {serviceCase.unitCode}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-amber-100 text-amber-900 hover:bg-amber-100">
                      {serviceCase.priority}
                    </Badge>
                    <Badge className="bg-slate-900 text-slate-50 hover:bg-slate-900">
                      {formatStatusLabel(serviceCase.status)}
                    </Badge>
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Angelegt am {formatDateLabel(serviceCase.createdAt)} -
                  zugewiesen an {serviceCase.assignedToName ?? "niemanden"}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <Card className="bg-white/90">
        <CardHeader>
          <CardDescription>Nachvollziehbarkeit</CardDescription>
          <CardTitle className="font-display text-2xl">Audit-Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.auditEntries.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-slate-200/80 bg-slate-50/70 px-4 py-3"
            >
              <div>
                <p className="font-medium text-slate-950">{entry.summary}</p>
                <p className="text-muted-foreground text-sm">
                  {entry.entityType} - {entry.action}
                </p>
              </div>
              <p className="text-sm text-slate-600">
                {formatDateLabel(entry.createdAt)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function ManagerDashboard({
  initialData,
  userName,
  userRole,
}: ManagerDashboardProps) {
  const { data, error } = useQuery({
    initialData,
    queryFn: fetchDashboard,
    queryKey: dashboardQueryKey,
  });

  return (
    <div className="min-h-screen">
      <PortalHeader
        subtitle={data.organizationName}
        title="Manager-Portal"
        userName={userName}
        userRole={userRole}
      />
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {error ? (
          <Alert variant="destructive">
            <CircleAlert className="size-4" />
            <AlertTitle>Manager-Daten konnten nicht geladen werden</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: Building2,
              label: "Objekte",
              value: `${data.propertyCount}`,
            },
            { icon: Home, label: "Einheiten", value: `${data.unitCount}` },
            {
              icon: ReceiptText,
              label: "Aktive Leases",
              value: `${data.activeLeaseCount}`,
            },
            {
              icon: ShieldCheck,
              label: "Offene Servicefaelle",
              value: `${data.openServiceCaseCount}`,
            },
          ].map((item) => (
            <Card key={item.label} className="bg-white/90">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-sm">{item.label}</p>
                  <item.icon className="text-primary size-5" />
                </div>
                <p className="font-display text-3xl font-semibold">
                  {item.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Tabs className="gap-4" defaultValue="portfolio">
          <TabsList className="grid h-auto grid-cols-3 gap-2 rounded-[1.25rem] bg-white/90 p-2">
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="leases">Mieten</TabsTrigger>
            <TabsTrigger value="service">Service</TabsTrigger>
          </TabsList>
          <TabsContent value="portfolio">
            <PortfolioTab
              canCreateProperty={userRole !== "property_manager"}
              data={data}
            />
          </TabsContent>
          <TabsContent value="leases">
            <LeaseTab data={data} />
          </TabsContent>
          <TabsContent value="service">
            <ServiceTab data={data} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
