import type { FastifyReply, FastifyRequest } from 'fastify';
import { teamRepository } from '../../repositories/team.repository';
import { createErrorHandler } from '../../lib/error-handler';
import {
  sendSuccess,
  sendNotFound,
  sendNoContent,
  sendPaginated,
  buildPagination,
} from '../../lib/response.utils';
import type {
  CreateTeamMemberInput,
  UpdateTeamMemberInput,
  TeamMemberParams,
  TeamMemberQuery,
} from './team.schema';

const handle = createErrorHandler('team member');

// ============================================
// List Team Members
// ============================================
export const listTeamMembers = handle(
  'fetch',
  async (request: FastifyRequest<{ Querystring: TeamMemberQuery }>, reply: FastifyReply) => {
    const { page, limit, search, roleId } = request.query;
    const skip = (page - 1) * limit;

    const { members, total } = await teamRepository.findAll(request.organizationId, {
      skip,
      take: limit,
      search,
      roleId,
    });

    const pagination = buildPagination(page, limit, total);
    return sendPaginated(reply, members, pagination);
  }
);

// ============================================
// Get Team Member by ID
// ============================================
export const getTeamMember = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: TeamMemberParams }>, reply: FastifyReply) => {
    const member = await teamRepository.findById(request.organizationId, request.params.id);

    if (!member) {
      return sendNotFound(reply, 'Team member');
    }

    return sendSuccess(reply, member);
  }
);

// ============================================
// Create Team Member
// ============================================
export const createTeamMember = handle(
  'create',
  async (request: FastifyRequest<{ Body: CreateTeamMemberInput }>, reply: FastifyReply) => {
    const member = await teamRepository.create({
      organizationId: request.organizationId,
      name: request.body.name,
      phone: request.body.phone,
      email: request.body.email,
      location: request.body.location,
      roleId: request.body.roleId,
    });

    return sendSuccess(reply, member, 201);
  }
);

// ============================================
// Update Team Member
// ============================================
export const updateTeamMember = handle(
  'update',
  async (
    request: FastifyRequest<{ Params: TeamMemberParams; Body: UpdateTeamMemberInput }>,
    reply: FastifyReply
  ) => {
    // Check if member exists
    const existing = await teamRepository.findById(request.organizationId, request.params.id);
    if (!existing) {
      return sendNotFound(reply, 'Team member');
    }

    const member = await teamRepository.update(request.organizationId, request.params.id, {
      name: request.body.name,
      phone: request.body.phone ?? undefined,
      email: request.body.email ?? undefined,
      location: request.body.location ?? undefined,
      roleId: request.body.roleId,
    });

    return sendSuccess(reply, member);
  }
);

// ============================================
// Delete Team Member
// ============================================
export const deleteTeamMember = handle(
  'delete',
  async (request: FastifyRequest<{ Params: TeamMemberParams }>, reply: FastifyReply) => {
    // Check if member exists
    const existing = await teamRepository.findById(request.organizationId, request.params.id);
    if (!existing) {
      return sendNotFound(reply, 'Team member');
    }

    await teamRepository.delete(request.organizationId, request.params.id);
    return sendNoContent(reply);
  }
);
