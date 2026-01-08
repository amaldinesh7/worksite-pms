import { z } from 'zod';

// ============================================
// Request Schemas
// ============================================

export const CreateOrganizationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
});

export const UpdateOrganizationSchema = z.object({
  name: z.string().min(1).max(255).optional(),
});

export const AddMemberSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.enum(['ADMIN', 'MANAGER', 'ACCOUNTANT']),
});

export const UpdateMemberRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MANAGER', 'ACCOUNTANT']),
});

// ============================================
// Params Schemas
// ============================================

export const OrganizationIdParams = z.object({
  id: z.string().min(1),
});

export const MemberParams = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
});

// ============================================
// Query Schemas
// ============================================

export const OrganizationListQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
});

// ============================================
// Type Exports
// ============================================

export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof UpdateOrganizationSchema>;
export type AddMemberInput = z.infer<typeof AddMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleSchema>;
export type OrganizationIdParamsType = z.infer<typeof OrganizationIdParams>;
export type MemberParamsType = z.infer<typeof MemberParams>;
export type OrganizationListQueryType = z.infer<typeof OrganizationListQuery>;
