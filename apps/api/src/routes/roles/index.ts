import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { organizationMiddleware } from '../../middleware/organization.middleware';
import { createRoleSchema, updateRoleSchema, roleParamsSchema, roleQuerySchema } from './role.schema';
import * as controller from './role.controller';

export default async function roleRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.addHook('preHandler', organizationMiddleware);

  // GET /api/roles - List all roles for organization
  app.get('/', { schema: { querystring: roleQuerySchema } }, controller.listRoles);

  // GET /api/roles/:id - Get a role by ID
  app.get('/:id', { schema: { params: roleParamsSchema } }, controller.getRole);

  // POST /api/roles - Create a new role
  app.post('/', { schema: { body: createRoleSchema } }, controller.createRole);

  // PUT /api/roles/:id - Update a role
  app.put(
    '/:id',
    { schema: { params: roleParamsSchema, body: updateRoleSchema } },
    controller.updateRole
  );

  // DELETE /api/roles/:id - Delete a role
  app.delete('/:id', { schema: { params: roleParamsSchema } }, controller.deleteRole);
}
