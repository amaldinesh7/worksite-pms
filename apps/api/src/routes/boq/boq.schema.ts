/**
 * BOQ Route Schemas
 *
 * Zod schemas for BOQ API request validation.
 */

import { z } from 'zod';

// ============================================
// Enums
// ============================================

export const BOQCategoryEnum = z.enum(['MATERIAL', 'LABOUR', 'SUB_WORK', 'EQUIPMENT', 'OTHER']);
export type BOQCategoryType = z.infer<typeof BOQCategoryEnum>;

// ============================================
// Query Schemas
// ============================================

export const BOQListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  category: BOQCategoryEnum.optional(),
  stageId: z.string().optional(),
  sectionId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['description', 'category', 'amount', 'createdAt']).default('createdAt'),
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
  code: z.string().optional(),
  category: BOQCategoryEnum,
  description: z.string().min(1, 'Description is required'),
  unit: z.string().min(1, 'Unit is required'),
  quantity: z.number().positive('Quantity must be positive'),
  rate: z.number().nonnegative('Rate must be non-negative'),
  notes: z.string().optional(),
});

export type CreateBOQItemInput = z.infer<typeof CreateBOQItemSchema>;

export const UpdateBOQItemSchema = z.object({
  sectionId: z.string().nullable().optional(),
  stageId: z.string().nullable().optional(),
  code: z.string().nullable().optional(),
  category: BOQCategoryEnum.optional(),
  description: z.string().min(1).optional(),
  unit: z.string().min(1).optional(),
  quantity: z.number().positive().optional(),
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

export const ParsedBOQItemSchema = z.object({
  code: z.string().optional(),
  category: BOQCategoryEnum,
  description: z.string(),
  unit: z.string(),
  quantity: z.number(),
  rate: z.number(),
  sectionName: z.string().optional(),
  stageId: z.string().optional(),
  isReviewFlagged: z.boolean().default(false),
  flagReason: z.string().optional(),
});

export type ParsedBOQItem = z.infer<typeof ParsedBOQItemSchema>;

export const ConfirmImportSchema = z.object({
  items: z.array(ParsedBOQItemSchema).min(1, 'At least one item is required'),
});

export type ConfirmImportInput = z.infer<typeof ConfirmImportSchema>;

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
