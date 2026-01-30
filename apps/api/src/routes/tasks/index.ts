import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { organizationMiddleware } from '../../middleware/organization.middleware';
import * as controller from './task.controller';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskQuerySchema,
  taskParamsSchema,
  stageParamsSchema,
  projectParamsSchema,
} from './task.schema';

export default async function taskRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // Apply organization middleware to all routes
  app.addHook('preHandler', organizationMiddleware);

  // GET /api/tasks - List all tasks
  app.get('/', {
    schema: { querystring: taskQuerySchema },
    handler: controller.listTasks,
  });

  // GET /api/tasks/stage/:stageId - Get tasks by stage
  app.get('/stage/:stageId', {
    schema: { params: stageParamsSchema },
    handler: controller.getTasksByStage,
  });

  // GET /api/tasks/project/:projectId - Get tasks by project
  app.get('/project/:projectId', {
    schema: { params: projectParamsSchema },
    handler: controller.getTasksByProject,
  });

  // GET /api/tasks/:id - Get task by ID
  app.get('/:id', {
    schema: { params: taskParamsSchema },
    handler: controller.getTask,
  });

  // POST /api/tasks - Create task
  app.post('/', {
    schema: { body: createTaskSchema },
    handler: controller.createTask,
  });

  // PUT /api/tasks/:id - Update task
  app.put('/:id', {
    schema: {
      params: taskParamsSchema,
      body: updateTaskSchema,
    },
    handler: controller.updateTask,
  });

  // PUT /api/tasks/:id/status - Update task status
  app.put('/:id/status', {
    schema: {
      params: taskParamsSchema,
      body: updateTaskStatusSchema,
    },
    handler: controller.updateTaskStatus,
  });

  // DELETE /api/tasks/:id - Delete task
  app.delete('/:id', {
    schema: { params: taskParamsSchema },
    handler: controller.deleteTask,
  });
}
