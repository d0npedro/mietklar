"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  CircleAlert,
  Home,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";

import type { ManagerPortalData } from "@/lib/server/portal-queries";

import { PortalHeader } from "@/components/layout/portal-header";
import { LeaseTab } from "@/components/manager/manager-lease-tab";
import { PortfolioTab } from "@/components/manager/manager-portfolio-tab";
import { ServiceTab } from "@/components/manager/manager-service-tab";
import {
  dashboardQueryKey,
  fetchDashboard,
} from "@/components/manager/manager-shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ManagerDashboardProps = {
  initialData: ManagerPortalData;
  userName: string;
  userRole: string;
};

export function ManagerDashboard({
  initialData,
  userName,
  userRole,
}: ManagerDashboardProps) {
  const { data, error } = useQuery<ManagerPortalData, Error>({
    initialData,
    queryFn: fetchDashboard,
    queryKey: dashboardQueryKey,
  });

  // UX-Grund: Die Verwaltung startet mit wenigen Kennzahlen und drei klaren Arbeitsbereichen statt mit gleichzeitig sichtbaren Formularbergen.
  return (
    <div className="min-h-screen">
      <PortalHeader
        subtitle={data.organizationName}
        title="Verwaltung"
        userName={userName}
        userRole={userRole}
      />
      <main
        className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"
        id="main-content"
      >
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
            { icon: Home, label: "Wohnungen", value: `${data.unitCount}` },
            {
              icon: ReceiptText,
              label: "Aktive Mieten",
              value: `${data.activeLeaseCount}`,
            },
            {
              icon: ShieldCheck,
              label: "Offene Servicefaelle",
              value: `${data.openServiceCaseCount}`,
            },
          ].map((item) => (
            <Card key={item.label} className="app-panel bg-white">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <item.icon className="size-5 text-slate-700" />
                </div>
                <p className="font-display text-4xl font-semibold text-slate-950">
                  {item.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="app-panel bg-white">
          <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-slate-500">
                Heute zuerst
              </p>
              <h2 className="font-display text-2xl font-semibold text-slate-950">
                Erst Objekt waehlen, dann Miete oder Service bearbeiten
              </h2>
            </div>
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {data.openServiceCaseCount > 0
                ? `${data.openServiceCaseCount} offene Servicefaelle warten auf eine Entscheidung.`
                : "Aktuell gibt es keine offenen Servicefaelle."}
            </div>
          </CardContent>
        </Card>

        <Tabs className="gap-4" defaultValue="portfolio">
          <TabsList className="grid h-auto grid-cols-1 gap-2 rounded-[1.5rem] bg-white p-2 sm:grid-cols-3">
            <TabsTrigger
              className="min-h-12 rounded-[1.25rem] px-4 py-3 text-base font-semibold data-active:bg-slate-950 data-active:text-slate-50"
              value="portfolio"
            >
              Bestand
            </TabsTrigger>
            <TabsTrigger
              className="min-h-12 rounded-[1.25rem] px-4 py-3 text-base font-semibold data-active:bg-slate-950 data-active:text-slate-50"
              value="leases"
            >
              Miete
            </TabsTrigger>
            <TabsTrigger
              className="min-h-12 rounded-[1.25rem] px-4 py-3 text-base font-semibold data-active:bg-slate-950 data-active:text-slate-50"
              value="service"
            >
              Service
            </TabsTrigger>
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
