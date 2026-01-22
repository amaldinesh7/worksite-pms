import type { FastifyReply, FastifyRequest } from 'fastify';
import { roleRepository } from '../../repositories/role.repository';
import { createErrorHandler } from '../../lib/error-handler';
import { sendSuccess, sendNotFound, sendNoContent, sendPaginated, buildPagination, sendError } from '../../lib/response.utils';
import type { CreateRoleInput, UpdateRoleInput, RoleParams, RoleQuery } from './role.schema';

const handle = createErrorHandler('role');

// ============================================
// List Roles
// ============================================
export const listRoles = handle(
  'fetch',
  async (request: FastifyRequest<{ Querystring: RoleQuery }>, reply: FastifyReply) => {
    const { page, limit, search } = request.query;
    const skip = (page - 1) * limit;

    const { roles, total } = await roleRepository.findAll(request.organizationId, {
      skip,
      take: limit,
      search,
    });

    // Transform roles to include permission keys for easier frontend usage
    const transformedRoles = roles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
      isSystemRole: role.isSystemRole,
      memberCount: role._count?.members ?? 0,
      permissions: role.permissions.map((rp) => rp.permission),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }));

    const pagination = buildPagination(page, limit, total);
    return sendPaginated(reply, transformedRoles, pagination);
  }
);

// ============================================
// Get Role by ID
// ============================================
export const getRole = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: RoleParams }>, reply: FastifyReply) => {
    const role = await roleRepository.findById(request.params.id);

    if (!role) {
      return sendNotFound(reply, 'Role');
    }

    // Check if role belongs to the organization
    if (role.organizationId !== request.organizationId) {
      return sendNotFound(reply, 'Role');
    }

    const transformedRole = {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystemRole: role.isSystemRole,
      memberCount: role._count?.members ?? 0,
      permissions: role.permissions.map((rp) => rp.permission),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };

    return sendSuccess(reply, transformedRole);
  }
);

// ============================================
// Create Role
// ============================================
export const createRole = handle(
  'create',
  async (request: FastifyRequest<{ Body: CreateRoleInput }>, reply: FastifyReply) => {
    const role = await roleRepository.create({
      organizationId: request.organizationId,
      name: request.body.name,
      description: request.body.description,
      permissionIds: request.body.permissionIds,
    });

    const transformedRole = {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystemRole: role.isSystemRole,
      memberCount: role._count?.members ?? 0,
      permissions: role.permissions.map((rp) => rp.permission),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };

    return sendSuccess(reply, transformedRole, 201);
  }
);

// ============================================
// Update Role
// ============================================
export const updateRole = handle(
  'update',
  async (
    request: FastifyRequest<{ Params: RoleParams; Body: UpdateRoleInput }>,
    reply: FastifyReply
  ) => {
    // Check if role exists and belongs to organization
    const existingRole = await roleRepository.findById(request.params.id);

    if (!existingRole) {
      return sendNotFound(reply, 'Role');
    }

    if (existingRole.organizationId !== request.organizationId) {
      return sendNotFound(reply, 'Role');
    }

    // System roles can only have permissions updated, not name
    if (existingRole.isSystemRole && request.body.name && request.body.name !== existingRole.name) {
      return sendError(reply, 400, 'Cannot rename system role', 'SYSTEM_ROLE_RENAME');
    }

    const role = await roleRepository.update(request.params.id, {
      name: request.body.name,
      description: request.body.description ?? undefined,
      permissionIds: request.body.permissionIds,
    });

    const transformedRole = {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystemRole: role.isSystemRole,
      memberCount: role._count?.members ?? 0,
      permissions: role.permissions.map((rp) => rp.permission),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };

    return sendSuccess(reply, transformedRole);
  }
);

// ============================================
// Delete Role
// ============================================
export const deleteRole = handle(
  'delete',
  async (request: FastifyRequest<{ Params: RoleParams }>, reply: FastifyReply) => {
    // Check if role exists and belongs to organization
    const existingRole = await roleRepository.findById(request.params.id);

    if (!existingRole) {
      return sendNotFound(reply, 'Role');
    }

    if (existingRole.organizationId !== request.organizationId) {
      return sendNotFound(reply, 'Role');
    }

    await roleRepository.delete(request.params.id);
    return sendNoContent(reply);
  }
);
