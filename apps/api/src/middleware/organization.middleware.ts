import type { FastifyRequest, FastifyReply } from 'fastify';
import type { OrganizationRole } from '@prisma/client';
import {
  hasPermission,
  requiresProjectAccess,
  getPermissionScope,
  PERMISSION_ERRORS,
  type Resource,
  type Action,
} from '../lib/permissions';
import { prisma } from '../lib/prisma';

// ============================================
// Type Extensions
// ============================================

// Extend FastifyRequest to include organization context
declare module 'fastify' {
  interface FastifyRequest {
    organizationId: string;
    userId: string;
    userRole: OrganizationRole;
    memberId?: string;
    accessibleProjectIds?: string[];
  }
}

// ============================================
// Organization Context Middleware
// ============================================

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
  request.userRole = (userRole as OrganizationRole) || 'CLIENT';

  // For roles that require project-level access, fetch accessible projects
  if (requiresProjectAccess(request.userRole)) {
    const member = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId,
          userId,
        },
      },
      include: {
        projectAccess: {
          select: { projectId: true },
        },
      },
    });

    if (member) {
      request.memberId = member.id;
      request.accessibleProjectIds = member.projectAccess.map((pa) => pa.projectId);
    }
  }
}

// ============================================
// Role-Based Access Control
// ============================================

/**
 * Require specific roles to access a route
 */
export function requireRole(...allowedRoles: OrganizationRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!allowedRoles.includes(request.userRole)) {
      return reply.code(403).send({
        success: false,
        error: {
          message: PERMISSION_ERRORS.FORBIDDEN,
          code: 'FORBIDDEN',
        },
      });
    }
  };
}

// ============================================
// Permission-Based Access Control
// ============================================

/**
 * Check if user has permission for a resource and action
 */
export function requirePermission(resource: Resource, action: Action) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const allowed = hasPermission(request.userRole, resource, action);

    if (!allowed) {
      return reply.code(403).send({
        success: false,
        error: {
          message: PERMISSION_ERRORS.ACTION_NOT_ALLOWED,
          code: 'FORBIDDEN',
        },
      });
    }
  };
}

/**
 * Check project access for scoped roles (SUPERVISOR, CLIENT)
 * Use this on routes that access project-specific data
 */
export function requireProjectAccess(projectIdParam: string = 'projectId') {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Admin and Manager have access to all projects
    if (request.userRole === 'ADMIN' || request.userRole === 'MANAGER') {
      return;
    }

    // Accountant has read access to all projects
    if (request.userRole === 'ACCOUNTANT') {
      return;
    }

    // Get project ID from params, query, or body
    const params = request.params as Record<string, string>;
    const query = request.query as Record<string, string>;
    const body = request.body as Record<string, string> | null;

    const projectId = params[projectIdParam] || query[projectIdParam] || body?.[projectIdParam];

    if (!projectId) {
      return reply.code(400).send({
        success: false,
        error: {
          message: 'Project ID is required',
          code: 'BAD_REQUEST',
        },
      });
    }

    // Check if user has access to this project
    if (!request.accessibleProjectIds?.includes(projectId)) {
      return reply.code(403).send({
        success: false,
        error: {
          message: PERMISSION_ERRORS.NO_PROJECT_ACCESS,
          code: 'FORBIDDEN',
        },
      });
    }
  };
}

// ============================================
// Combined Permission + Project Access Check
// ============================================

/**
 * Check both permission and project access in one middleware
 */
export function requireResourceAccess(
  resource: Resource,
  action: Action,
  projectIdParam: string = 'projectId'
) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // First check permission
    const allowed = hasPermission(request.userRole, resource, action);
    if (!allowed) {
      return reply.code(403).send({
        success: false,
        error: {
          message: PERMISSION_ERRORS.ACTION_NOT_ALLOWED,
          code: 'FORBIDDEN',
        },
      });
    }

    // Get permission scope
    const scope = getPermissionScope(request.userRole, resource);

    // If scope is 'all', no further checks needed
    if (scope === 'all') {
      return;
    }

    // For 'assigned' or 'own' scope, check project access
    if (scope === 'assigned' || scope === 'own') {
      const params = request.params as Record<string, string>;
      const query = request.query as Record<string, string>;
      const body = request.body as Record<string, string> | null;

      const projectId = params[projectIdParam] || query[projectIdParam] || body?.[projectIdParam];

      // If no project ID in request, let the route handler deal with filtering
      if (projectId && !request.accessibleProjectIds?.includes(projectId)) {
        return reply.code(403).send({
          success: false,
          error: {
            message: PERMISSION_ERRORS.NO_PROJECT_ACCESS,
            code: 'FORBIDDEN',
          },
        });
      }
    }
  };
}

// ============================================
// Helper: Filter data by accessible projects
// ============================================

/**
 * Get a where clause filter for project-scoped queries
 * Returns undefined for roles with 'all' scope, or project IDs for scoped roles
 */
export function getProjectFilter(request: FastifyRequest): { projectId: { in: string[] } } | undefined {
  if (request.userRole === 'ADMIN' || request.userRole === 'MANAGER' || request.userRole === 'ACCOUNTANT') {
    return undefined; // No filter needed
  }

  if (request.accessibleProjectIds && request.accessibleProjectIds.length > 0) {
    return { projectId: { in: request.accessibleProjectIds } };
  }

  // No accessible projects - return impossible filter
  return { projectId: { in: [] } };
}
