import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { organizationMiddleware } from '../../middleware/organization.middleware';
import * as controller from './project.controller';
import {
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
  projectParamsSchema,
} from './project.schema';

export default async function projectRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // Apply organization middleware to all routes
  app.addHook('preHandler', organizationMiddleware);

  // GET /api/projects - List all projects
  app.get('/', {
    schema: { querystring: projectQuerySchema },
    handler: controller.listProjects,
  });

  // GET /api/projects/:id - Get project by ID
  app.get('/:id', {
    schema: { params: projectParamsSchema },
    handler: controller.getProject,
  });

  // GET /api/projects/:id/stats - Get project statistics
  app.get('/:id/stats', {
    schema: { params: projectParamsSchema },
    handler: controller.getProjectStats,
  });

  // POST /api/projects - Create project
  app.post('/', {
    schema: { body: createProjectSchema },
    handler: controller.createProject,
  });

  // PUT /api/projects/:id - Update project
  app.put('/:id', {
    schema: {
      params: projectParamsSchema,
      body: updateProjectSchema,
    },
    handler: controller.updateProject,
  });

  // DELETE /api/projects/:id - Delete project
  app.delete('/:id', {
    schema: { params: projectParamsSchema },
    handler: controller.deleteProject,
  });
}
