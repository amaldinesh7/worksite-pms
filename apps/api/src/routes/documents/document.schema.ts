import { z } from 'zod';

// ============================================
// Request Schemas
// ============================================

export const documentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  projectId: z.string().optional(),
});

export const documentParamsSchema = z.object({
  id: z.string().min(1),
});

// ============================================
// Response Schemas
// ============================================

export const documentResponseSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  projectId: z.string(),
  fileName: z.string(),
  fileType: z.string(),
  fileUrl: z.string(),
  storagePath: z.string(),
  mimeType: z.string(),
  originalSize: z.number(),
  compressedSize: z.number(),
  compressionRatio: z.number(),
  uploadedAt: z.string(),
});

export const documentsListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(documentResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

export const documentUploadResponseSchema = z.object({
  success: z.literal(true),
  data: documentResponseSchema,
  compression: z.object({
    originalSize: z.number(),
    compressedSize: z.number(),
    savedBytes: z.number(),
    compressionRatio: z.number(),
  }),
});

// ============================================
// Type Exports
// ============================================

export type DocumentQuery = z.infer<typeof documentQuerySchema>;
export type DocumentParams = z.infer<typeof documentParamsSchema>;
export type DocumentResponse = z.infer<typeof documentResponseSchema>;
