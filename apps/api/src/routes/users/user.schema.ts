import { z } from 'zod';

// ============================================
// Request Schemas
// ============================================

export const CreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  phone: z
    .string()
    .min(1, 'Phone is required')
    .max(20)
    .regex(/^\+?[0-9\s-]+$/, 'Invalid phone number format'),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  phone: z
    .string()
    .max(20)
    .regex(/^\+?[0-9\s-]+$/, 'Invalid phone number format')
    .optional(),
});

// ============================================
// Params Schemas
// ============================================

export const UserIdParams = z.object({
  id: z.string().min(1),
});

// ============================================
// Query Schemas
// ============================================

export const UserListQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
});

export const UserByPhoneQuery = z.object({
  phone: z.string().min(1),
});

// ============================================
// Type Exports
// ============================================

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type UserIdParamsType = z.infer<typeof UserIdParams>;
export type UserListQueryType = z.infer<typeof UserListQuery>;
export type UserByPhoneQueryType = z.infer<typeof UserByPhoneQuery>;
