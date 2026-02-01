/**
 * Import API Schemas
 *
 * Zod schemas for import-related endpoints
 */

import { z } from 'zod';

// ============================================
// Route Params
// ============================================

export const ProjectImportParamsSchema = z.object({
  projectId: z.string().min(1),
});

export const ImportJobParamsSchema = z.object({
  projectId: z.string().min(1),
  jobId: z.string().min(1),
});

// ============================================
// Request/Response Schemas
// ============================================

export const StartImportResponseSchema = z.object({
  jobId: z.string(),
  status: z.string(),
  message: z.string(),
});

export const ImportJobStatusSchema = z.enum([
  'PENDING',
  'UPLOADING',
  'QUEUED',
  'PROCESSING',
  'AI_PARSING',
  'SAVING',
  'COMPLETED',
  'FAILED',
]);

export const ImportJobResponseSchema = z.object({
  id: z.string(),
  status: ImportJobStatusSchema,
  progress: z.number(),
  fileName: z.string(),
  fileSize: z.number(),
  fileType: z.string(),
  itemsFound: z.number().nullable(),
  itemsSaved: z.number().nullable(),
  errors: z.array(z.string()),
  result: z.unknown().nullable(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  createdAt: z.string(),
});

export const ActiveImportsResponseSchema = z.object({
  jobs: z.array(ImportJobResponseSchema),
});

export const ConfirmImportBodySchema = z.object({
  items: z.array(
    z.object({
      code: z.string().optional(),
      description: z.string().min(1),
      unit: z.string().min(1),
      quantity: z.number().positive(),
      rate: z.number().min(0),
      sectionName: z.string().optional(),
    })
  ),
});

// ============================================
// Query Schemas (for monitoring endpoints)
// ============================================

export const JobsQuerySchema = z.object({
  status: ImportJobStatusSchema.optional(),
  projectId: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

export const StuckJobsQuerySchema = z.object({
  minutes: z.coerce.number().min(1).max(1440).default(5), // Default 5 minutes, max 24 hours
});

// ============================================
// Types
// ============================================

export type ProjectImportParams = z.infer<typeof ProjectImportParamsSchema>;
export type ImportJobParams = z.infer<typeof ImportJobParamsSchema>;
export type StartImportResponse = z.infer<typeof StartImportResponseSchema>;
export type ImportJobResponse = z.infer<typeof ImportJobResponseSchema>;
export type ActiveImportsResponse = z.infer<typeof ActiveImportsResponseSchema>;
export type ConfirmImportBody = z.infer<typeof ConfirmImportBodySchema>;
export type JobsQuery = z.infer<typeof JobsQuerySchema>;
export type StuckJobsQuery = z.infer<typeof StuckJobsQuerySchema>;
