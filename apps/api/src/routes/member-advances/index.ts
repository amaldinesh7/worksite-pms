import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { organizationMiddleware } from '../../middleware/organization.middleware';
import * as controller from './member-advance.controller';
import {
  createMemberAdvanceSchema,
  updateMemberAdvanceSchema,
  memberAdvanceQuerySchema,
  memberAdvanceParamsSchema,
  projectMemberAdvanceParamsSchema,
  memberSummaryParamsSchema,
  memberBalancesParamsSchema,
  batchMemberBalancesBodySchema,
} from './member-advance.schema';

export default async function memberAdvanceRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // Apply organization middleware to all routes
  app.addHook('preHandler', organizationMiddleware);

  // GET /api/member-advances - List all member advances
  app.get('/', {
    schema: { querystring: memberAdvanceQuerySchema },
    handler: controller.listMemberAdvances,
  });

  // GET /api/member-advances/project/:projectId/summaries - Get all member summaries
  app.get('/project/:projectId/summaries', {
    schema: { params: projectMemberAdvanceParamsSchema },
    handler: controller.getProjectMemberAdvanceSummaries,
  });

  // GET /api/member-advances/project/:projectId/members - Get project members for dropdown
  app.get('/project/:projectId/members', {
    schema: { params: projectMemberAdvanceParamsSchema },
    handler: controller.getProjectMembers,
  });

  // GET /api/member-advances/project/:projectId/member/:memberId/summary - Get member summary
  app.get('/project/:projectId/member/:memberId/summary', {
    schema: { params: memberSummaryParamsSchema },
    handler: controller.getMemberAdvanceSummary,
  });

  // GET /api/member-advances/member/:memberId/balances - Get member balances across all projects
  app.get('/member/:memberId/balances', {
    schema: { params: memberBalancesParamsSchema },
    handler: controller.getMemberBalancesAcrossProjects,
  });

  // GET /api/member-advances/member/:memberId/total-balance - Get member total balance
  app.get('/member/:memberId/total-balance', {
    schema: { params: memberBalancesParamsSchema },
    handler: controller.getMemberTotalBalance,
  });

  // POST /api/member-advances/batch-balances - Get member total balances in batch
  app.post('/batch-balances', {
    schema: { body: batchMemberBalancesBodySchema },
    handler: controller.getMemberTotalBalancesBatch,
  });

  // GET /api/member-advances/:id - Get member advance by ID
  app.get('/:id', {
    schema: { params: memberAdvanceParamsSchema },
    handler: controller.getMemberAdvance,
  });

  // POST /api/member-advances - Create member advance
  app.post('/', {
    schema: { body: createMemberAdvanceSchema },
    handler: controller.createMemberAdvance,
  });

  // PUT /api/member-advances/:id - Update member advance
  app.put('/:id', {
    schema: {
      params: memberAdvanceParamsSchema,
      body: updateMemberAdvanceSchema,
    },
    handler: controller.updateMemberAdvance,
  });

  // DELETE /api/member-advances/:id - Delete member advance
  app.delete('/:id', {
    schema: { params: memberAdvanceParamsSchema },
    handler: controller.deleteMemberAdvance,
  });
}
