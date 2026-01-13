import type { FastifyInstance } from 'fastify';
import { SendOtpSchema, VerifyOtpSchema } from './auth.schema';
import { sendOtp, verifyOtp, logout, getCurrentUser } from './auth.controller';

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

  // POST /auth/verify-otp - Verify OTP and get token + user info
  fastify.post(
    '/verify-otp',
    {
      schema: {
        body: VerifyOtpSchema,
        tags: ['Auth'],
        description: 'Verify OTP and receive access token with user and organization info.',
      },
    },
    verifyOtp
  );

  // POST /auth/logout - Clear session
  fastify.post(
    '/logout',
    {
      schema: {
        tags: ['Auth'],
        description: 'Logout user (client should clear stored token).',
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
        description: 'Get current authenticated user info with organization',
        security: [{ bearerAuth: [] }],
      },
    },
    getCurrentUser
  );
}
