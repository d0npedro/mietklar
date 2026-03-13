import { z } from "zod";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function optionalText(maxLength: number) {
  return z
    .string()
    .trim()
    .max(maxLength)
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined);
}

export const createPropertySchema = z.object({
  addressLine1: z.string().trim().min(5).max(140),
  city: z.string().trim().min(2).max(80),
  code: z.string().trim().min(2).max(24),
  country: z
    .string()
    .trim()
    .length(2)
    .optional()
    .or(z.literal(""))
    .transform((value) => (value || "DE").toUpperCase()),
  name: z.string().trim().min(3).max(120),
  postalCode: z.string().trim().min(4).max(12),
});

export const createUnitSchema = z.object({
  areaSqm: z.coerce.number().min(1).max(500),
  code: z.string().trim().min(2).max(20),
  floor: optionalText(40),
  propertyId: z.string().trim().min(1),
  roomCount: z.coerce.number().int().min(1).max(20),
});

export const updateLeaseSchema = z.object({
  billingDay: z.coerce.number().int().min(1).max(28),
  leaseId: z.string().trim().min(1),
  marginType: z.enum(["percentage", "fixed"]),
  marginValue: z.coerce.number().min(0).max(100_000),
  notes: optionalText(600),
  status: z.enum(["draft", "active", "notice", "ended"]),
});

export const createLeaseCostItemSchema = z.object({
  amount: z.coerce.number().min(0).max(100_000),
  costCategoryId: z.string().trim().min(1),
  effectiveFrom: z.string().regex(datePattern),
  effectiveTo: z
    .string()
    .regex(datePattern)
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined),
  isExternal: z.coerce.boolean(),
  label: z.string().trim().min(3).max(120),
  leaseId: z.string().trim().min(1),
  note: optionalText(600),
});

export const publishSnapshotSchema = z.object({
  description: z.string().trim().min(10).max(600),
  effectiveDate: z.string().regex(datePattern),
  leaseId: z.string().trim().min(1),
  reasonId: z.string().trim().min(1),
  summary: optionalText(300),
  title: z.string().trim().min(5).max(140),
});

export const updateServiceCaseStatusSchema = z.object({
  detail: optionalText(400),
  serviceCaseId: z.string().trim().min(1),
  status: z.enum([
    "open",
    "in_progress",
    "waiting_vendor",
    "resolved",
    "closed",
  ]),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type CreateUnitInput = z.infer<typeof createUnitSchema>;
export type UpdateLeaseInput = z.infer<typeof updateLeaseSchema>;
export type CreateLeaseCostItemInput = z.infer<
  typeof createLeaseCostItemSchema
>;
export type PublishSnapshotInput = z.infer<typeof publishSnapshotSchema>;
export type UpdateServiceCaseStatusInput = z.infer<
  typeof updateServiceCaseStatusSchema
>;
