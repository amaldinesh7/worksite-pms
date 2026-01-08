import type { FastifyReply, FastifyRequest } from 'fastify';
import { userRepository } from '../../repositories/user.repository';
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
  CreateUserInput,
  UpdateUserInput,
  UserIdParamsType,
  UserListQueryType,
  UserByPhoneQueryType,
} from './user.schema';

const withError = createErrorHandler('user');

// ============================================
// User CRUD
// ============================================

export const listUsers = withError(
  'fetch',
  async (request: FastifyRequest<{ Querystring: UserListQueryType }>, reply: FastifyReply) => {
    const { page, limit, search } = request.query;
    const skip = (page - 1) * limit;

    const { users, total } = await userRepository.findAll({
      skip,
      take: limit,
      search,
    });

    return sendPaginated(reply, users, buildPagination(page, limit, total));
  }
);

export const getUser = withError(
  'fetch',
  async (request: FastifyRequest<{ Params: UserIdParamsType }>, reply: FastifyReply) => {
    const { id } = request.params;
    const user = await userRepository.findById(id);

    if (!user) {
      return sendNotFound(reply, 'User not found');
    }

    return sendSuccess(reply, user);
  }
);

export const getUserByPhone = withError(
  'fetch',
  async (request: FastifyRequest<{ Querystring: UserByPhoneQueryType }>, reply: FastifyReply) => {
    const { phone } = request.query;
    const user = await userRepository.findByPhone(phone);

    if (!user) {
      return sendNotFound(reply, 'User not found');
    }

    return sendSuccess(reply, user);
  }
);

export const createUser = withError(
  'create',
  async (request: FastifyRequest<{ Body: CreateUserInput }>, reply: FastifyReply) => {
    const user = await userRepository.create(request.body);
    return sendCreated(reply, user);
  }
);

export const updateUser = withError(
  'update',
  async (
    request: FastifyRequest<{
      Params: UserIdParamsType;
      Body: UpdateUserInput;
    }>,
    reply: FastifyReply
  ) => {
    const { id } = request.params;
    const user = await userRepository.update(id, request.body);
    return sendSuccess(reply, user);
  }
);

export const deleteUser = withError(
  'delete',
  async (request: FastifyRequest<{ Params: UserIdParamsType }>, reply: FastifyReply) => {
    const { id } = request.params;
    await userRepository.delete(id);
    return sendNoContent(reply);
  }
);

// ============================================
// User Organizations
// ============================================

export const getUserOrganizations = withError(
  'fetch organizations for',
  async (request: FastifyRequest<{ Params: UserIdParamsType }>, reply: FastifyReply) => {
    const { id } = request.params;

    // First check if user exists
    const user = await userRepository.findById(id);
    if (!user) {
      return sendNotFound(reply, 'User not found');
    }

    const organizations = await userRepository.getUserOrganizations(id);
    return sendSuccess(reply, organizations);
  }
);
