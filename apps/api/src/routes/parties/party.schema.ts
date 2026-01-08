import { z } from 'zod';

// ============================================
// Request Schemas
// ============================================

export const partyTypeEnum = z.enum(['VENDOR', 'LABOUR', 'SUBCONTRACTOR']);

export const createPartySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  type: partyTypeEnum,
});

export const updatePartySchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  type: partyTypeEnum.optional(),
});

export const partyQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  type: partyTypeEnum.optional(),
});

export const partyParamsSchema = z.object({
  id: z.string().min(1),
});

// ============================================
// Type Exports
// ============================================

export type CreatePartyInput = z.infer<typeof createPartySchema>;
export type UpdatePartyInput = z.infer<typeof updatePartySchema>;
export type PartyQuery = z.infer<typeof partyQuerySchema>;
export type PartyParams = z.infer<typeof partyParamsSchema>;
