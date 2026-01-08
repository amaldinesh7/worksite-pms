import { z } from 'zod';

// ============================================
// Request Schemas
// ============================================

export const createExpenseSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  partyId: z.string().min(1, 'Party is required'),
  stageId: z.string().optional(),
  expenseCategoryItemId: z.string().min(1, 'Expense category is required'),
  materialTypeItemId: z.string().optional(),
  labourTypeItemId: z.string().optional(),
  subWorkTypeItemId: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  expenseDate: z.string().datetime(),
  paymentMode: z.string().min(1, 'Payment mode is required'),
  notes: z.string().optional(),
});

export const updateExpenseSchema = z.object({
  partyId: z.string().min(1).optional(),
  stageId: z.string().nullable().optional(),
  expenseCategoryItemId: z.string().min(1).optional(),
  materialTypeItemId: z.string().nullable().optional(),
  labourTypeItemId: z.string().nullable().optional(),
  subWorkTypeItemId: z.string().nullable().optional(),
  amount: z.number().positive().optional(),
  expenseDate: z.string().datetime().optional(),
  paymentMode: z.string().min(1).optional(),
  notes: z.string().nullable().optional(),
});

export const expenseQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  projectId: z.string().optional(),
  partyId: z.string().optional(),
  stageId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const expenseParamsSchema = z.object({
  id: z.string().min(1),
});

export const summaryQuerySchema = z.object({
  projectId: z.string().optional(),
});

// ============================================
// Type Exports
// ============================================

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseQuery = z.infer<typeof expenseQuerySchema>;
export type ExpenseParams = z.infer<typeof expenseParamsSchema>;
export type SummaryQuery = z.infer<typeof summaryQuerySchema>;
