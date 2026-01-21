import { z } from 'zod';

// ============================================
// Team Member Schemas
// ============================================

export const createTeamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  phone: z
    .string()
    .max(20)
    .regex(/^\+?[0-9\s-]+$/, 'Invalid phone number format')
    .optional(),
  email: z.string().email('Invalid email format').optional(),
  location: z.string().max(500).optional(),
  roleId: z.string().min(1, 'Role is required'),
});

export const updateTeamMemberSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  phone: z
    .string()
    .max(20)
    .regex(/^\+?[0-9\s-]+$/, 'Invalid phone number format')
    .optional()
    .nullable(),
  email: z.string().email('Invalid email format').optional().nullable(),
  location: z.string().max(500).optional().nullable(),
  roleId: z.string().min(1).optional(),
});

export const teamMemberParamsSchema = z.object({
  id: z.string().min(1),
});

export const teamMemberQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20)),
  search: z.string().optional(),
  roleId: z.string().optional(),
});

// ============================================
// Type Exports
// ============================================

export type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>;
export type UpdateTeamMemberInput = z.infer<typeof updateTeamMemberSchema>;
export type TeamMemberParams = z.infer<typeof teamMemberParamsSchema>;
export type TeamMemberQuery = z.infer<typeof teamMemberQuerySchema>;
