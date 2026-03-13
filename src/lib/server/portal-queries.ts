import { Prisma, Role, SnapshotStatus } from "@prisma/client";

import { canViewDocument } from "@/lib/domain/access";
import { getDb } from "@/lib/db";
import {
  getManagerScope,
  getPropertyFilter,
} from "@/lib/server/manager-service";

function asNumber(value: Prisma.Decimal | number | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  return value ? value.toNumber() : 0;
}

export type ManagerPortalData = {
  activeLeaseCount: number;
  auditEntries: Array<{
    action: string;
    createdAt: string;
    entityType: string;
    id: string;
    summary: string;
  }>;
  changeReasons: Array<{
    code: string;
    id: string;
    label: string;
  }>;
  costCategories: Array<{
    id: string;
    isExternal: boolean;
    key: string;
    name: string;
  }>;
  leases: Array<{
    billingDay: number;
    costItems: Array<{
      amount: number;
      categoryName: string;
      effectiveFrom: string;
      effectiveTo: string | null;
      id: string;
      isExternal: boolean;
      label: string;
    }>;
    id: string;
    marginType: string;
    marginValue: number;
    notes: string | null;
    propertyId: string;
    propertyName: string;
    recentChanges: Array<{
      deltaAmount: number;
      effectiveDate: string;
      id: string;
      reasonLabel: string;
      title: string;
    }>;
    reference: string;
    snapshots: Array<{
      costTotal: number;
      effectiveDate: string;
      id: string;
      marginAmount: number;
      publishedAt: string | null;
      rentTotal: number;
      version: number;
    }>;
    status: string;
    tenantNames: string[];
    unitCode: string;
  }>;
  openServiceCaseCount: number;
  organizationId: string;
  organizationName: string;
  properties: Array<{
    activeLeaseCount: number;
    addressLine1: string;
    city: string;
    code: string;
    id: string;
    name: string;
    postalCode: string;
    unitCount: number;
    units: Array<{
      activeLeaseReference: string | null;
      areaSqm: number;
      code: string;
      floor: string | null;
      id: string;
      roomCount: number | null;
    }>;
  }>;
  propertyCount: number;
  serviceCases: Array<{
    assignedToName: string | null;
    caseNumber: string;
    createdAt: string;
    id: string;
    priority: string;
    propertyName: string;
    status: string;
    title: string;
    unitCode: string;
  }>;
  unitCount: number;
};

