import { z } from 'zod';

// ============================================
// Request Schemas
// ============================================

export const partyTypeEnum = z.enum([
  'VENDOR',
  'LABOUR',
  'SUBCONTRACTOR',
  'CLIENT',
  'ACCOUNTANT',
  'SUPERVISOR',
  'PROJECT_MANAGER',
]);

export const createPartySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  location: z.string().min(1, 'Location is required'),
  type: partyTypeEnum,
  isInternal: z.boolean().optional().default(false),
  profilePicture: z.string().optional(),
  // Optional: Enable login during creation
  enableLogin: z.boolean().optional().default(false),
});

export const updatePartySchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  type: partyTypeEnum.optional(),
  isInternal: z.boolean().optional(),
  profilePicture: z.string().optional(),
});

export const partyQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  type: partyTypeEnum.optional(),
  isInternal: z.coerce.boolean().optional(),
  hasLogin: z.coerce.boolean().optional(),
});

export const partyParamsSchema = z.object({
  id: z.string().min(1),
});

// ============================================
// Invite/Link Schemas
// ============================================

/**
 * Invite a party to login - creates a new user account
 */
export const invitePartySchema = z
  .object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    // Optional: Assign to specific projects (for SUPERVISOR/CLIENT)
    projectIds: z.array(z.string()).optional(),
  })
  .refine((data) => data.phone || data.email, {
    message: 'Either phone or email is required for login',
  });

/**
 * Link a party to an existing user
 */
export const linkPartySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  // Optional: Assign to specific projects (for SUPERVISOR/CLIENT)
  projectIds: z.array(z.string()).optional(),
});

/**
 * Grant project access to a party
 */
export const grantProjectAccessSchema = z.object({
  projectIds: z.array(z.string()).min(1, 'At least one project ID is required'),
});

// ============================================
// Type Exports
// ============================================

export type CreatePartyInput = z.infer<typeof createPartySchema>;
export type UpdatePartyInput = z.infer<typeof updatePartySchema>;
export type PartyQuery = z.infer<typeof partyQuerySchema>;
export type PartyParams = z.infer<typeof partyParamsSchema>;
export type InvitePartyInput = z.infer<typeof invitePartySchema>;
export type LinkPartyInput = z.infer<typeof linkPartySchema>;
export type GrantProjectAccessInput = z.infer<typeof grantProjectAccessSchema>;
