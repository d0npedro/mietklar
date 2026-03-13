import { DocumentVisibility, Role } from "@prisma/client";

import {
  canAccessLeaseRecord,
  canManageProperty,
  canViewDocument,
} from "@/lib/domain/access";

describe("access rules", () => {
  it("allows org-wide roles to manage any property", () => {
    expect(
      canManageProperty({
        assignedPropertyIds: [],
        propertyId: "property-1",
        role: Role.org_manager,
      }),
    ).toBe(true);
  });

  it("restricts property managers to assigned properties", () => {
    expect(
      canManageProperty({
        assignedPropertyIds: ["property-1"],
        propertyId: "property-1",
        role: Role.property_manager,
      }),
    ).toBe(true);

    expect(
      canManageProperty({
        assignedPropertyIds: ["property-1"],
        propertyId: "property-2",
        role: Role.property_manager,
      }),
    ).toBe(false);
  });

  it("ensures tenants can access only their own lease", () => {
    expect(
      canAccessLeaseRecord({
        leaseTenantUserIds: ["tenant-1"],
        role: Role.tenant,
        userId: "tenant-1",
      }),
    ).toBe(true);

    expect(
      canAccessLeaseRecord({
        leaseTenantUserIds: ["tenant-1"],
        role: Role.tenant,
        userId: "tenant-2",
      }),
    ).toBe(false);
  });

  it("applies document visibility rules for managers and tenants", () => {
    expect(
      canViewDocument({
        isLeaseTenant: false,
        role: Role.org_owner,
        visibility: DocumentVisibility.management,
      }),
    ).toBe(true);

    expect(
      canViewDocument({
        isLeaseTenant: true,
        role: Role.tenant,
        visibility: DocumentVisibility.tenant,
      }),
    ).toBe(true);

    expect(
      canViewDocument({
        isLeaseTenant: false,
        role: Role.tenant,
        visibility: DocumentVisibility.tenant,
      }),
    ).toBe(false);
  });
});
