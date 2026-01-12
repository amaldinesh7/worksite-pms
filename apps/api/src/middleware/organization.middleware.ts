import type { FastifyRequest, FastifyReply } from 'fastify';

// Extend FastifyRequest to include organization context
declare module 'fastify' {
  interface FastifyRequest {
    organizationId: string;
    userId: string;
    userRole: 'ADMIN' | 'MANAGER' | 'ACCOUNTANT';
  }
}

export async function organizationMiddleware(request: FastifyRequest, reply: FastifyReply) {
  // TODO: Extract from JWT token in production
  // For now, expect it in headers
  const organizationId = request.headers['x-organization-id'] as string;
  const userId = request.headers['x-user-id'] as string;
  const userRole = request.headers['x-user-role'] as string;

  // 403 Forbidden (not 401) - user IS authenticated but missing org context
  if (!organizationId || !userId) {
    return reply.code(403).send({
      success: false,
      error: {
        message: 'Organization context required. Please join or create an organization.',
        code: 'MISSING_ORG_CONTEXT',
      },
    });
  }

  request.organizationId = organizationId;
  request.userId = userId;
  request.userRole = (userRole as 'ADMIN' | 'MANAGER' | 'ACCOUNTANT') || 'ACCOUNTANT';
}

// Role-based access control helper
export function requireRole(...allowedRoles: Array<'ADMIN' | 'MANAGER' | 'ACCOUNTANT'>) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!allowedRoles.includes(request.userRole)) {
      return reply.code(403).send({
        success: false,
        error: {
          message: 'Insufficient permissions',
          code: 'FORBIDDEN',
        },
      });
    }
  };
}
