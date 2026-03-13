import { Prisma, Role, SnapshotStatus } from "@prisma/client";

import { getDb } from "@/lib/db";

function asNumber(value: Prisma.Decimal | number | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  return value ? value.toNumber() : 0;
}

export async function getManagerPortalData(userId: string) {
  const db = getDb();
  const membership = await db.organizationMember.findFirst({
    include: {
      organization: true,
    },
    orderBy: { createdAt: "asc" },
    where: {
      role: {
        in: [Role.org_owner, Role.org_manager, Role.property_manager],
      },
      userId,
    },
  });

  if (!membership) {
    return null;
  }

  const [
    propertyCount,
    unitCount,
    activeLeaseCount,
    openServiceCaseCount,
    recentChanges,
    featuredLease,
  ] = await Promise.all([
    db.property.count({
      where: { organizationId: membership.organizationId },
    }),
    db.unit.count({
      where: { property: { organizationId: membership.organizationId } },
    }),
    db.lease.count({
      where: {
        organizationId: membership.organizationId,
        status: { in: ["active", "notice"] },
      },
    }),
    db.serviceCase.count({
      where: {
        organizationId: membership.organizationId,
        status: { in: ["open", "in_progress", "waiting_vendor"] },
      },
    }),
    db.leaseChange.findMany({
      include: {
        lease: {
          include: { unit: true },
        },
        reason: true,
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      where: { organizationId: membership.organizationId },
    }),
    db.lease.findFirst({
      include: {
        property: true,
        snapshots: {
          orderBy: { version: "desc" },
          take: 1,
          where: { status: SnapshotStatus.published },
        },
        unit: true,
      },
      orderBy: { startDate: "asc" },
      where: { organizationId: membership.organizationId },
    }),
  ]);

  return {
    activeLeaseCount,
    featuredLease: featuredLease
      ? {
          propertyName: featuredLease.property.name,
          rentTotal: asNumber(featuredLease.snapshots[0]?.rentTotal),
          unitCode: featuredLease.unit.code,
        }
      : null,
    openServiceCaseCount,
    organizationName: membership.organization.name,
    propertyCount,
    recentChanges: recentChanges.map((change) => ({
      deltaAmount: asNumber(change.deltaAmount),
      effectiveDate: change.effectiveDate,
      id: change.id,
      leaseReference: change.lease.reference,
      reasonLabel: change.reason.label,
      title: change.title,
      unitCode: change.lease.unit.code,
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
            where: {
              visibility: { in: ["tenant", "public"] },
            },
          },
          organization: true,
          property: true,
          serviceCases: {
            include: {
              events: {
                orderBy: { createdAt: "desc" },
                take: 2,
              },
            },
            orderBy: { createdAt: "desc" },
            take: 3,
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
    documents: tenancy.lease.documents.map((document) => ({
      fileName: document.file.fileName,
      id: document.id,
      publishedAt: document.publishedAt,
      title: document.title,
    })),
    organizationName: tenancy.lease.organization.name,
    propertyName: tenancy.lease.property.name,
    serviceCases: tenancy.lease.serviceCases.map((serviceCase) => ({
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
