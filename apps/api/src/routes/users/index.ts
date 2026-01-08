import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  CreateUserSchema,
  UpdateUserSchema,
  UserIdParams,
  UserListQuery,
  UserByPhoneQuery,
} from './user.schema';
import {
  listUsers,
  getUser,
  getUserByPhone,
  createUser,
  updateUser,
  deleteUser,
  getUserOrganizations,
} from './user.controller';

export default async function userRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // ============================================
  // User CRUD
  // ============================================

  // GET /api/users - List all users
  app.get(
    '/',
    {
      schema: {
        querystring: UserListQuery,
      },
    },
    listUsers
  );

  // GET /api/users/by-phone - Get user by phone number
  app.get(
    '/by-phone',
    {
      schema: {
        querystring: UserByPhoneQuery,
      },
    },
    getUserByPhone
  );

  // GET /api/users/:id - Get user by ID
  app.get(
    '/:id',
    {
      schema: {
        params: UserIdParams,
      },
    },
    getUser
  );

  // POST /api/users - Create user
  app.post(
    '/',
    {
      schema: {
        body: CreateUserSchema,
      },
    },
    createUser
  );

  // PUT /api/users/:id - Update user
  app.put(
    '/:id',
    {
      schema: {
        params: UserIdParams,
        body: UpdateUserSchema,
      },
    },
    updateUser
  );

  // DELETE /api/users/:id - Delete user
  app.delete(
    '/:id',
    {
      schema: {
        params: UserIdParams,
      },
    },
    deleteUser
  );

  // ============================================
  // User Organizations
  // ============================================

  // GET /api/users/:id/organizations - Get user's organizations
  app.get(
    '/:id/organizations',
    {
      schema: {
        params: UserIdParams,
      },
    },
    getUserOrganizations
  );
}
