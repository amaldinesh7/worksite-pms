import type { FastifyInstance } from 'fastify';
import { organizationMiddleware } from '../../middleware/organization.middleware';
import {
  getOverview,
  getKPI,
  getProjectsPL,
  getTodayTasks,
  getCreditsSummary,
  getAlerts,
} from './overview.controller';

export default async function overviewRoutes(fastify: FastifyInstance) {
  // Apply organization middleware to all routes
  fastify.addHook('preHandler', organizationMiddleware);

  /**
   * GET /api/overview - Get complete dashboard overview data
   */
  fastify.get('/', getOverview);

  /**
   * GET /api/overview/kpi - Get KPI statistics only
   */
  fastify.get('/kpi', getKPI);

  /**
   * GET /api/overview/projects-pl - Get project P/L table data
   */
  fastify.get('/projects-pl', getProjectsPL);

  /**
   * GET /api/overview/tasks - Get today's tasks
   */
  fastify.get('/tasks', getTodayTasks);

  /**
   * GET /api/overview/credits - Get credits summary
   */
  fastify.get('/credits', getCreditsSummary);

  /**
   * GET /api/overview/alerts - Get alerts
   */
  fastify.get('/alerts', getAlerts);
}
