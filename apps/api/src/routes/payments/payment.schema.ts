import { z } from 'zod';

// ============================================
// Request Schemas
// ============================================

export const createPaymentSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  partyId: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  paymentDate: z.string().datetime(),
  notes: z.string().optional(),
});

export const updatePaymentSchema = z.object({
  partyId: z.string().nullable().optional(),
  amount: z.number().positive().optional(),
  paymentDate: z.string().datetime().optional(),
  notes: z.string().nullable().optional(),
});

export const paymentQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  projectId: z.string().optional(),
  partyId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const paymentParamsSchema = z.object({
  id: z.string().min(1),
});

export const summaryQuerySchema = z.object({
  projectId: z.string().optional(),
});

// ============================================
// Type Exports
// ============================================

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type PaymentQuery = z.infer<typeof paymentQuerySchema>;
export type PaymentParams = z.infer<typeof paymentParamsSchema>;
export type SummaryQuery = z.infer<typeof summaryQuerySchema>;
