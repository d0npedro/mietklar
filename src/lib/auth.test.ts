import { Role } from "@prisma/client";

import { canAccessTenantPortal, isManagerRole } from "@/lib/auth";

describe("role guards", () => {
  it("allows manager roles into the manager portal", () => {
    expect(isManagerRole(Role.org_owner)).toBe(true);
    expect(isManagerRole(Role.org_manager)).toBe(true);
    expect(isManagerRole(Role.property_manager)).toBe(true);
    expect(isManagerRole(Role.tenant)).toBe(false);
  });

  it("only allows tenants and platform admins into the tenant portal", () => {
    expect(canAccessTenantPortal(Role.tenant)).toBe(true);
    expect(canAccessTenantPortal(Role.admin_platform)).toBe(true);
    expect(canAccessTenantPortal(Role.property_manager)).toBe(false);
  });
});