export async function getManagerPortalData(
  userId: string,
): Promise<ManagerPortalData | null> {
  const db = getDb();
  const scope = await getManagerScope(userId, db);

  if (!scope) {
    return null;
  }

  const [
    organization,
    propertyCount,
    unitCount,
    activeLeaseCount,
    openServiceCaseCount,
    properties,
    leases,
    serviceCases,
    costCategories,
    changeReasons,
    auditEntries,
  ] = await Promise.all([
    db.organization.findUnique({
      select: { id: true, name: true },
      where: { id: scope.organizationId },
    }),
    db.property.count({
      where: getPropertyFilter(scope),
    }),
    db.unit.count({
      where: { property: getPropertyFilter(scope) },
    }),
    db.lease.count({
      where: {
        organizationId: scope.organizationId,
        ...(scope.role === Role.property_manager
          ? { propertyId: { in: scope.assignedPropertyIds } }
          : {}),
        status: { in: ["active", "notice"] },
      },
    }),
    db.serviceCase.count({
      where: {
        organizationId: scope.organizationId,
        ...(scope.role === Role.property_manager
          ? { propertyId: { in: scope.assignedPropertyIds } }
          : {}),
        status: { in: ["open", "in_progress", "waiting_vendor"] },
      },
    }),
    db.property.findMany({
      include: {
        leases: {
          select: { id: true },
          where: { status: { in: ["active", "notice"] } },
        },
        units: {
          include: {
            leases: {
              orderBy: { startDate: "desc" },
              select: { reference: true },
              take: 1,
              where: { status: { in: ["active", "notice"] } },
            },
          },
          orderBy: { code: "asc" },
        },
      },
      orderBy: { name: "asc" },
      where: getPropertyFilter(scope),
    }),
    db.lease.findMany({
      include: {
        changes: {
          include: { reason: true },
          orderBy: { publishedAt: "desc" },
          take: 3,
        },
        costItems: {
          include: { costCategory: true },
          orderBy: [{ effectiveFrom: "desc" }, { createdAt: "desc" }],
        },
        property: true,
        snapshots: {
          orderBy: { version: "desc" },
          take: 3,
          where: { status: SnapshotStatus.published },
        },
        tenants: {
          include: { user: true },
          orderBy: { createdAt: "asc" },
          where: { moveOutDate: null },
        },
        unit: true,
      },
      orderBy: [{ startDate: "desc" }, { reference: "asc" }],
      where: {
        organizationId: scope.organizationId,
        ...(scope.role === Role.property_manager
          ? { propertyId: { in: scope.assignedPropertyIds } }
          : {}),
      },
    }),
    db.serviceCase.findMany({
      include: {
        assignedTo: {
          select: { name: true },
        },
        property: {
          select: { name: true },
        },
        unit: {
          select: { code: true },
        },
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 10,
      where: {
        organizationId: scope.organizationId,
        ...(scope.role === Role.property_manager
          ? { propertyId: { in: scope.assignedPropertyIds } }
          : {}),
      },
    }),
    db.costCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      where: { organizationId: scope.organizationId },
    }),
    db.leaseChangeReason.findMany({
      orderBy: { label: "asc" },
      where: { organizationId: scope.organizationId },
    }),
    db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      where: {
        organizationId: scope.organizationId,
        ...(scope.role === Role.property_manager
          ? { propertyId: { in: scope.assignedPropertyIds } }
          : {}),
      },
    }),
  ]);

  return {
    activeLeaseCount,
    auditEntries: auditEntries.map((entry) => ({
      action: entry.action,
      createdAt: entry.createdAt.toISOString(),
      entityType: entry.entityType,
      id: entry.id,
      summary: entry.summary,
    })),
    changeReasons: changeReasons.map((reason) => ({
      code: reason.code,
      id: reason.id,
      label: reason.label,
    })),
    costCategories: costCategories.map((category) => ({
      id: category.id,
      isExternal: category.isExternal,
      key: category.key,
      name: category.name,
    })),
    leases: leases.map((lease) => ({
      billingDay: lease.billingDay,
      costItems: lease.costItems.map((item) => ({
        amount: asNumber(item.amount),
        categoryName: item.costCategory.name,
        effectiveFrom: item.effectiveFrom.toISOString(),
        effectiveTo: item.effectiveTo?.toISOString() ?? null,
        id: item.id,
        isExternal: item.isExternal,
        label: item.label,
      })),
      id: lease.id,
      marginType: lease.marginType,
      marginValue: asNumber(lease.marginValue),
      notes: lease.notes,
      propertyId: lease.propertyId,
      propertyName: lease.property.name,
      recentChanges: lease.changes.map((change) => ({
        deltaAmount: asNumber(change.deltaAmount),
        effectiveDate: change.effectiveDate.toISOString(),
        id: change.id,
        reasonLabel: change.reason.label,
        title: change.title,
      })),
      reference: lease.reference,
      snapshots: lease.snapshots.map((snapshot) => ({
        costTotal: asNumber(snapshot.costTotal),
        effectiveDate: snapshot.effectiveDate.toISOString(),
        id: snapshot.id,
        marginAmount: asNumber(snapshot.marginAmount),
        publishedAt: snapshot.publishedAt?.toISOString() ?? null,
        rentTotal: asNumber(snapshot.rentTotal),
        version: snapshot.version,
      })),
      status: lease.status,
      tenantNames: lease.tenants.map((tenant) => tenant.user.name),
      unitCode: lease.unit.code,
    })),
    openServiceCaseCount,
    organizationId: scope.organizationId,
    organizationName: organization?.name ?? "MietKlar Demo GmbH",
    properties: properties.map((property) => ({
      activeLeaseCount: property.leases.length,
      addressLine1: property.addressLine1,
      city: property.city,
      code: property.code,
      id: property.id,
      name: property.name,
      postalCode: property.postalCode,
      unitCount: property.units.length,
      units: property.units.map((unit) => ({
        activeLeaseReference: unit.leases[0]?.reference ?? null,
        areaSqm: asNumber(unit.areaSqm),
        code: unit.code,
        floor: unit.floor,
        id: unit.id,
        roomCount: unit.roomCount,
      })),
    })),
    propertyCount,
    serviceCases: serviceCases.map((serviceCase) => ({
      assignedToName: serviceCase.assignedTo?.name ?? null,
      caseNumber: serviceCase.caseNumber,
      createdAt: serviceCase.createdAt.toISOString(),
      id: serviceCase.id,
      priority: serviceCase.priority,
      propertyName: serviceCase.property.name,
      status: serviceCase.status,
      title: serviceCase.title,
      unitCode: serviceCase.unit.code,
    })),
    unitCount,
  };
}

