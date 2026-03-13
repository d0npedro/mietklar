import { DocumentVisibility, Role } from "@prisma/client";

const orgWideManagerRoles = new Set<Role>([
  Role.admin_platform,
  Role.org_owner,
  Role.org_manager,
]);

export function canManageProperty(input: {
  assignedPropertyIds?: string[];
  propertyId: string;
  role: Role | null | undefined;
}) {
  if (!input.role) {
    return false;
  }

  if (orgWideManagerRoles.has(input.role)) {
    return true;
  }

  if (input.role !== Role.property_manager) {
    return false;
  }

  return (input.assignedPropertyIds ?? []).includes(input.propertyId);
}

export function canAccessLeaseRecord(input: {
  leaseTenantUserIds: string[];
  role: Role | null | undefined;
  userId: string | null | undefined;
}) {
  if (!input.role || !input.userId) {
    return false;
  }

  if (orgWideManagerRoles.has(input.role)) {
    return true;
  }

  if (input.role !== Role.tenant) {
    return false;
  }

  return input.leaseTenantUserIds.includes(input.userId);
}

export function canViewDocument(input: {
  isLeaseTenant: boolean;
  role: Role | null | undefined;
  visibility: DocumentVisibility;
}) {
  if (input.visibility === DocumentVisibility.public) {
    return true;
  }

  if (input.role && orgWideManagerRoles.has(input.role)) {
    return true;
  }

  if (input.visibility === DocumentVisibility.management) {
    return false;
  }

  return input.role === Role.tenant && input.isLeaseTenant;
}
