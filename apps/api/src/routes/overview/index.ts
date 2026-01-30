import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { organizationMiddleware } from '../../middleware/organization.middleware';
import { overviewRepository } from '../../repositories/overview.repository';
import { sendSuccess } from '../../lib/response.utils';

export default async function overviewRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // Apply organization middleware to all routes
  app.addHook('preHandler', organizationMiddleware);

  /**
   * GET /api/overview - Get complete dashboard overview data
   */
  app.get('/', async (request, reply) => {
    const organizationId = request.organizationId!;
    const data = await overviewRepository.getOverviewData(organizationId);
    return sendSuccess(reply, data);
  });

  /**
   * GET /api/overview/kpi - Get KPI statistics only
   */
  app.get('/kpi', async (request, reply) => {
    const organizationId = request.organizationId!;
    const data = await overviewRepository.getKPIStats(organizationId);
    return sendSuccess(reply, data);
  });

  /**
   * GET /api/overview/projects-pl - Get project P/L table data
   */
  app.get('/projects-pl', async (request, reply) => {
    const organizationId = request.organizationId!;
    const data = await overviewRepository.getProjectsPL(organizationId);
    return sendSuccess(reply, data);
  });

  /**
   * GET /api/overview/tasks - Get today's tasks
   */
  app.get('/tasks', async (request, reply) => {
    const organizationId = request.organizationId!;
    const data = await overviewRepository.getTodayTasks(organizationId);
    return sendSuccess(reply, data);
  });

  /**
   * GET /api/overview/credits - Get credits summary
   */
  app.get('/credits', async (request, reply) => {
    const organizationId = request.organizationId!;
    const data = await overviewRepository.getCreditsSummary(organizationId);
    return sendSuccess(reply, data);
  });

  /**
   * GET /api/overview/alerts - Get alerts
   */
  app.get('/alerts', async (request, reply) => {
    const organizationId = request.organizationId!;
    const data = await overviewRepository.getAlerts(organizationId);
    return sendSuccess(reply, data);
  });
}
