import { z } from 'zod';

// ============================================
// Enums
// ============================================

export const StageStatusEnum = z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD']);
export type StageStatus = z.infer<typeof StageStatusEnum>;

// ============================================
// Request Schemas
// ============================================

export const createStageSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  startDate: z.string().datetime({ message: 'Invalid start date' }),
  endDate: z.string().datetime({ message: 'Invalid end date' }),
  budgetAmount: z.number().min(0, 'Budget must be non-negative'),
  weight: z.number().min(0).max(100, 'Weight must be between 0 and 100'),
  status: StageStatusEnum.optional().default('SCHEDULED'),
  memberIds: z.array(z.string()).optional().default([]),
  partyIds: z.array(z.string()).optional().default([]),
});

export const updateStageSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  budgetAmount: z.number().min(0).optional(),
  weight: z.number().min(0).max(100).optional(),
  status: StageStatusEnum.optional(),
  memberIds: z.array(z.string()).optional(),
  partyIds: z.array(z.string()).optional(),
});

export const stageQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  projectId: z.string().optional(),
  status: StageStatusEnum.optional(),
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
