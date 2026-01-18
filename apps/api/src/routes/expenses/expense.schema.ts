import { z } from 'zod';

// Payment mode enum values
const paymentModeValues = ['CASH', 'CHEQUE', 'ONLINE'] as const;

// Expense status enum values
const expenseStatusValues = ['PENDING', 'APPROVED'] as const;

// ============================================
// Request Schemas
// ============================================

export const createExpenseSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  partyId: z.string().min(1, 'Party is required'),
  stageId: z.string().optional(),
  expenseTypeItemId: z.string().min(1, 'Expense type is required'),
  materialTypeItemId: z.string().optional(),
  labourTypeItemId: z.string().optional(),
  subWorkTypeItemId: z.string().optional(),
  description: z.string().optional(),
  rate: z.number().positive('Rate must be positive'),
  quantity: z.number().positive('Quantity must be positive'),
  expenseDate: z.string().datetime(),
  status: z.enum(expenseStatusValues).optional(),
  notes: z.string().optional(),
  // Optional payment fields - if provided, creates a linked payment
  paidAmount: z.number().nonnegative('Paid amount must be zero or positive').optional(),
  paymentMode: z.enum(paymentModeValues).optional(),
});

export const updateExpenseSchema = z.object({
  partyId: z.string().min(1).optional(),
  stageId: z.string().nullable().optional(),
  expenseTypeItemId: z.string().min(1).optional(),
  materialTypeItemId: z.string().nullable().optional(),
  labourTypeItemId: z.string().nullable().optional(),
  subWorkTypeItemId: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  rate: z.number().positive().optional(),
  quantity: z.number().positive().optional(),
  expenseDate: z.string().datetime().optional(),
  status: z.enum(expenseStatusValues).optional(),
  notes: z.string().nullable().optional(),
});

export const expenseQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  projectId: z.string().optional(),
  partyId: z.string().optional(),
  stageId: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(expenseStatusValues).optional(),
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
