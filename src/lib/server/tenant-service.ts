import { AuditAction, ServiceCaseStatus } from "@prisma/client";

import { getDb } from "@/lib/db";
import type { CreateTenantServiceCaseInput } from "@/lib/validation/tenant";

type DbClient = ReturnType<typeof getDb>;

export class TenantServiceError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
  ) {
    super(message);
    this.name = "TenantServiceError";
  }
}

function buildCaseNumber(sequence: number) {
  return `SC-${new Date().getUTCFullYear()}-${String(sequence).padStart(3, "0")}`;
}

export function createTenantService(db: DbClient = getDb()) {
  return {
    async createServiceCase(
      userId: string,
      input: CreateTenantServiceCaseInput,
    ) {
      const tenancy = await db.leaseTenant.findFirst({
        include: {
          lease: {
            select: {
              id: true,
              organizationId: true,
              propertyId: true,
              reference: true,
              unitId: true,
            },
          },
        },
        where: {
          moveOutDate: null,
          userId,
        },
      });

      if (!tenancy) {
        throw new TenantServiceError(
          "Kein aktives Mietverhaeltnis fuer diesen Nutzer gefunden.",
          404,
        );
      }

      const existingCount = await db.serviceCase.count({
        where: {
          organizationId: tenancy.lease.organizationId,
        },
      });

      const caseNumber = buildCaseNumber(existingCount + 1);

      return db.$transaction(async (tx) => {
        const serviceCase = await tx.serviceCase.create({
          data: {
            caseNumber,
            createdById: userId,
            description: input.description,
            leaseId: tenancy.lease.id,
            organizationId: tenancy.lease.organizationId,
            priority: input.priority,
            propertyId: tenancy.lease.propertyId,
            status: ServiceCaseStatus.open,
            title: input.title,
            unitId: tenancy.lease.unitId,
          },
        });

        await tx.serviceCaseEvent.create({
          data: {
            actorId: userId,
            detail: "Servicefall durch Tenant angelegt.",
            serviceCaseId: serviceCase.id,
            toStatus: ServiceCaseStatus.open,
            type: "case_created",
          },
        });

        await tx.auditLog.create({
          data: {
            action: AuditAction.create,
            actorId: userId,
            entityId: serviceCase.id,
            entityType: "ServiceCase",
            leaseId: tenancy.lease.id,
            organizationId: tenancy.lease.organizationId,
            propertyId: tenancy.lease.propertyId,
            serviceCaseId: serviceCase.id,
            summary: `Servicefall ${caseNumber} durch Tenant angelegt.`,
            unitId: tenancy.lease.unitId,
          },
        });

        return {
          caseNumber,
          id: serviceCase.id,
        };
      });
    },
  };
}
