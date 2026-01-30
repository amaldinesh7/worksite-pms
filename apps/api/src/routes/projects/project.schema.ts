import { z } from 'zod';

// ============================================
// Enums
// ============================================

export const projectStatusEnum = z.enum(['ACTIVE', 'ON_HOLD', 'COMPLETED']);

// ============================================
// Request Schemas
// ============================================

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  clientId: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  amount: z.number().positive().optional(),
  projectTypeItemId: z.string().min(1, 'Project type is required'),
  area: z.string().optional(),
  projectPicture: z.string().optional(),
  status: projectStatusEnum.optional().default('ACTIVE'),
  memberIds: z.array(z.string()).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: projectStatusEnum.optional(),
});

export const projectParamsSchema = z.object({
  id: z.string().min(1),
});

// ============================================
// Project Members Schemas
// ============================================

export const addProjectMemberSchema = z.object({
  memberId: z.string().min(1, 'Member ID is required'),
});

export const projectMemberParamsSchema = z.object({
  id: z.string().min(1),
  memberId: z.string().min(1),
});

// ============================================
// Type Exports
// ============================================

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQuery = z.infer<typeof projectQuerySchema>;
export type ProjectParams = z.infer<typeof projectParamsSchema>;
export type ProjectStatus = z.infer<typeof projectStatusEnum>;
export type AddProjectMemberInput = z.infer<typeof addProjectMemberSchema>;
export type ProjectMemberParams = z.infer<typeof projectMemberParamsSchema>;
