import { z } from "zod";

export const createTenantServiceCaseSchema = z.object({
  description: z.string().trim().min(15).max(1000),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  title: z.string().trim().min(5).max(140),
});

export type CreateTenantServiceCaseInput = z.infer<
  typeof createTenantServiceCaseSchema
>;
