import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { organizationMiddleware } from '../../middleware/organization.middleware';
import * as controller from './party.controller';
import {
  createPartySchema,
  updatePartySchema,
  partyQuerySchema,
  partyParamsSchema,
  partyProjectsQuerySchema,
  partyTransactionsQuerySchema,
} from './party.schema';

export default async function partyRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // Apply organization middleware to all routes
  app.addHook('preHandler', organizationMiddleware);

  // GET /api/parties - List all parties
  app.get('/', {
    schema: { querystring: partyQuerySchema },
    handler: controller.listParties,
  });

  // GET /api/parties/summary - Get summary stats for all parties
  app.get('/summary', {
    handler: controller.getPartiesSummary,
  });

  // GET /api/parties/:id - Get party by ID
  app.get('/:id', {
    schema: { params: partyParamsSchema },
    handler: controller.getParty,
  });

  // GET /api/parties/:id/stats - Get party statistics
  app.get('/:id/stats', {
    schema: { params: partyParamsSchema },
    handler: controller.getPartyStats,
  });

  // GET /api/parties/:id/projects - Get party projects with credits
  app.get('/:id/projects', {
    schema: {
      params: partyParamsSchema,
      querystring: partyProjectsQuerySchema,
    },
    handler: controller.getPartyProjects,
  });

  // GET /api/parties/:id/transactions - Get party transactions (payments/expenses)
  app.get('/:id/transactions', {
    schema: {
      params: partyParamsSchema,
      querystring: partyTransactionsQuerySchema,
    },
    handler: controller.getPartyTransactions,
  });

  // GET /api/parties/:id/client-projects - Get projects where this party is the client
  app.get('/:id/client-projects', {
    schema: { params: partyParamsSchema },
    handler: controller.getClientProjects,
  });

  // POST /api/parties - Create party
  app.post('/', {
    schema: { body: createPartySchema },
    handler: controller.createParty,
  });

  // PUT /api/parties/:id - Update party
  app.put('/:id', {
    schema: {
      params: partyParamsSchema,
      body: updatePartySchema,
    },
    handler: controller.updateParty,
  });

  // DELETE /api/parties/:id - Delete party
  app.delete('/:id', {
    schema: { params: partyParamsSchema },
    handler: controller.deleteParty,
  });
}
