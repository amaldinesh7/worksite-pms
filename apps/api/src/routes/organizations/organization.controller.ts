import type { FastifyReply, FastifyRequest } from 'fastify';
import { organizationService } from '../../services/organization.service';
import { createErrorHandler } from '../../lib/error-handler';
import {
  sendSuccess,
  sendCreated,
  sendNotFound,
  sendNoContent,
  sendPaginated,
  buildPagination,
} from '../../lib/response.utils';
import type {
  CreateOrganizationInput,
  UpdateOrganizationInput,
  AddMemberInput,
  UpdateMemberRoleInput,
  OrganizationIdParamsType,
  MemberParamsType,
  OrganizationListQueryType,
} from './organization.schema';

const withError = createErrorHandler('organization');

// ============================================
// Organization CRUD
// ============================================

export const listOrganizations = withError(
  'fetch',
  async (
    request: FastifyRequest<{ Querystring: OrganizationListQueryType }>,
    reply: FastifyReply
  ) => {
    const { page, limit, search } = request.query;
    const skip = (page - 1) * limit;

    const { organizations, total } = await organizationService.findAll({
      skip,
      take: limit,
      search,
    });

    return sendPaginated(reply, organizations, buildPagination(page, limit, total));
  }
);

export const getOrganization = withError(
  'fetch',
  async (request: FastifyRequest<{ Params: OrganizationIdParamsType }>, reply: FastifyReply) => {
    const { id } = request.params;
    const organization = await organizationService.findById(id);

    if (!organization) {
      return sendNotFound(reply, 'Organization not found');
    }

    return sendSuccess(reply, organization);
  }
);

export const createOrganization = withError(
  'create',
  async (request: FastifyRequest<{ Body: CreateOrganizationInput }>, reply: FastifyReply) => {
    const organization = await organizationService.create(request.body);
    return sendCreated(reply, organization);
  }
);

export const updateOrganization = withError(
  'update',
  async (
    request: FastifyRequest<{
      Params: OrganizationIdParamsType;
      Body: UpdateOrganizationInput;
    }>,
    reply: FastifyReply
  ) => {
    const { id } = request.params;
    const organization = await organizationService.update(id, request.body);
    return sendSuccess(reply, organization);
  }
);

export const deleteOrganization = withError(
  'delete',
  async (request: FastifyRequest<{ Params: OrganizationIdParamsType }>, reply: FastifyReply) => {
    const { id } = request.params;
    await organizationService.delete(id);
    return sendNoContent(reply);
  }
);

// ============================================
// Member Management
// ============================================

export const listMembers = withError(
  'fetch members for',
  async (request: FastifyRequest<{ Params: OrganizationIdParamsType }>, reply: FastifyReply) => {
    const { id } = request.params;
    const members = await organizationService.getMembers(id);
    return sendSuccess(reply, members);
  }
);

export const addMember = withError(
  'add member to',
  async (
    request: FastifyRequest<{
      Params: OrganizationIdParamsType;
      Body: AddMemberInput;
    }>,
    reply: FastifyReply
  ) => {
    const { id } = request.params;
    const member = await organizationService.addMember(id, request.body);
    return sendCreated(reply, member);
  }
);

export const updateMemberRole = withError(
  'update member role in',
  async (
    request: FastifyRequest<{
      Params: MemberParamsType;
      Body: UpdateMemberRoleInput;
    }>,
    reply: FastifyReply
  ) => {
    const { id, userId } = request.params;
    const member = await organizationService.updateMemberRole(id, userId, request.body);
    return sendSuccess(reply, member);
  }
);

export const removeMember = withError(
  'remove member from',
  async (request: FastifyRequest<{ Params: MemberParamsType }>, reply: FastifyReply) => {
    const { id, userId } = request.params;
    await organizationService.removeMember(id, userId);
    return sendNoContent(reply);
  }
);
