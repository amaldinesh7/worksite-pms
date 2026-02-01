/**
 * BOQ Route Schemas
 *
 * Zod schemas for BOQ API request validation.
 */

import { z } from 'zod';

// ============================================
// Query Schemas
// ============================================

export const BOQListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(500).default(50),
  boqCategoryItemId: z.string().optional(),
  stageId: z.string().optional(),
  sectionId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['description', 'boqCategoryItemId', 'amount', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type BOQListQuery = z.infer<typeof BOQListQuerySchema>;

// ============================================
// Param Schemas
// ============================================

export const ProjectParamsSchema = z.object({
  projectId: z.string().min(1),
});

export type ProjectParams = z.infer<typeof ProjectParamsSchema>;

export const BOQItemParamsSchema = z.object({
  projectId: z.string().min(1),
  id: z.string().min(1),
});

export type BOQItemParams = z.infer<typeof BOQItemParamsSchema>;

export const BOQSectionParamsSchema = z.object({
  projectId: z.string().min(1),
  sectionId: z.string().min(1),
});

export type BOQSectionParams = z.infer<typeof BOQSectionParamsSchema>;

// ============================================
// Body Schemas
// ============================================

export const CreateBOQItemSchema = z.object({
  sectionId: z.string().optional(),
  stageId: z.string().optional(),
  code: z.string().nullable().optional(),
  boqCategoryItemId: z.string().optional(), // Optional - items grouped by section instead
  description: z.string().min(1, 'Description is required'),
  unit: z.string().min(1, 'Unit is required'),
  quantity: z.number().nonnegative('Quantity must be zero or positive'),
  rate: z.number().nonnegative('Rate must be non-negative'),
  notes: z.string().optional(),
});

export type CreateBOQItemInput = z.infer<typeof CreateBOQItemSchema>;

export const UpdateBOQItemSchema = z.object({
  sectionId: z.string().nullable().optional(),
  stageId: z.string().nullable().optional(),
  code: z.string().nullable().optional(),
  boqCategoryItemId: z.string().optional(),
  description: z.string().min(1).optional(),
  unit: z.string().min(1).optional(),
  quantity: z.number().nonnegative().optional(),
  rate: z.number().nonnegative().optional(),
  notes: z.string().nullable().optional(),
  isReviewFlagged: z.boolean().optional(),
  flagReason: z.string().nullable().optional(),
});

export type UpdateBOQItemInput = z.infer<typeof UpdateBOQItemSchema>;

export const CreateBOQSectionSchema = z.object({
  name: z.string().min(1, 'Section name is required'),
  sortOrder: z.number().int().optional(),
});

export type CreateBOQSectionInput = z.infer<typeof CreateBOQSectionSchema>;

export const UpdateBOQSectionSchema = z.object({
  name: z.string().min(1).optional(),
  sortOrder: z.number().int().optional(),
});

export type UpdateBOQSectionInput = z.infer<typeof UpdateBOQSectionSchema>;

// ============================================
// Import Schemas
// ============================================

export const FieldConfidencesSchema = z.object({
  description: z.number().min(0).max(1),
  unit: z.number().min(0).max(1),
  quantity: z.number().min(0).max(1),
  rate: z.number().min(0).max(1),
});

export type FieldConfidences = z.infer<typeof FieldConfidencesSchema>;

export const ParsedBOQItemSchema = z.object({
  code: z.string().optional(),
  boqCategoryItemId: z.string().optional(), // Optional - items grouped by section instead
  description: z.string(),
  unit: z.string(),
  quantity: z.number(),
  rate: z.number(),
  sectionName: z.string().optional(),
  stageId: z.string().optional(),
  isReviewFlagged: z.boolean().default(false),
  flagReason: z.string().optional(),
  // Field confidence scores for AI parsing
  fieldConfidences: FieldConfidencesSchema.optional(),
});

export type ParsedBOQItem = z.infer<typeof ParsedBOQItemSchema>;

export const ParseResultSchema = z.object({
  fileName: z.string(),
  items: z.array(ParsedBOQItemSchema),
  sections: z.array(z.string()),
  totalItems: z.number(),
  flaggedItems: z.number(),
  errors: z.array(z.string()),
  // Validation fields
  checksumMatch: z.boolean().default(true),
  documentTotal: z.number().optional(),
  calculatedTotal: z.number().default(0),
});

export type ParseResult = z.infer<typeof ParseResultSchema>;

export const ConfirmImportSchema = z.object({
  items: z.array(ParsedBOQItemSchema).min(1, 'At least one item is required'),
});

export type ConfirmImportInput = z.infer<typeof ConfirmImportSchema>;

// ============================================
// Batch Update Schemas
// ============================================

export const BatchItemUpdateSchema = z.object({
  id: z.string().min(1),
  changes: UpdateBOQItemSchema,
});

export const BatchSectionUpdateSchema = z.object({
  id: z.string().min(1),
  changes: UpdateBOQSectionSchema,
});

export const BatchBOQSchema = z.object({
  itemUpdates: z.array(BatchItemUpdateSchema).optional(),
  itemCreates: z.array(CreateBOQItemSchema).optional(),
  itemDeletes: z.array(z.string()).optional(),
  sectionUpdates: z.array(BatchSectionUpdateSchema).optional(),
  sectionCreates: z.array(CreateBOQSectionSchema).optional(),
  sectionDeletes: z.array(z.string()).optional(),
});

export type BatchBOQInput = z.infer<typeof BatchBOQSchema>;

// ============================================
// Expense Link Schemas
// ============================================

export const LinkExpenseSchema = z.object({
  expenseId: z.string().min(1, 'Expense ID is required'),
});

export type LinkExpenseInput = z.infer<typeof LinkExpenseSchema>;

export const UnlinkExpenseParamsSchema = z.object({
  projectId: z.string().min(1),
  id: z.string().min(1),
  expenseId: z.string().min(1),
});

export type UnlinkExpenseParams = z.infer<typeof UnlinkExpenseParamsSchema>;

// ============================================
// Image Schemas
// ============================================

export const BOQItemImageParamsSchema = z.object({
  projectId: z.string().min(1),
  id: z.string().min(1),
  imageId: z.string().min(1),
});

export type BOQItemImageParams = z.infer<typeof BOQItemImageParamsSchema>;
