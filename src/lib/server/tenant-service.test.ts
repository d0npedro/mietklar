import { vi } from "vitest";

import { createTenantService } from "@/lib/server/tenant-service";

function createMockDb() {
  const tx = {
    auditLog: {
      create: vi.fn(),
    },
    serviceCase: {
      create: vi.fn(),
    },
    serviceCaseEvent: {
      create: vi.fn(),
    },
  };

  const db = {
    $transaction: vi.fn(async (callback: (value: typeof tx) => unknown) =>
      callback(tx),
    ),
    leaseTenant: {
      findFirst: vi.fn(),
    },
    serviceCase: {
      count: vi.fn(),
    },
  };

  return {
    db,
    tx,
  };
}

describe("tenant service", () => {
  it("creates a service case for the active tenant lease", async () => {
    const { db, tx } = createMockDb();
    db.leaseTenant.findFirst.mockResolvedValue({
      lease: {
        id: "lease-1",
        organizationId: "org-1",
        propertyId: "property-1",
        reference: "LEASE-1",
        unitId: "unit-1",
      },
    });
    db.serviceCase.count.mockResolvedValue(4);
    tx.serviceCase.create.mockResolvedValue({
      id: "case-1",
    });

    const service = createTenantService(db as never);

    await service.createServiceCase("tenant-1", {
      description: "Im Badezimmer laeuft das Wasser am Siphon aus.",
      priority: "high",
      title: "Leck unter dem Waschbecken",
    });

    expect(tx.serviceCase.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          caseNumber: expect.stringMatching(/^SC-\d{4}-005$/),
          createdById: "tenant-1",
          leaseId: "lease-1",
          priority: "high",
        }),
      }),
    );
    expect(tx.serviceCaseEvent.create).toHaveBeenCalled();
    expect(tx.auditLog.create).toHaveBeenCalled();
  });
});
