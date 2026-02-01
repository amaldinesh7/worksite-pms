/**
 * Overview Controller
 *
 * Handles dashboard overview API endpoints with consistent error handling.
 */

import type { FastifyReply, FastifyRequest } from 'fastify';
import { overviewRepository } from '../../repositories/overview.repository';
import { createErrorHandler } from '../../lib/error-handler';
import { sendSuccess } from '../../lib/response.utils';

const handle = createErrorHandler('overview');

// ============================================
// Get Overview
// ============================================
export const getOverview = handle('fetch', async (request: FastifyRequest, reply: FastifyReply) => {
  const organizationId = request.organizationId!;
  const data = await overviewRepository.getOverviewData(organizationId);
  return sendSuccess(reply, data);
});

// ============================================
// Get KPI Stats
// ============================================
export const getKPI = handle('fetch', async (request: FastifyRequest, reply: FastifyReply) => {
  const organizationId = request.organizationId!;
  const data = await overviewRepository.getKPIStats(organizationId);
  return sendSuccess(reply, data);
});

// ============================================
// Get Projects P/L
// ============================================
export const getProjectsPL = handle(
  'fetch',
  async (request: FastifyRequest, reply: FastifyReply) => {
    const organizationId = request.organizationId!;
    const data = await overviewRepository.getProjectsPL(organizationId);
    return sendSuccess(reply, data);
  }
);

// ============================================
// Get Today Tasks
// ============================================
export const getTodayTasks = handle(
  'fetch',
  async (request: FastifyRequest, reply: FastifyReply) => {
    const organizationId = request.organizationId!;
    const data = await overviewRepository.getTodayTasks(organizationId);
    return sendSuccess(reply, data);
  }
);

// ============================================
// Get Credits Summary
// ============================================
export const getCreditsSummary = handle(
  'fetch',
  async (request: FastifyRequest, reply: FastifyReply) => {
    const organizationId = request.organizationId!;
    const data = await overviewRepository.getCreditsSummary(organizationId);
    return sendSuccess(reply, data);
  }
);

// ============================================
// Get Alerts
// ============================================
export const getAlerts = handle('fetch', async (request: FastifyRequest, reply: FastifyReply) => {
  const organizationId = request.organizationId!;
  const data = await overviewRepository.getAlerts(organizationId);
  return sendSuccess(reply, data);
});
