import { Role } from "@prisma/client";
import { vi } from "vitest";

import { createManagerService } from "@/lib/server/manager-service";

function createMockDb() {
  const tx = {
    auditLog: {
      create: vi.fn(),
    },
    lease: {
      update: vi.fn(),
    },
    leaseChange: {
      create: vi.fn(),
    },
    leaseCostItem: {
      create: vi.fn(),
    },
    leaseRentSnapshot: {
      create: vi.fn(),
    },
    notification: {
      createMany: vi.fn(),
    },
    property: {
      create: vi.fn(),
    },
    serviceCase: {
      update: vi.fn(),
    },
    serviceCaseEvent: {
      create: vi.fn(),
    },
    unit: {
      create: vi.fn(),
    },
  };

  const db = {
    $transaction: vi.fn(async (callback: (value: typeof tx) => unknown) =>
      callback(tx),
    ),
    costCategory: {
      findFirst: vi.fn(),
    },
    lease: {
      findFirst: vi.fn(),
    },
    leaseChangeReason: {
      findFirst: vi.fn(),
    },
    organization: {
      findFirst: vi.fn(),
    },
    organizationMember: {
      findFirst: vi.fn(),
    },
    property: {
      findFirst: vi.fn(),
    },
    serviceCase: {
      findFirst: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  };

  return {
    db,
    tx,
  };
}

describe("manager service", () => {
  it("lets a manager add a cost item to an accessible lease", async () => {
    const { db, tx } = createMockDb();
    db.organizationMember.findFirst.mockResolvedValue({
      organizationId: "org-1",
      propertyAssignments: [{ propertyId: "property-1" }],
      role: Role.property_manager,
    });
    db.lease.findFirst.mockResolvedValue({
      id: "lease-1",
      organizationId: "org-1",
      propertyId: "property-1",
      reference: "LEASE-1",
    });
    db.costCategory.findFirst.mockResolvedValue({
      id: "category-1",
      organizationId: "org-1",
    });
    tx.leaseCostItem.create.mockResolvedValue({
      id: "item-1",
    });

    const service = createManagerService(db as never);

    await service.createLeaseCostItem("manager-1", {
      amount: 420,
      costCategoryId: "category-1",
      effectiveFrom: "2026-04-01",
      effectiveTo: "",
      isExternal: true,
      label: "Gebaeudeservice",
      leaseId: "lease-1",
      note: "Neuer Hausmeistervertrag",
    });

    expect(tx.leaseCostItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amount: 420,
          label: "Gebaeudeservice",
          leaseId: "lease-1",
        }),
      }),
    );
    expect(tx.auditLog.create).toHaveBeenCalled();
  });

  it("creates a history entry when publishing a new snapshot", async () => {
    const { db, tx } = createMockDb();
    db.organizationMember.findFirst.mockResolvedValue({
      organizationId: "org-1",
      propertyAssignments: [{ propertyId: "property-1" }],
      role: Role.property_manager,
    });
    db.lease.findFirst.mockResolvedValue({
      costItems: [
        {
          amount: 1200,
          costCategory: { id: "category-1", key: "property_costs" },
          costCategoryId: "category-1",
          effectiveFrom: new Date("2025-01-01T00:00:00.000Z"),
          effectiveTo: null,
          id: "cost-1",
          isExternal: false,
          label: "Objektkosten",
        },
        {
          amount: 360,
          costCategory: { id: "category-2", key: "utilities" },
          costCategoryId: "category-2",
          effectiveFrom: new Date("2025-01-01T00:00:00.000Z"),
          effectiveTo: null,
          id: "cost-2",
          isExternal: true,
          label: "Betriebskosten",
        },
      ],
      currency: "EUR",
      id: "lease-1",
      marginType: "fixed",
      marginValue: 170,
      propertyId: "property-1",
      reference: "LEASE-1",
      snapshots: [
        {
          costTotal: 1580,
          id: "snapshot-1",
          items: [
            {
              amount: 1200,
              isExternal: false,
              isMargin: false,
              label: "Objektkosten",
              sharePercent: 68.57,
              sourceCostItemId: "cost-1",
            },
            {
              amount: 380,
              isExternal: true,
              isMargin: false,
              label: "Betriebskosten",
              sharePercent: 21.71,
              sourceCostItemId: "cost-old",
            },
            {
              amount: 170,
              isExternal: false,
              isMargin: true,
              label: "Offene Vermietermarge",
              sharePercent: 9.71,
              sourceCostItemId: null,
            },
          ],
          marginAmount: 170,
          rentTotal: 1750,
          version: 1,
        },
      ],
      tenants: [{ userId: "tenant-1" }],
      unitId: "unit-1",
    });
    db.leaseChangeReason.findFirst.mockResolvedValue({
      id: "reason-1",
      label: "Nebenkostenanpassung",
    });
    tx.leaseRentSnapshot.create.mockResolvedValue({
      id: "snapshot-2",
      version: 2,
    });
    tx.leaseChange.create.mockResolvedValue({
      id: "change-1",
    });

    const service = createManagerService(db as never);

    await service.publishLeaseSnapshot("manager-1", {
      description: "Betriebskosten wurden nach neuer Ausschreibung gesenkt.",
      effectiveDate: "2026-04-01",
      leaseId: "lease-1",
      reasonId: "reason-1",
      summary: "Neue Kostenstruktur ab April",
      title: "Kostenupdate April 2026",
    });

    expect(tx.leaseRentSnapshot.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          leaseId: "lease-1",
          version: 2,
        }),
      }),
    );
    expect(tx.leaseChange.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          deltaAmount: -20,
          previousSnapshotId: "snapshot-1",
          reasonId: "reason-1",
          snapshotId: "snapshot-2",
        }),
      }),
    );
    expect(tx.notification.createMany).toHaveBeenCalled();
    expect(tx.auditLog.create).toHaveBeenCalled();
  });

  it("updates a service case status and records the event", async () => {
    const { db, tx } = createMockDb();
    db.organizationMember.findFirst.mockResolvedValue({
      organizationId: "org-1",
      propertyAssignments: [{ propertyId: "property-1" }],
      role: Role.property_manager,
    });
    db.serviceCase.findFirst.mockResolvedValue({
      caseNumber: "SC-1",
      id: "case-1",
      lease: {
        tenants: [{ userId: "tenant-1" }],
      },
      leaseId: "lease-1",
      organizationId: "org-1",
      propertyId: "property-1",
      status: "open",
      unitId: "unit-1",
    });
    tx.serviceCase.update.mockResolvedValue({
      id: "case-1",
      status: "resolved",
    });

    const service = createManagerService(db as never);

    await service.updateServiceCaseStatus("manager-1", {
      detail: "Technikertermin erfolgreich abgeschlossen.",
      serviceCaseId: "case-1",
      status: "resolved",
    });

    expect(tx.serviceCase.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          resolvedAt: expect.any(Date),
          status: "resolved",
        }),
      }),
    );
    expect(tx.serviceCaseEvent.create).toHaveBeenCalled();
    expect(tx.notification.createMany).toHaveBeenCalled();
  });
});
