import type { FastifyReply, FastifyRequest } from 'fastify';
import { otpService } from '../../services/otp.service';
import { jwtService } from '../../services/jwt.service';
import { authRepository } from '../../repositories/auth.repository';
import { organizationRepository } from '../../repositories/organization.repository';
import { createErrorHandler } from '../../lib/error-handler';
import { sendSuccess, sendCreated } from '../../lib/response.utils';
import type { SendOtpInput, VerifyOtpInput, OnboardingInput } from './auth.schema';

const withError = createErrorHandler('auth');

/**
 * Normalize phone number to E.164 format
 */
function normalizePhone(phone: string, countryCode: string): string {
  // Remove all non-digit characters except leading +
  const cleaned = phone.replace(/[^\d]/g, '');
  const code = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
  return `${code}${cleaned}`;
}

// ============================================
// Auth Controllers
// ============================================

/**
 * POST /auth/send-otp
 * Send OTP to phone number
 */
export const sendOtp = withError(
  'send OTP',
  async (request: FastifyRequest<{ Body: SendOtpInput }>, reply: FastifyReply) => {
    const { phone, countryCode } = request.body;
    const normalizedPhone = normalizePhone(phone, countryCode);

    const result = await otpService.sendOtp(normalizedPhone);

    return sendSuccess(reply, {
      message: 'OTP sent successfully',
      phone: normalizedPhone,
      expiresAt: result.expiresAt,
      // In dev mode, provide hint about bypass code
      ...(process.env.OTP_MODE === 'development' && {
        devHint: 'Use code 123456 for testing',
      }),
    });
  }
);

/**
 * POST /auth/verify-otp
 * Verify OTP and return JWT token with user and organization info
 *
 * Returns:
 * - user: { id, name, phone }
 * - organization: { id, name } | null (if user has no org membership)
 * - role: 'ADMIN' | 'MANAGER' | 'ACCOUNTANT' | null
 * - accessToken: JWT token for API requests
 */
export const verifyOtp = withError(
  'verify OTP',
  async (request: FastifyRequest<{ Body: VerifyOtpInput }>, reply: FastifyReply) => {
    const { phone, countryCode, code } = request.body;
    const normalizedPhone = normalizePhone(phone, countryCode);

    // Verify OTP (throws if invalid)
    await otpService.verifyOtp(normalizedPhone, code);

    // Find or create user (includes organization memberships)
    const { user, isNewUser } = await authRepository.findOrCreate(normalizedPhone);

    // Generate JWT token
    const tokens = await jwtService.generateTokens(user.id, user.phone || normalizedPhone);

    // Get first organization membership (if any)
    const primaryMembership = user.memberships[0] ?? null;
    const organization = primaryMembership?.organization ?? null;
    // Get role name from the role relation
    const role = primaryMembership?.role?.name ?? null;

    // Return user, organization, and token
    return sendCreated(reply, {
      message: isNewUser ? 'Account created successfully' : 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
      },
      organization: organization
        ? {
            id: organization.id,
            name: organization.name,
          }
        : null,
      role,
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
      isNewUser,
    });
  }
);

/**
 * POST /auth/logout
 * Clear any server-side session (placeholder for future use)
 */
export const logout = withError('logout', async (_request: FastifyRequest, reply: FastifyReply) => {
  // For simple token auth, logout is handled client-side by clearing the token
  // This endpoint exists for future server-side session invalidation if needed
  return sendSuccess(reply, {
    message: 'Logged out successfully',
  });
});

/**
 * GET /auth/me
 * Get current user info (protected route)
 */
export const getCurrentUser = withError(
  'get current user',
  async (request: FastifyRequest, reply: FastifyReply) => {
    // User is attached by auth middleware (typed via @fastify/jwt module augmentation)
    const userId = request.user?.userId;

    if (!userId) {
      return reply.code(401).send({
        success: false,
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
      });
    }

    const user = await authRepository.findById(userId);

    if (!user) {
      return reply.code(404).send({
        success: false,
        error: { message: 'User not found', code: 'NOT_FOUND' },
      });
    }

    // Get primary organization membership
    const primaryMembership = user.memberships[0] ?? null;

    return sendSuccess(reply, {
      id: user.id,
      name: user.name,
      phone: user.phone,
      createdAt: user.createdAt,
      organization: primaryMembership?.organization
        ? {
            id: primaryMembership.organization.id,
            name: primaryMembership.organization.name,
          }
        : null,
      // Get role name from the role relation
      role: primaryMembership?.role?.name ?? null,
    });
  }
);

/**
 * POST /auth/onboarding
 * Complete onboarding for new users without organization
 * Creates organization and adds user as admin
 */
export const completeOnboarding = withError(
  'complete onboarding',
  async (request: FastifyRequest, reply: FastifyReply) => {
    // Body is validated by the schema in the route definition
    const body = request.body as OnboardingInput;
    const userId = request.user?.userId;

    if (!userId) {
      return reply.code(401).send({
        success: false,
        error: { message: 'Unauthorized', code: 'UNAUTHORIZED' },
      });
    }

    // Check if user already belongs to an organization
    const existingUser = await authRepository.findById(userId);
    if (existingUser && existingUser.memberships.length > 0) {
      return reply.code(409).send({
        success: false,
        error: {
          message: 'User already belongs to an organization',
          code: 'ALREADY_HAS_ORGANIZATION',
        },
      });
    }

    const { userName, organizationName } = body;

    // Update user name
    await authRepository.updateUser(userId, { name: userName });

    // Create organization with user as admin
    const organization = await organizationRepository.create({
      name: organizationName,
      ownerId: userId,
    });

    // Get updated user with membership
    const user = await authRepository.findById(userId);
    const primaryMembership = user?.memberships[0] ?? null;

    return sendCreated(reply, {
      message: 'Onboarding completed successfully',
      user: {
        id: user?.id,
        name: user?.name,
        phone: user?.phone,
      },
      organization: {
        id: organization.id,
        name: organization.name,
      },
      // Get role name from the role relation
      role: primaryMembership?.role?.name ?? null,
    });
  }
);
