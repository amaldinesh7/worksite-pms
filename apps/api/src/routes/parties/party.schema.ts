import { z } from 'zod';

// ============================================
// Request Schemas
// ============================================

// PartyType enum matches the Prisma schema
export const partyTypeEnum = z.enum(['VENDOR', 'LABOUR', 'SUBCONTRACTOR', 'CLIENT']);

export const createPartySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  type: partyTypeEnum,
  profilePicture: z.string().optional(),
});

export const updatePartySchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  type: partyTypeEnum.optional(),
  profilePicture: z.string().optional(),
});

export const partyQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  type: partyTypeEnum.optional(),
  hasCredit: z.coerce.boolean().optional(),
});

export const partyParamsSchema = z.object({
  id: z.string().min(1),
});

// ============================================
// Party Projects & Transactions Schemas
// ============================================

export const partyProjectsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export const partyTransactionsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  projectId: z.string().optional(),
  type: z.enum(['payments', 'expenses']).default('payments'),
});

// ============================================
// Type Exports
// ============================================

export type CreatePartyInput = z.infer<typeof createPartySchema>;
export type UpdatePartyInput = z.infer<typeof updatePartySchema>;
export type PartyQuery = z.infer<typeof partyQuerySchema>;
export type PartyParams = z.infer<typeof partyParamsSchema>;
export type PartyProjectsQuery = z.infer<typeof partyProjectsQuerySchema>;
export type PartyTransactionsQuery = z.infer<typeof partyTransactionsQuerySchema>;
