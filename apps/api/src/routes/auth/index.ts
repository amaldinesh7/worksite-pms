import type { FastifyInstance } from 'fastify';
import { SendOtpSchema, VerifyOtpSchema, RefreshTokenSchema } from './auth.schema';
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
  fastify.post(
    '/verify-otp',
    {
      schema: {
        body: VerifyOtpSchema,
        tags: ['Auth'],
        description: 'Verify OTP and receive JWT tokens',
      },
    },
    verifyOtp
  );

  // POST /auth/refresh - Refresh access token
  fastify.post(
    '/refresh',
    {
      schema: {
        body: RefreshTokenSchema,
        tags: ['Auth'],
        description: 'Refresh access token using refresh token',
      },
    },
    refreshToken
  );

  // POST /auth/logout - Invalidate refresh token
  fastify.post(
    '/logout',
    {
      schema: {
        body: RefreshTokenSchema,
        tags: ['Auth'],
        description: 'Logout and invalidate refresh token',
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
