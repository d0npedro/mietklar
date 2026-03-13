import {
  AuditAction,
  NotificationType,
  Role,
  SnapshotStatus,
  type Prisma,
} from "@prisma/client";

import { canManageProperty } from "@/lib/domain/access";
import {
  calculateRentSnapshot,
  generateLeaseDelta,
  type CalculatedSnapshot,
} from "@/lib/domain/rent";
import { getDb } from "@/lib/db";
import type {
  CreateLeaseCostItemInput,
  CreatePropertyInput,
  CreateUnitInput,
  PublishSnapshotInput,
  UpdateLeaseInput,
  UpdateServiceCaseStatusInput,
} from "@/lib/validation/manager";

type DbClient = ReturnType<typeof getDb>;

type ManagerScope = {
  assignedPropertyIds: string[];
  organizationId: string;
  role: Role;
  userId: string;
};

export class ManagerServiceError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
  ) {
    super(message);
    this.name = "ManagerServiceError";
  }
}

function asNumber(value: Prisma.Decimal | number | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  return value ? value.toNumber() : 0;
}

function asDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function getPropertyFilter(scope: ManagerScope) {
  if (scope.role === Role.property_manager) {
    return {
      id: {
        in: scope.assignedPropertyIds,
      },
      organizationId: scope.organizationId,
    };
  }

  return {
    organizationId: scope.organizationId,
  };
}

function assertPropertyAccess(scope: ManagerScope, propertyId: string) {
  if (
    !canManageProperty({
      assignedPropertyIds: scope.assignedPropertyIds,
      propertyId,
      role: scope.role,
    })
  ) {
    throw new ManagerServiceError(
      "Kein Zugriff auf das ausgewaehlte Objekt.",
      403,
    );
  }
}

function toCalculatedSnapshot(snapshot: {
  costTotal: Prisma.Decimal | number;
  items: Array<{
    amount: Prisma.Decimal | number;
    isExternal: boolean;
    isMargin: boolean;
    label: string;
    sharePercent: Prisma.Decimal | number | null;
    sourceCostItemId: string | null;
  }>;
  marginAmount: Prisma.Decimal | number;
  rentTotal: Prisma.Decimal | number;
}): CalculatedSnapshot {
  return {
    costTotal: asNumber(snapshot.costTotal),
    items: snapshot.items.map((item) => ({
      amount: asNumber(item.amount),
      isExternal: item.isExternal,
      isMargin: item.isMargin,
      key: item.sourceCostItemId ?? `snapshot-${item.label}`,
      label: item.label,
      sharePercent: asNumber(item.sharePercent),
    })),
    marginAmount: asNumber(snapshot.marginAmount),
    rentTotal: asNumber(snapshot.rentTotal),
  };
}

