import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { organizationMiddleware } from '../../middleware/organization.middleware';
import * as controller from './permission.controller';

export default async function permissionRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.addHook('preHandler', organizationMiddleware);

  // GET /api/permissions - List all permissions
  app.get('/', controller.listPermissions);

  // GET /api/permissions/grouped - List permissions grouped by category
  app.get('/grouped', controller.listPermissionsGrouped);
}
