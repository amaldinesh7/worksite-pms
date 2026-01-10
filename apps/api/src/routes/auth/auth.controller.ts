import type { FastifyReply, FastifyRequest } from 'fastify';
import { otpService } from '../../services/otp.service';
import { jwtService } from '../../services/jwt.service';
import { authRepository } from '../../repositories/auth.repository';
import { createErrorHandler } from '../../lib/error-handler';
import { sendSuccess, sendCreated } from '../../lib/response.utils';
import type { SendOtpInput, VerifyOtpInput, RefreshTokenInput } from './auth.schema';

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
 * Verify OTP and return JWT tokens
 */
export const verifyOtp = withError(
  'verify OTP',
  async (request: FastifyRequest<{ Body: VerifyOtpInput }>, reply: FastifyReply) => {
    const { phone, countryCode, code } = request.body;
    const normalizedPhone = normalizePhone(phone, countryCode);

    // Verify OTP (throws if invalid)
    await otpService.verifyOtp(normalizedPhone, code);

    // Find or create user
    const { user, isNewUser } = await authRepository.findOrCreate(normalizedPhone);

    // Generate JWT tokens
    const tokens = await jwtService.generateTokens(user.id, user.phone);

    return sendCreated(reply, {
      message: isNewUser ? 'Account created successfully' : 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      },
      isNewUser,
    });
  }
);

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
export const refreshToken = withError(
  'refresh token',
  async (request: FastifyRequest<{ Body: RefreshTokenInput }>, reply: FastifyReply) => {
    const { refreshToken } = request.body;

    const tokens = await jwtService.refreshAccessToken(refreshToken);

    return sendSuccess(reply, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
    });
  }
);

/**
 * POST /auth/logout
 * Invalidate refresh token
 */
export const logout = withError(
  'logout',
  async (request: FastifyRequest<{ Body: RefreshTokenInput }>, reply: FastifyReply) => {
    const { refreshToken } = request.body;

    await jwtService.revokeRefreshToken(refreshToken);

    return sendSuccess(reply, {
      message: 'Logged out successfully',
    });
  }
);

/**
 * GET /auth/me
 * Get current user info (protected route)
 */
export const getCurrentUser = withError(
  'get current user',
  async (request: FastifyRequest, reply: FastifyReply) => {
    // User is attached by auth middleware
    const userId = (request as any).user?.userId;

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

    return sendSuccess(reply, {
      id: user.id,
      name: user.name,
      phone: user.phone,
      createdAt: user.createdAt,
    });
  }
);
