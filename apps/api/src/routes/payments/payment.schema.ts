import { z } from 'zod';

// Enum values matching Prisma enums
const paymentTypeValues = ['IN', 'OUT'] as const;
const paymentModeValues = ['CASH', 'CHEQUE', 'ONLINE'] as const;
const partyTypeValues = ['VENDOR', 'LABOUR', 'SUBCONTRACTOR', 'CLIENT'] as const;
const sortByValues = ['paymentDate', 'amount', 'createdAt'] as const;
const sortOrderValues = ['asc', 'desc'] as const;

// ============================================
// Request Schemas
// ============================================

export const createPaymentSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  partyId: z.string().optional(),
  expenseId: z.string().optional(),
  recordedById: z.string().optional(),
  type: z.enum(paymentTypeValues, { required_error: 'Payment type is required' }),
  paymentMode: z.enum(paymentModeValues, { required_error: 'Payment mode is required' }),
  amount: z.number().positive('Amount must be positive'),
  paymentDate: z.string().datetime(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

export const updatePaymentSchema = z.object({
  partyId: z.string().nullable().optional(),
  expenseId: z.string().nullable().optional(),
  recordedById: z.string().nullable().optional(),
  type: z.enum(paymentTypeValues).optional(),
  paymentMode: z.enum(paymentModeValues).optional(),
  amount: z.number().positive().optional(),
  paymentDate: z.string().datetime().optional(),
  referenceNumber: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const paymentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  projectId: z.string().optional(),
  partyId: z.string().optional(),
  expenseId: z.string().optional(),
  type: z.enum(paymentTypeValues).optional(),
  partyType: z.enum(partyTypeValues).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(sortByValues).default('paymentDate'),
  sortOrder: z.enum(sortOrderValues).default('desc'),
});

export const paymentParamsSchema = z.object({
  id: z.string().min(1),
});

export const projectPaymentParamsSchema = z.object({
  projectId: z.string().min(1),
});

export const partyOutstandingParamsSchema = z.object({
  projectId: z.string().min(1),
  partyId: z.string().min(1),
});

export const summaryQuerySchema = z.object({
  projectId: z.string().optional(),
  type: z.enum(paymentTypeValues).optional(),
});

export const projectPaymentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  partyId: z.string().optional(),
  partyType: z.enum(partyTypeValues).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(sortByValues).default('paymentDate'),
  sortOrder: z.enum(sortOrderValues).default('desc'),
});

// ============================================
// Type Exports
// ============================================

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type PaymentQuery = z.infer<typeof paymentQuerySchema>;
export type PaymentParams = z.infer<typeof paymentParamsSchema>;
export type ProjectPaymentParams = z.infer<typeof projectPaymentParamsSchema>;
export type PartyOutstandingParams = z.infer<typeof partyOutstandingParamsSchema>;
export type SummaryQuery = z.infer<typeof summaryQuerySchema>;
export type ProjectPaymentQuery = z.infer<typeof projectPaymentQuerySchema>;