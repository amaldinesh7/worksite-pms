// Auth Middleware - JWT verification for protected routes

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { jwtService } from '../services/jwt.service';

// Extend FastifyRequest to include user
declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string;
      phone: string;
    };
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

/**
 * Register auth middleware and JWT plugin
 */
export async function registerAuthMiddleware(fastify: FastifyInstance) {
  // Register @fastify/jwt
  await fastify.register(import('@fastify/jwt'), {
    secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
    sign: {
      algorithm: 'HS256',
    },
  });

  // Initialize JWT service with fastify instance
  jwtService.setFastify(fastify);

  // Decorate fastify with authenticate method
  fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      // Get token from Authorization header
      const authHeader = request.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({
          success: false,
          error: {
            message: 'Missing or invalid authorization header',
            code: 'UNAUTHORIZED',
          },
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer '

      // Verify and decode token
      const payload = await fastify.jwt.verify(token);

      // Attach user to request
      request.user = payload as { userId: string; phone: string };
    } catch (err) {
      return reply.code(401).send({
        success: false,
        error: {
          message: 'Invalid or expired token',
          code: 'UNAUTHORIZED',
        },
      });
    }
  });
}
