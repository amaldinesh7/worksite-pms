/**
 * Import Routes
 *
 * Registers all import-related API endpoints
 */

import type { FastifyInstance } from 'fastify';
import { organizationMiddleware } from '../../middleware/organization.middleware';
import {
  startImport,
  getJobStatus,
  getActiveImports,
  getRecentImports,
  confirmImport,
  cancelImport,
  getAllJobs,
  getStuckJobs,
  getQueueStats,
  retryJob,
  testUrlParsing,
} from './imports.controller';

export default async function importRoutes(app: FastifyInstance): Promise<void> {
  // Apply organization middleware to all routes
  app.addHook('preHandler', organizationMiddleware);

  // ============================================
  // Monitoring Endpoints (Admin/Debug)
  // ============================================

  // Get all jobs with filters
  // GET /imports?status=FAILED&projectId=xxx&limit=50&offset=0
  app.get('/imports', getAllJobs);

  // Get stuck jobs (processing for too long)
  // GET /imports/stuck?minutes=5
  app.get('/imports/stuck', getStuckJobs);

  // Get queue statistics
  // GET /imports/stats
  app.get('/imports/stats', getQueueStats);

  // Get all active imports for current user (across all projects)
  app.get('/imports/active', getActiveImports);

  // TEST: URL-based parsing test endpoint (development only)
  // GET /imports/test-url-parsing
  app.get('/imports/test-url-parsing', testUrlParsing);

  // ============================================
  // Project-scoped Import Routes
  // ============================================

  app.post('/projects/:projectId/imports/start', startImport);
  app.get('/projects/:projectId/imports', getRecentImports);
  app.get('/projects/:projectId/imports/:jobId', getJobStatus);
  app.post('/projects/:projectId/imports/:jobId/confirm', confirmImport);
  app.post('/projects/:projectId/imports/:jobId/retry', retryJob);
  app.delete('/projects/:projectId/imports/:jobId', cancelImport);
}
