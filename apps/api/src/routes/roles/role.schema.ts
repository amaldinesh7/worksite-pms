import { z } from 'zod';

// ============================================
// Role Schemas
// ============================================

export const createRoleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  permissionIds: z.array(z.string()).optional(),
});

export const updateRoleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  permissionIds: z.array(z.string()).optional(),
});

export const roleParamsSchema = z.object({
  id: z.string().min(1),
});

export const roleQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 50)),
  search: z.string().optional(),
});

// ============================================
// Type Exports
// ============================================

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type RoleParams = z.infer<typeof roleParamsSchema>;
export type RoleQuery = z.infer<typeof roleQuerySchema>;
