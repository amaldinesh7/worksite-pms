import { z } from 'zod';

// ============================================
// Request Schemas
// ============================================

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  clientId: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  startDate: z.string().datetime(),
  amount: z.number().positive().optional(),
  projectTypeItemId: z.string().min(1, 'Project type is required'),
});

export const updateProjectSchema = createProjectSchema.partial();

export const projectQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
});

export const projectParamsSchema = z.object({
  id: z.string().min(1),
});

// ============================================
// Type Exports
// ============================================

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQuery = z.infer<typeof projectQuerySchema>;
export type ProjectParams = z.infer<typeof projectParamsSchema>;
