import { z } from 'zod';

// ============================================
// Request Schemas
// ============================================

export const createStageSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  name: z.string().min(1, 'Name is required'),
  budgetAmount: z.number().min(0, 'Budget must be non-negative'),
});

export const updateStageSchema = z.object({
  name: z.string().min(1).optional(),
  budgetAmount: z.number().min(0).optional(),
});

export const stageQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  projectId: z.string().optional(),
});

export const stageParamsSchema = z.object({
  id: z.string().min(1),
});

export const projectParamsSchema = z.object({
  projectId: z.string().min(1),
});

// ============================================
// Type Exports
// ============================================

export type CreateStageInput = z.infer<typeof createStageSchema>;
export type UpdateStageInput = z.infer<typeof updateStageSchema>;
export type StageQuery = z.infer<typeof stageQuerySchema>;
export type StageParams = z.infer<typeof stageParamsSchema>;
export type ProjectParams = z.infer<typeof projectParamsSchema>;
