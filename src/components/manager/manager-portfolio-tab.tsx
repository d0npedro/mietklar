"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import type { ManagerPortalData } from "@/lib/server/portal-queries";
import {
  createPropertySchema,
  createUnitSchema,
} from "@/lib/validation/manager";

import {
  dashboardQueryKey,
  FieldError,
  FormFeedback,
  inputClassName,
  selectClassName,
  submitJson,
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

export function PortfolioTab({
  canCreateProperty,
  data,
}: {
  canCreateProperty: boolean;
  data: ManagerPortalData;
}) {
  const queryClient = useQueryClient();
  const [activePropertyId, setActivePropertyId] = useState(
    data.properties[0]?.id ?? "",
  );
  const [propertyFeedback, setPropertyFeedback] = useState({
    error: null as string | null,
    message: null as string | null,
  });
  const [unitFeedback, setUnitFeedback] = useState({
    error: null as string | null,
    message: null as string | null,
  });
  const resolvedActivePropertyId = data.properties.some(
    (property) => property.id === activePropertyId,
  )
    ? activePropertyId
    : data.properties[0]?.id ?? "";

  const activeProperty =
    data.properties.find((property) => property.id === resolvedActivePropertyId) ??
    data.properties[0] ??
    null;

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
      propertyId: activeProperty?.id ?? "",
      roomCount: 2,
    },
    resolver: zodResolver(createUnitSchema),
  });

  useEffect(() => {
    unitForm.setValue("propertyId", activeProperty?.id ?? "");
  }, [activeProperty?.id, unitForm]);

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
        propertyId: activeProperty?.id ?? "",
        roomCount: 2,
      });
      setUnitFeedback({
        error: null,
        message: result.message ?? "Wohnung angelegt.",
      });
      await queryClient.invalidateQueries({ queryKey: dashboardQueryKey });
    },
  });

  const propertyErrors = propertyForm.formState.errors;
  const unitErrors = unitForm.formState.errors;

  // UX-Grund: Bestandspflege beginnt mit einer aktiven Auswahl, damit neue Eintraege immer einem klar sichtbaren Objekt zugeordnet sind.
  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="app-panel bg-white">
          <CardHeader>
            <CardDescription>Welches Haus bearbeiten Sie?</CardDescription>
            <CardTitle className="font-display text-2xl">
              Bestand auswaehlen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="active-property">Objekt</Label>
              <select
                className={selectClassName}
                id="active-property"
                onChange={(event) => setActivePropertyId(event.target.value)}
                value={resolvedActivePropertyId}
              >
                {data.properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>

            {activeProperty ? (
              <div className="space-y-3 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="font-semibold text-slate-950">
                    {activeProperty.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {activeProperty.addressLine1}, {activeProperty.postalCode}{" "}
                    {activeProperty.city}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3">
                    <p className="text-sm text-slate-500">Wohnungen</p>
                    <p className="font-display text-3xl font-semibold text-slate-950">
                      {activeProperty.unitCount}
                    </p>
                  </div>
                  <div className="rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3">
                    <p className="text-sm text-slate-500">Aktive Mieten</p>
                    <p className="font-display text-3xl font-semibold text-slate-950">
                      {activeProperty.activeLeaseCount}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Noch kein Objekt vorhanden.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="app-panel bg-white">
          <CardHeader>
            <CardDescription>Alle Objekte im Zugriff</CardDescription>
            <CardTitle className="font-display text-2xl">
              Bestand im Ueberblick
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.properties.map((property) => (
              <div
                key={property.id}
                className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">
                      {property.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {property.code} - {property.addressLine1}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                      {property.unitCount} Wohnungen
                    </Badge>
                    <Badge className="bg-slate-900 text-slate-50 hover:bg-slate-900">
                      {property.activeLeaseCount} aktiv
                    </Badge>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {property.units.map((unit) => (
                    <div
                      key={unit.id}
                      className="rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-sm shadow-slate-900/5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-slate-950">{unit.code}</p>
                        <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">
                          {unit.areaSqm} qm
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {unit.floor ?? "Lage offen"} - {unit.roomCount ?? "-"}{" "}
                        Zimmer
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Aktive Miete:{" "}
                        {unit.activeLeaseReference ?? "Noch nicht belegt"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {canCreateProperty ? (
          <Card className="app-panel bg-white">
            <CardHeader>
              <CardDescription>Neues Haus anlegen</CardDescription>
              <CardTitle className="font-display text-2xl">
                Objekt erfassen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormFeedback
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
                <div className="space-y-2">
                  <Label htmlFor="property-name">Name des Hauses</Label>
                  <Input
                    className={inputClassName}
                    id="property-name"
                    {...propertyForm.register("name")}
                  />
                  <FieldError
                    message={propertyErrors.name?.message?.toString()}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="property-code">Kurzcode</Label>
                    <Input
                      className={inputClassName}
                      id="property-code"
                      {...propertyForm.register("code")}
                    />
                    <FieldError
                      message={propertyErrors.code?.message?.toString()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="property-country">Land</Label>
                    <Input
                      className={inputClassName}
                      id="property-country"
                      {...propertyForm.register("country")}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property-address">Adresse</Label>
                  <Input
                    className={inputClassName}
                    id="property-address"
                    {...propertyForm.register("addressLine1")}
                  />
                  <FieldError
                    message={propertyErrors.addressLine1?.message?.toString()}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-[0.4fr_0.6fr]">
                  <div className="space-y-2">
                    <Label htmlFor="property-postal">PLZ</Label>
                    <Input
                      className={inputClassName}
                      id="property-postal"
                      {...propertyForm.register("postalCode")}
                    />
                    <FieldError
                      message={propertyErrors.postalCode?.message?.toString()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="property-city">Stadt</Label>
                    <Input
                      className={inputClassName}
                      id="property-city"
                      {...propertyForm.register("city")}
                    />
                    <FieldError
                      message={propertyErrors.city?.message?.toString()}
                    />
                  </div>
                </div>
                <Button
                  className="h-12 w-full rounded-[1.5rem] text-base font-semibold"
                  disabled={propertyMutation.isPending}
                  type="submit"
                >
                  {propertyMutation.isPending ? "Lege an..." : "Objekt anlegen"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="app-panel bg-white">
            <CardHeader>
              <CardDescription>Zugriffsbereich</CardDescription>
              <CardTitle className="font-display text-2xl">
                Objektanlage ist hier gesperrt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Property-Manager bearbeiten in diesem Bereich nur zugewiesene
                Objekte. Neue Haeuser werden durch Organisationseigner oder
                Manager angelegt.
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="app-panel bg-white">
          <CardHeader>
            <CardDescription>Neue Wohnung anlegen</CardDescription>
            <CardTitle className="font-display text-2xl">
              Wohnung erfassen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormFeedback error={unitFeedback.error} message={unitFeedback.message} />
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              Zielobjekt:{" "}
              <span className="font-semibold">
                {activeProperty?.name ?? "Noch kein Objekt"}
              </span>
            </div>
            <form
              className="space-y-4"
              onSubmit={unitForm.handleSubmit((values) => {
                setUnitFeedback({ error: null, message: null });
                unitMutation.mutate(values);
              })}
            >
              <input type="hidden" {...unitForm.register("propertyId")} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="unit-code">Wohnungsnummer</Label>
                  <Input
                    className={inputClassName}
                    id="unit-code"
                    {...unitForm.register("code")}
                  />
                  <FieldError message={unitErrors.code?.message?.toString()} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit-floor">Lage</Label>
                  <Input
                    className={inputClassName}
                    id="unit-floor"
                    placeholder="Zum Beispiel: 2. OG links"
                    {...unitForm.register("floor")}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="unit-rooms">Zimmer</Label>
                  <Input
                    className={inputClassName}
                    id="unit-rooms"
                    inputMode="numeric"
                    type="number"
                    {...unitForm.register("roomCount")}
                  />
                  <FieldError
                    message={unitErrors.roomCount?.message?.toString()}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit-area">Flaeche in qm</Label>
                  <Input
                    className={inputClassName}
                    id="unit-area"
                    inputMode="decimal"
                    type="number"
                    {...unitForm.register("areaSqm")}
                  />
                  <FieldError
                    message={unitErrors.areaSqm?.message?.toString()}
                  />
                </div>
              </div>
              <Button
                className="h-12 w-full rounded-[1.5rem] text-base font-semibold"
                disabled={unitMutation.isPending || !activeProperty}
                type="submit"
              >
                {unitMutation.isPending ? "Lege an..." : "Wohnung anlegen"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
