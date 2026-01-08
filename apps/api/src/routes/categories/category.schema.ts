import { z } from 'zod';

// ============================================
// Category Type Schemas
// ============================================

export const createCategoryTypeSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  label: z.string().min(1, 'Label is required'),
});

export const updateCategoryTypeSchema = z.object({
  label: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const categoryTypeParamsSchema = z.object({
  id: z.string().min(1),
});

export const categoryTypeKeyParamsSchema = z.object({
  key: z.string().min(1),
});

// ============================================
// Category Item Schemas
// ============================================

export const createCategoryItemSchema = z.object({
  categoryTypeId: z.string().min(1, 'Category type is required'),
  name: z.string().min(1, 'Name is required'),
});

export const updateCategoryItemSchema = z.object({
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const categoryItemParamsSchema = z.object({
  id: z.string().min(1),
});

export const categoryItemTypeKeyParamsSchema = z.object({
  typeKey: z.string().min(1),
});

// ============================================
// Query Schemas
// ============================================

export const categoryQuerySchema = z.object({
  includeInactive: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
});

// ============================================
// Type Exports
// ============================================

export type CreateCategoryTypeInput = z.infer<typeof createCategoryTypeSchema>;
export type UpdateCategoryTypeInput = z.infer<typeof updateCategoryTypeSchema>;
export type CategoryTypeParams = z.infer<typeof categoryTypeParamsSchema>;
export type CategoryTypeKeyParams = z.infer<typeof categoryTypeKeyParamsSchema>;

export type CreateCategoryItemInput = z.infer<typeof createCategoryItemSchema>;
export type UpdateCategoryItemInput = z.infer<typeof updateCategoryItemSchema>;
export type CategoryItemParams = z.infer<typeof categoryItemParamsSchema>;
export type CategoryItemTypeKeyParams = z.infer<typeof categoryItemTypeKeyParamsSchema>;

export type CategoryQuery = z.infer<typeof categoryQuerySchema>;
