import type { FastifyReply, FastifyRequest } from 'fastify';
import { otpService } from '../../services/otp.service';
import { jwtService } from '../../services/jwt.service';
import { authRepository } from '../../repositories/auth.repository';
import { createErrorHandler } from '../../lib/error-handler';
import { sendSuccess, sendCreated } from '../../lib/response.utils';
import type { SendOtpInput, VerifyOtpInput } from './auth.schema';

const withError = createErrorHandler('auth');

// ============================================
// Cookie Configuration
// ============================================

/**
 * SECURITY: Refresh token cookie configuration
 *
 * - httpOnly: Prevents JavaScript access (XSS protection)
 * - secure: Only sent over HTTPS (in production)
 * - sameSite: 'strict' prevents CSRF by not sending cookie on cross-site requests
 * - path: '/api/auth' limits cookie to auth endpoints only
 * - maxAge: 7 days in milliseconds
 */
const REFRESH_TOKEN_COOKIE_NAME = 'refresh_token';
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getRefreshTokenCookieOptions(isProduction: boolean) {
  return {
    httpOnly: true,
    secure: isProduction, // Only HTTPS in production
    sameSite: 'strict' as const,
    path: '/api/auth', // Only sent to auth routes
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
  };
}

/**
 * Set refresh token as httpOnly cookie
 */
function setRefreshTokenCookie(reply: FastifyReply, refreshToken: string) {
  const isProduction = process.env.NODE_ENV === 'production';
  reply.setCookie(
    REFRESH_TOKEN_COOKIE_NAME,
    refreshToken,
    getRefreshTokenCookieOptions(isProduction)
  );
}

/**
 * Clear refresh token cookie
 */
function clearRefreshTokenCookie(reply: FastifyReply) {
  const isProduction = process.env.NODE_ENV === 'production';
  reply.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict' as const,
    path: '/api/auth',
  });
}

/**
 * Get refresh token from cookie
 */
function getRefreshTokenFromCookie(request: FastifyRequest): string | undefined {
  return request.cookies[REFRESH_TOKEN_COOKIE_NAME];
}

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
 *
 * SECURITY: Refresh token is set as httpOnly cookie, not returned in response body.
 * Only the access token is returned to the client for use in Authorization headers.
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

    // Set refresh token as httpOnly cookie (not accessible via JavaScript)
    setRefreshTokenCookie(reply, tokens.refreshToken);

    // Return only access token in response body
    return sendCreated(reply, {
      message: isNewUser ? 'Account created successfully' : 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
      },
      tokens: {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
      },
      isNewUser,
    });
  }
);

/**
 * POST /auth/refresh
 * Refresh access token using refresh token from httpOnly cookie
 *
 * SECURITY: Refresh token is read from httpOnly cookie, not request body.
 * New refresh token is set as httpOnly cookie (token rotation).
 */
export const refreshToken = withError(
  'refresh token',
  async (request: FastifyRequest, reply: FastifyReply) => {
    // Read refresh token from httpOnly cookie
    const refreshTokenValue = getRefreshTokenFromCookie(request);

    if (!refreshTokenValue) {
      return reply.code(401).send({
        success: false,
        error: {
          message: 'No refresh token provided',
          code: 'UNAUTHORIZED',
        },
      });
    }

    // Refresh tokens (rotates the refresh token)
    const tokens = await jwtService.refreshAccessToken(refreshTokenValue);

    // Set new refresh token as httpOnly cookie
    setRefreshTokenCookie(reply, tokens.refreshToken);

    // Return only access token in response body
    return sendSuccess(reply, {
      accessToken: tokens.accessToken,
      expiresIn: tokens.expiresIn,
    });
  }
);

/**
 * POST /auth/logout
 * Invalidate refresh token and clear cookie
 *
 * SECURITY: Reads refresh token from httpOnly cookie to revoke it,
 * then clears the cookie from the client.
 */
export const logout = withError('logout', async (request: FastifyRequest, reply: FastifyReply) => {
  // Read refresh token from httpOnly cookie
  const refreshTokenValue = getRefreshTokenFromCookie(request);

  // Revoke the token if it exists
  if (refreshTokenValue) {
    await jwtService.revokeRefreshToken(refreshTokenValue);
  }

  // Clear the refresh token cookie
  clearRefreshTokenCookie(reply);

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

    return sendSuccess(reply, {
      id: user.id,
      name: user.name,
      phone: user.phone,
      createdAt: user.createdAt,
    });
  }
);