export async function getManagerScope(
  userId: string,
  db: DbClient = getDb(),
): Promise<ManagerScope | null> {
  const membership = await db.organizationMember.findFirst({
    include: {
      propertyAssignments: {
        select: {
          propertyId: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    where: {
      role: {
        in: [Role.org_owner, Role.org_manager, Role.property_manager],
      },
      userId,
    },
  });

  if (membership) {
    return {
      assignedPropertyIds: membership.propertyAssignments.map(
        (assignment) => assignment.propertyId,
      ),
      organizationId: membership.organizationId,
      role: membership.role,
      userId,
    };
  }

  const user = await db.user.findUnique({
    select: {
      globalRole: true,
    },
    where: {
      id: userId,
    },
  });

  if (user?.globalRole !== Role.admin_platform) {
    return null;
  }

  const organization = await db.organization.findFirst({
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
    },
  });

  if (!organization) {
    return null;
  }

  return {
    assignedPropertyIds: [],
    organizationId: organization.id,
    role: Role.admin_platform,
    userId,
  };
}

export async function requireManagerScope(
  userId: string,
  db: DbClient = getDb(),
) {
  const scope = await getManagerScope(userId, db);

  if (!scope) {
    throw new ManagerServiceError("Kein Manager-Zugriff verfuegbar.", 403);
  }

  return scope;
}

export function createManagerService(db: DbClient = getDb()) {
  return {
    async createLeaseCostItem(userId: string, input: CreateLeaseCostItemInput) {
      const scope = await requireManagerScope(userId, db);
      const lease = await db.lease.findFirst({
        select: {
          id: true,
          organizationId: true,
          propertyId: true,
          reference: true,
        },
        where: {
          id: input.leaseId,
          organizationId: scope.organizationId,
        },
      });

      if (!lease) {
        throw new ManagerServiceError("Lease wurde nicht gefunden.", 404);
      }

      assertPropertyAccess(scope, lease.propertyId);

      const category = await db.costCategory.findFirst({
        select: {
          id: true,
          organizationId: true,
        },
        where: {
          id: input.costCategoryId,
          organizationId: scope.organizationId,
        },
      });

      if (!category) {
        throw new ManagerServiceError(
          "Kostenkategorie wurde nicht gefunden.",
          404,
        );
      }

      return db.$transaction(async (tx) => {
        const item = await tx.leaseCostItem.create({
          data: {
            amount: input.amount,
            costCategoryId: category.id,
            effectiveFrom: asDate(input.effectiveFrom),
            effectiveTo: input.effectiveTo ? asDate(input.effectiveTo) : null,
            isExternal: input.isExternal,
            label: input.label,
            leaseId: lease.id,
            note: input.note ?? null,
          },
        });

        await tx.auditLog.create({
          data: {
            action: AuditAction.create,
            actorId: userId,
            entityId: item.id,
            entityType: "LeaseCostItem",
            leaseId: lease.id,
            organizationId: scope.organizationId,
            propertyId: lease.propertyId,
            summary: `${input.label} fuer ${lease.reference} angelegt.`,
          },
        });

        return {
          id: item.id,
          leaseId: lease.id,
        };
      });
    },

    async createProperty(userId: string, input: CreatePropertyInput) {
      const scope = await requireManagerScope(userId, db);

      if (scope.role === Role.property_manager) {
        throw new ManagerServiceError(
          "Property Manager duerfen keine neuen Objekte anlegen.",
          403,
        );
      }

      return db.$transaction(async (tx) => {
        const property = await tx.property.create({
          data: {
            addressLine1: input.addressLine1,
            city: input.city,
            code: input.code.toUpperCase(),
            country: input.country,
            name: input.name,
            organizationId: scope.organizationId,
            postalCode: input.postalCode,
          },
        });

        await tx.auditLog.create({
          data: {
            action: AuditAction.create,
            actorId: userId,
            entityId: property.id,
            entityType: "Property",
            organizationId: scope.organizationId,
            propertyId: property.id,
            summary: `Objekt ${property.name} angelegt.`,
          },
        });

        return {
          id: property.id,
          name: property.name,
        };
      });
    },

    async createUnit(userId: string, input: CreateUnitInput) {
      const scope = await requireManagerScope(userId, db);
      const property = await db.property.findFirst({
        select: {
          id: true,
          name: true,
          organizationId: true,
        },
        where: {
          id: input.propertyId,
          ...getPropertyFilter(scope),
        },
      });

      if (!property) {
        throw new ManagerServiceError("Objekt wurde nicht gefunden.", 404);
      }

      assertPropertyAccess(scope, property.id);

      return db.$transaction(async (tx) => {
        const unit = await tx.unit.create({
          data: {
            areaSqm: input.areaSqm,
            code: input.code.toUpperCase(),
            floor: input.floor ?? null,
            propertyId: property.id,
            roomCount: input.roomCount,
          },
        });

        await tx.auditLog.create({
          data: {
            action: AuditAction.create,
            actorId: userId,
            entityId: unit.id,
            entityType: "Unit",
            organizationId: scope.organizationId,
            propertyId: property.id,
            summary: `Einheit ${unit.code} fuer ${property.name} angelegt.`,
            unitId: unit.id,
          },
        });

        return {
          id: unit.id,
          propertyId: property.id,
        };
      });
    },

    async publishLeaseSnapshot(userId: string, input: PublishSnapshotInput) {
      const scope = await requireManagerScope(userId, db);
      const lease = await db.lease.findFirst({
        include: {
          costItems: {
            include: {
              costCategory: {
                select: {
                  id: true,
                  key: true,
                },
              },
            },
            orderBy: {
              effectiveFrom: "asc",
            },
          },
          snapshots: {
            include: {
              items: true,
            },
            orderBy: {
              version: "desc",
            },
            take: 1,
            where: {
              status: SnapshotStatus.published,
            },
          },
          tenants: {
            select: {
              userId: true,
            },
            where: {
              moveOutDate: null,
            },
          },
        },
        where: {
          id: input.leaseId,
          organizationId: scope.organizationId,
        },
      });

      if (!lease) {
        throw new ManagerServiceError("Lease wurde nicht gefunden.", 404);
      }

      assertPropertyAccess(scope, lease.propertyId);

      const reason = await db.leaseChangeReason.findFirst({
        select: {
          id: true,
          label: true,
        },
        where: {
          id: input.reasonId,
          organizationId: scope.organizationId,
        },
      });

      if (!reason) {
        throw new ManagerServiceError(
          "Aenderungsgrund wurde nicht gefunden.",
          404,
        );
      }

      const effectiveDate = asDate(input.effectiveDate);
      const activeCostItems = lease.costItems.filter((item) => {
        const startsBefore = item.effectiveFrom <= effectiveDate;
        const endsAfter =
          item.effectiveTo === null || item.effectiveTo >= effectiveDate;

        return startsBefore && endsAfter;
      });

      if (!activeCostItems.length) {
        throw new ManagerServiceError(
          "Fuer das ausgewaehlte Datum sind keine aktiven Kostenpositionen vorhanden.",
        );
      }

      const snapshot = calculateRentSnapshot({
        components: activeCostItems.map((item) => ({
          amount: asNumber(item.amount),
          categoryKey: item.costCategory.key,
          isExternal: item.isExternal,
          key: item.id,
          label: item.label,
        })),
        marginType: lease.marginType,
        marginValue: asNumber(lease.marginValue),
      });

      const previousSnapshot = lease.snapshots[0];
      const previousCalculated = previousSnapshot
        ? toCalculatedSnapshot(previousSnapshot)
        : null;
      const delta = previousCalculated
        ? generateLeaseDelta({
            current: snapshot,
            previous: previousCalculated,
          })
        : null;

      return db.$transaction(async (tx) => {
        const createdSnapshot = await tx.leaseRentSnapshot.create({
          data: {
            costTotal: snapshot.costTotal,
            currency: lease.currency,
            effectiveDate,
            items: {
              create: snapshot.items.map((item) => {
                const sourceItem = activeCostItems.find(
                  (candidate) => candidate.id === item.key,
                );

                return {
                  amount: item.amount,
                  costCategoryId: sourceItem?.costCategoryId,
                  isExternal: item.isExternal,
                  isMargin: item.isMargin ?? false,
                  label: item.label,
                  sharePercent: item.sharePercent,
                  sourceCostItemId: sourceItem?.id,
                };
              }),
            },
            leaseId: lease.id,
            marginAmount: snapshot.marginAmount,
            organizationId: scope.organizationId,
            publishedAt: new Date(),
            publishedById: userId,
            rentTotal: snapshot.rentTotal,
            status: SnapshotStatus.published,
            summary: input.summary ?? null,
            version: (previousSnapshot?.version ?? 0) + 1,
          },
        });

        const createdChange = previousSnapshot
          ? await tx.leaseChange.create({
              data: {
                deltaAmount: delta?.totalDelta ?? 0,
                description: input.description,
                effectiveDate,
                leaseId: lease.id,
                organizationId: scope.organizationId,
                previousSnapshotId: previousSnapshot.id,
                publishedAt: new Date(),
                publishedById: userId,
                reasonId: reason.id,
                snapshotId: createdSnapshot.id,
                title: input.title,
              },
            })
          : null;

        if (lease.tenants.length) {
          const notifications = lease.tenants.flatMap((tenant) => {
            const entries: Array<{
              body: string;
              leaseChangeId?: string;
              leaseId: string;
              linkPath: string;
              organizationId: string;
              title: string;
              type: NotificationType;
              userId: string;
            }> = [
              {
                body: `Snapshot Version ${createdSnapshot.version} fuer ${lease.reference} ist jetzt sichtbar.`,
                leaseId: lease.id,
                linkPath: "/portal/mieter",
                organizationId: scope.organizationId,
                title: "Neuer Miet-Snapshot veroeffentlicht",
                type: NotificationType.snapshot_published,
                userId: tenant.userId,
              },
            ];

            if (createdChange) {
              entries.push({
                body: `${reason.label}: ${input.title}`,
                leaseChangeId: createdChange.id,
                leaseId: lease.id,
                linkPath: "/portal/mieter",
                organizationId: scope.organizationId,
                title: "Mietaenderung veroeffentlicht",
                type: NotificationType.lease_changed,
                userId: tenant.userId,
              });
            }

            return entries;
          });

          await tx.notification.createMany({
            data: notifications,
          });
        }

        await tx.auditLog.create({
          data: {
            action: AuditAction.publish,
            actorId: userId,
            entityId: createdSnapshot.id,
            entityType: "LeaseRentSnapshot",
            leaseId: lease.id,
            metadata: {
              deltaAmount: delta?.totalDelta ?? null,
              version: createdSnapshot.version,
            },
            organizationId: scope.organizationId,
            propertyId: lease.propertyId,
            snapshotId: createdSnapshot.id,
            summary: `Snapshot Version ${createdSnapshot.version} fuer ${lease.reference} veroeffentlicht.`,
            unitId: lease.unitId,
          },
        });

        return {
          changeId: createdChange?.id ?? null,
          snapshotId: createdSnapshot.id,
          version: createdSnapshot.version,
        };
      });
    },

    async updateLease(userId: string, input: UpdateLeaseInput) {
      const scope = await requireManagerScope(userId, db);
      const lease = await db.lease.findFirst({
        select: {
          id: true,
          organizationId: true,
          propertyId: true,
          reference: true,
        },
        where: {
          id: input.leaseId,
          organizationId: scope.organizationId,
        },
      });

      if (!lease) {
        throw new ManagerServiceError("Lease wurde nicht gefunden.", 404);
      }

      assertPropertyAccess(scope, lease.propertyId);

      return db.$transaction(async (tx) => {
        const updatedLease = await tx.lease.update({
          data: {
            billingDay: input.billingDay,
            marginType: input.marginType,
            marginValue: input.marginValue,
            notes: input.notes ?? null,
            status: input.status,
          },
          where: {
            id: lease.id,
          },
        });

        await tx.auditLog.create({
          data: {
            action: AuditAction.update,
            actorId: userId,
            entityId: updatedLease.id,
            entityType: "Lease",
            leaseId: updatedLease.id,
            organizationId: scope.organizationId,
            propertyId: lease.propertyId,
            summary: `Lease ${lease.reference} aktualisiert.`,
          },
        });

        return {
          id: updatedLease.id,
        };
      });
    },

    async updateServiceCaseStatus(
      userId: string,
      input: UpdateServiceCaseStatusInput,
    ) {
      const scope = await requireManagerScope(userId, db);
      const serviceCase = await db.serviceCase.findFirst({
        include: {
          lease: {
            select: {
              tenants: {
                select: {
                  userId: true,
                },
                where: {
                  moveOutDate: null,
                },
              },
            },
          },
        },
        where: {
          id: input.serviceCaseId,
          organizationId: scope.organizationId,
        },
      });

      if (!serviceCase) {
        throw new ManagerServiceError("Servicefall wurde nicht gefunden.", 404);
      }

      assertPropertyAccess(scope, serviceCase.propertyId);

      const detail =
        input.detail ??
        `Status von ${serviceCase.status} auf ${input.status} gesetzt.`;
      const isResolved =
        input.status === "resolved" || input.status === "closed";

      return db.$transaction(async (tx) => {
        const updatedCase = await tx.serviceCase.update({
          data: {
            resolvedAt: isResolved ? new Date() : null,
            status: input.status,
          },
          where: {
            id: serviceCase.id,
          },
        });

        await tx.serviceCaseEvent.create({
          data: {
            actorId: userId,
            detail,
            fromStatus: serviceCase.status,
            serviceCaseId: serviceCase.id,
            toStatus: input.status,
            type: "status_changed",
          },
        });

        await tx.auditLog.create({
          data: {
            action: AuditAction.status_change,
            actorId: userId,
            entityId: updatedCase.id,
            entityType: "ServiceCase",
            leaseId: serviceCase.leaseId,
            organizationId: scope.organizationId,
            propertyId: serviceCase.propertyId,
            serviceCaseId: serviceCase.id,
            summary: `Servicefall ${serviceCase.caseNumber} auf ${input.status} gesetzt.`,
            unitId: serviceCase.unitId,
          },
        });

        if (serviceCase.lease?.tenants.length) {
          await tx.notification.createMany({
            data: serviceCase.lease.tenants.map((tenant) => ({
              body: detail,
              leaseId: serviceCase.leaseId,
              linkPath: "/portal/mieter",
              organizationId: scope.organizationId,
              serviceCaseId: serviceCase.id,
              title: `Servicefall ${serviceCase.caseNumber} aktualisiert`,
              type: NotificationType.service_case_updated,
              userId: tenant.userId,
            })),
          });
        }

        return {
          id: updatedCase.id,
          status: updatedCase.status,
        };
      });
    },
  };
}
