import type { FastifyInstance } from 'fastify';
import { SendOtpSchema, VerifyOtpSchema } from './auth.schema';
import { sendOtp, verifyOtp, refreshToken, logout, getCurrentUser } from './auth.controller';

export default async function authRoutes(fastify: FastifyInstance) {
  // POST /auth/send-otp - Send OTP to phone
  fastify.post(
    '/send-otp',
    {
      schema: {
        body: SendOtpSchema,
        tags: ['Auth'],
        description: 'Send OTP to phone number for login/signup',
      },
    },
    sendOtp
  );

  // POST /auth/verify-otp - Verify OTP and get tokens
  // Response sets refresh token as httpOnly cookie
  fastify.post(
    '/verify-otp',
    {
      schema: {
        body: VerifyOtpSchema,
        tags: ['Auth'],
        description:
          'Verify OTP and receive access token. Refresh token is set as httpOnly cookie.',
      },
    },
    verifyOtp
  );

  // POST /auth/refresh - Refresh access token
  // Reads refresh token from httpOnly cookie (no body required)
  fastify.post(
    '/refresh',
    {
      schema: {
        tags: ['Auth'],
        description:
          'Refresh access token using httpOnly cookie. New refresh token is set as cookie.',
      },
    },
    refreshToken
  );

  // POST /auth/logout - Invalidate refresh token
  // Reads refresh token from httpOnly cookie (no body required)
  fastify.post(
    '/logout',
    {
      schema: {
        tags: ['Auth'],
        description: 'Logout and invalidate refresh token from httpOnly cookie.',
      },
    },
    logout
  );

  // GET /auth/me - Get current user (protected)
  fastify.get(
    '/me',
    {
      onRequest: [fastify.authenticate],
      schema: {
        tags: ['Auth'],
        description: 'Get current authenticated user info',
        security: [{ bearerAuth: [] }],
      },
    },
    getCurrentUser
  );
}
