import { z } from 'zod';

// ============================================
// Enums
// ============================================

export const TaskStatusEnum = z.enum([
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETED',
  'ON_HOLD',
  'BLOCKED',
]);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

// ============================================
// Request Schemas
// ============================================

export const createTaskSchema = z.object({
  stageId: z.string().min(1, 'Stage is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  daysAllocated: z.number().int().min(1, 'Days allocated must be at least 1'),
  status: TaskStatusEnum.optional().default('NOT_STARTED'),
  memberIds: z.array(z.string()).optional().default([]),
  partyIds: z.array(z.string()).optional().default([]), // Labour and Subcontractors
});

export const updateTaskSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  daysAllocated: z.number().int().min(1).optional(),
  status: TaskStatusEnum.optional(),
  memberIds: z.array(z.string()).optional(),
  partyIds: z.array(z.string()).optional(),
});

export const updateTaskStatusSchema = z.object({
  status: TaskStatusEnum,
});

export const taskQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  stageId: z.string().optional(),
  projectId: z.string().optional(),
  status: TaskStatusEnum.optional(),
});

export const projectParamsSchema = z.object({
  projectId: z.string().min(1),
});

export const taskParamsSchema = z.object({
  id: z.string().min(1),
});

export const stageParamsSchema = z.object({
  stageId: z.string().min(1),
});

// ============================================
// Type Exports
// ============================================

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;
export type TaskParams = z.infer<typeof taskParamsSchema>;
export type StageParams = z.infer<typeof stageParamsSchema>;
export type ProjectParams = z.infer<typeof projectParamsSchema>;
