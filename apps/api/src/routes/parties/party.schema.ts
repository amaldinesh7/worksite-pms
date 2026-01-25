import { z } from 'zod';

// ============================================
// Request Schemas
// ============================================

// PartyType enum matches the Prisma schema
export const partyTypeEnum = z.enum(['VENDOR', 'LABOUR', 'SUBCONTRACTOR', 'CLIENT']);

// Party types that require a phone number
const PHONE_REQUIRED_TYPES = ['VENDOR', 'LABOUR', 'SUBCONTRACTOR'] as const;

// Phone validation: at least 10 digits
const isValidPhone = (phone: string): boolean => {
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 10;
};

export const createPartySchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    phone: z.string().optional(),
    location: z.string().min(1, 'Location is required'),
    type: partyTypeEnum,
    profilePicture: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const requiresPhone = PHONE_REQUIRED_TYPES.includes(
      data.type as (typeof PHONE_REQUIRED_TYPES)[number]
    );

    if (requiresPhone) {
      if (!data.phone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Phone is required for ${data.type} party type`,
          path: ['phone'],
        });
      } else if (!isValidPhone(data.phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Phone must contain at least 10 digits',
          path: ['phone'],
        });
      }
    } else if (data.phone && !isValidPhone(data.phone)) {
      // For CLIENT type, phone is optional but must be valid if provided
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Phone must contain at least 10 digits',
        path: ['phone'],
      });
    }
  });

export const updatePartySchema = z
  .object({
    name: z.string().min(1).optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    type: partyTypeEnum.optional(),
    profilePicture: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // For updates, only validate phone format if phone is being updated
    if (data.phone !== undefined && data.phone !== null && data.phone !== '') {
      if (!isValidPhone(data.phone)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Phone must contain at least 10 digits',
          path: ['phone'],
        });
      }
    }

    // If type is being changed to one that requires phone, we can't fully validate
    // because we don't have access to the existing phone value here.
    // The controller/service should handle this case if needed.
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