export async function getTenantPortalData(userId: string) {
  const db = getDb();
  const tenancy = await db.leaseTenant.findFirst({
    include: {
      lease: {
        include: {
          announcements: {
            orderBy: { publishedAt: "desc" },
            take: 3,
          },
          changes: {
            include: { reason: true },
            orderBy: { effectiveDate: "desc" },
            take: 3,
          },
          documents: {
            include: { file: true },
            orderBy: { publishedAt: "desc" },
            take: 3,
          },
          organization: true,
          property: true,
          serviceCases: {
            include: {
              events: {
                orderBy: { createdAt: "desc" },
                take: 3,
              },
            },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
          snapshots: {
            include: {
              items: {
                orderBy: { label: "asc" },
              },
            },
            orderBy: { version: "desc" },
            take: 1,
            where: { status: SnapshotStatus.published },
          },
          unit: true,
        },
      },
      user: true,
    },
    where: {
      moveOutDate: null,
      userId,
    },
  });

  if (!tenancy) {
    return null;
  }

  const snapshot = tenancy.lease.snapshots[0];

  return {
    announcements: tenancy.lease.announcements.map((announcement) => ({
      content: announcement.content,
      id: announcement.id,
      publishedAt: announcement.publishedAt,
      title: announcement.title,
    })),
    changes: tenancy.lease.changes.map((change) => ({
      deltaAmount: asNumber(change.deltaAmount),
      effectiveDate: change.effectiveDate,
      id: change.id,
      reasonLabel: change.reason.label,
      title: change.title,
    })),
    documents: tenancy.lease.documents
      .filter((document) =>
        canViewDocument({
          isLeaseTenant: true,
          role: Role.tenant,
          visibility: document.visibility,
        }),
      )
      .map((document) => ({
        description: document.description,
        fileName: document.file.fileName,
        id: document.id,
        publishedAt: document.publishedAt,
        title: document.title,
      })),
    organizationName: tenancy.lease.organization.name,
    propertyName: tenancy.lease.property.name,
    serviceCases: tenancy.lease.serviceCases.map((serviceCase) => ({
      caseNumber: serviceCase.caseNumber,
      createdAt: serviceCase.createdAt,
      description: serviceCase.description,
      id: serviceCase.id,
      latestEvent: serviceCase.events[0]?.detail ?? null,
      priority: serviceCase.priority,
      status: serviceCase.status,
      title: serviceCase.title,
    })),
    snapshot: snapshot
      ? {
          costTotal: asNumber(snapshot.costTotal),
          items: snapshot.items.map((item) => ({
            amount: asNumber(item.amount),
            id: item.id,
            isMargin: item.isMargin,
            label: item.label,
            sharePercent: asNumber(item.sharePercent),
          })),
          marginAmount: asNumber(snapshot.marginAmount),
          rentTotal: asNumber(snapshot.rentTotal),
        }
      : null,
    tenantName: tenancy.user.name,
    unitCode: tenancy.lease.unit.code,
  };
}
