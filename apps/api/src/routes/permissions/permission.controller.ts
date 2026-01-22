import type { FastifyReply, FastifyRequest } from 'fastify';
import { permissionRepository } from '../../repositories/permission.repository';
import { createErrorHandler } from '../../lib/error-handler';
import { sendSuccess } from '../../lib/response.utils';

const handle = createErrorHandler('permission');

// ============================================
// List All Permissions (global)
// ============================================
export const listPermissions = handle(
  'fetch',
  async (_request: FastifyRequest, reply: FastifyReply) => {
    const permissions = await permissionRepository.findAll();
    return sendSuccess(reply, permissions);
  }
);

// ============================================
// List Permissions Grouped by Category
// ============================================
export const listPermissionsGrouped = handle(
  'fetch',
  async (_request: FastifyRequest, reply: FastifyReply) => {
    const grouped = await permissionRepository.findAllGroupedByCategory();
    return sendSuccess(reply, grouped);
  }
);
