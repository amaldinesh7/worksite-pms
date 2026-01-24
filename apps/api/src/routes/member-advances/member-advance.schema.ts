import { z } from 'zod';

// Enum values matching Prisma enums
const paymentModeValues = ['CASH', 'CHEQUE', 'ONLINE'] as const;
const sortByValues = ['advanceDate', 'amount', 'createdAt'] as const;
const sortOrderValues = ['asc', 'desc'] as const;

// ============================================
// Request Schemas
// ============================================

export const createMemberAdvanceSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  memberId: z.string().min(1, 'Team member is required'),
  amount: z.number().positive('Amount must be positive'),
  purpose: z.string().min(1, 'Purpose is required'),
  paymentMode: z.enum(paymentModeValues, { required_error: 'Payment mode is required' }),
  advanceDate: z.string().datetime(),
  expectedSettlementDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const updateMemberAdvanceSchema = z.object({
  amount: z.number().positive().optional(),
  purpose: z.string().min(1).optional(),
  paymentMode: z.enum(paymentModeValues).optional(),
  advanceDate: z.string().datetime().optional(),
  expectedSettlementDate: z.string().datetime().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const memberAdvanceQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  projectId: z.string().optional(),
  memberId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(sortByValues).default('advanceDate'),
  sortOrder: z.enum(sortOrderValues).default('desc'),
});

export const memberAdvanceParamsSchema = z.object({
  id: z.string().min(1),
});

export const projectMemberAdvanceParamsSchema = z.object({
  projectId: z.string().min(1),
});

export const memberSummaryParamsSchema = z.object({
  projectId: z.string().min(1),
  memberId: z.string().min(1),
});

export const memberBalancesParamsSchema = z.object({
  memberId: z.string().min(1),
});

// ============================================
// Type Exports
// ============================================

export type CreateMemberAdvanceInput = z.infer<typeof createMemberAdvanceSchema>;
export type UpdateMemberAdvanceInput = z.infer<typeof updateMemberAdvanceSchema>;
export type MemberAdvanceQuery = z.infer<typeof memberAdvanceQuerySchema>;
export type MemberAdvanceParams = z.infer<typeof memberAdvanceParamsSchema>;
export type ProjectMemberAdvanceParams = z.infer<typeof projectMemberAdvanceParamsSchema>;
export type MemberSummaryParams = z.infer<typeof memberSummaryParamsSchema>;
export type MemberBalancesParams = z.infer<typeof memberBalancesParamsSchema>;
