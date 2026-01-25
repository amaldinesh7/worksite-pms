import { z } from 'zod';

// ============================================
// Request Schemas
// ============================================

export const SendOtpSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .max(20)
    .regex(/^\+?[0-9\s-]+$/, 'Invalid phone number format'),
  countryCode: z.string().default('+91'),
});

export const VerifyOtpSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .max(20)
    .regex(/^\+?[0-9\s-]+$/, 'Invalid phone number format'),
  countryCode: z.string().default('+91'),
  code: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^[0-9]+$/, 'OTP must contain only numbers'),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const OnboardingSchema = z.object({
  userName: z.string().min(1, 'Name is required').max(100),
  organizationName: z.string().min(1, 'Organization name is required').max(200),
  organizationType: z.enum(['CONSTRUCTION', 'INTERIOR', 'CONTRACTOR', 'OTHER']).default('CONSTRUCTION'),
});

// ============================================
// Type Exports
// ============================================

export type SendOtpInput = z.infer<typeof SendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
export type OnboardingInput = z.infer<typeof OnboardingSchema>;