import { z } from 'zod';

// ============================================
// Permission Schemas
// ============================================

export const permissionParamsSchema = z.object({
  id: z.string().min(1),
});

// ============================================
// Type Exports
// ============================================

export type PermissionParams = z.infer<typeof permissionParamsSchema>;
