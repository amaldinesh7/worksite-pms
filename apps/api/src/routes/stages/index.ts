import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { organizationMiddleware } from '../../middleware/organization.middleware';
import * as controller from './stage.controller';
import {
  createStageSchema,
  updateStageSchema,
  stageQuerySchema,
  stageParamsSchema,
  projectParamsSchema,
} from './stage.schema';

export default async function stageRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // Apply organization middleware to all routes
  app.addHook('preHandler', organizationMiddleware);

  // GET /api/stages - List all stages
  app.get('/', {
    schema: { querystring: stageQuerySchema },
    handler: controller.listStages,
  });

  // GET /api/stages/project/:projectId - Get stages by project
  app.get('/project/:projectId', {
    schema: { params: projectParamsSchema },
    handler: controller.getStagesByProject,
  });

  // GET /api/stages/:id - Get stage by ID
  app.get('/:id', {
    schema: { params: stageParamsSchema },
    handler: controller.getStage,
  });

  // GET /api/stages/:id/stats - Get stage statistics
  app.get('/:id/stats', {
    schema: { params: stageParamsSchema },
    handler: controller.getStageStats,
  });

  // POST /api/stages - Create stage
  app.post('/', {
    schema: { body: createStageSchema },
    handler: controller.createStage,
  });

  // PUT /api/stages/:id - Update stage
  app.put('/:id', {
    schema: {
      params: stageParamsSchema,
      body: updateStageSchema,
    },
    handler: controller.updateStage,
  });

  // DELETE /api/stages/:id - Delete stage
  app.delete('/:id', {
    schema: { params: stageParamsSchema },
    handler: controller.deleteStage,
  });
}
