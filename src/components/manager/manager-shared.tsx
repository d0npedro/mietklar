"use client";

import { CircleAlert } from "lucide-react";

import type { ManagerPortalData } from "@/lib/server/portal-queries";
import type {
  CreateLeaseCostItemInput,
  PublishSnapshotInput,
  UpdateLeaseInput,
  UpdateServiceCaseStatusInput,
} from "@/lib/validation/manager";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export type MutationResult = {
  message?: string;
};

export const dashboardQueryKey = ["manager-dashboard"];

export const selectClassName =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 h-12 w-full rounded-2xl border bg-transparent px-4 text-base outline-none focus-visible:ring-3";

export const inputClassName = "h-12 rounded-2xl px-4 text-base";
export const textareaClassName = "min-h-28 rounded-3xl px-4 py-3 text-base";

export const leaseStatusLabels: Record<string, string> = {
  active: "Aktiv",
  draft: "Entwurf",
  ended: "Beendet",
  notice: "Kuendigung",
};

export const marginTypeLabels: Record<string, string> = {
  fixed: "Fester Betrag",
  percentage: "Prozentual",
};

export const serviceStatusLabels: Record<string, string> = {
  closed: "Abgeschlossen",
  in_progress: "In Arbeit",
  open: "Offen",
  resolved: "Geloest",
  waiting_vendor: "Wartet auf Firma",
};

export const priorityLabels: Record<string, string> = {
  high: "Hoch",
  low: "Niedrig",
  medium: "Mittel",
  urgent: "Sofort",
};

export function formatDateLabel(value: string | null | undefined) {
  if (!value) {
    return "offen";
  }

  return new Intl.DateTimeFormat("de-DE").format(new Date(value));
}

export function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export function buildLeaseDefaults(
  lease?: ManagerPortalData["leases"][number],
): UpdateLeaseInput {
  return {
    billingDay: lease?.billingDay ?? 1,
    leaseId: lease?.id ?? "",
    marginType: lease?.marginType === "fixed" ? "fixed" : "percentage",
    marginValue: lease?.marginValue ?? 0,
    notes: lease?.notes ?? "",
    status:
      lease?.status === "draft" ||
      lease?.status === "active" ||
      lease?.status === "notice" ||
      lease?.status === "ended"
        ? lease.status
        : "active",
  };
}

export function buildCostItemDefaults(
  leaseId: string,
  category?: ManagerPortalData["costCategories"][number],
): CreateLeaseCostItemInput {
  return {
    amount: 0,
    costCategoryId: category?.id ?? "",
    effectiveFrom: getToday(),
    effectiveTo: "",
    isExternal: category?.isExternal ?? true,
    label: "",
    leaseId,
    note: "",
  };
}

export function buildSnapshotDefaults(
  leaseId: string,
  reason?: ManagerPortalData["changeReasons"][number],
): PublishSnapshotInput {
  return {
    description:
      "Aenderung wurde transparent mit aktualisierten Kostenbloeken veroeffentlicht.",
    effectiveDate: getToday(),
    leaseId,
    reasonId: reason?.id ?? "",
    summary: "Aktualisierte Mietzusammensetzung",
    title: "Aktualisierte Mietzusammensetzung",
  };
}

export function buildServiceDefaults(
  serviceCase?: ManagerPortalData["serviceCases"][number],
): UpdateServiceCaseStatusInput {
  return {
    detail: "",
    serviceCaseId: serviceCase?.id ?? "",
    status:
      serviceCase?.status === "open" ||
      serviceCase?.status === "in_progress" ||
      serviceCase?.status === "waiting_vendor" ||
      serviceCase?.status === "resolved" ||
      serviceCase?.status === "closed"
        ? serviceCase.status
        : "open",
  };
}

export async function fetchDashboard() {
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

export async function submitJson<TInput>(
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

export function getServiceTone(status: string) {
  if (status === "closed" || status === "resolved") {
    return "bg-emerald-100 text-emerald-900 hover:bg-emerald-100";
  }

  if (status === "waiting_vendor") {
    return "bg-amber-100 text-amber-900 hover:bg-amber-100";
  }

  return "bg-slate-900 text-slate-50 hover:bg-slate-900";
}

export function getLeaseSummary(lease?: ManagerPortalData["leases"][number]) {
  if (!lease) {
    return {
      currentRent: null,
      latestChange: null,
      latestSnapshot: null,
    };
  }

  return {
    currentRent: lease.snapshots[0]?.rentTotal ?? null,
    latestChange: lease.recentChanges[0] ?? null,
    latestSnapshot: lease.snapshots[0] ?? null,
  };
}

export function FormFeedback({
  error,
  message,
}: {
  error: string | null;
  message: string | null;
}) {
  // UX-Grund: Erfolgs- und Fehlerfeedback erscheint direkt am Formular, damit niemand nach dem Ergebnis suchen muss.
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

export function FieldError({ message }: { message?: string }) {
  // UX-Grund: Fehlertexte stehen direkt unter dem Feld und vermeiden Ratespiel bei ungültigen Eingaben.
  if (!message) {
    return null;
  }

  return <p className="text-sm text-destructive">{message}</p>;
}
