import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { organizationMiddleware } from '../../middleware/organization.middleware';
import * as controller from './payment.controller';
import {
  createPaymentSchema,
  updatePaymentSchema,
  paymentQuerySchema,
  paymentParamsSchema,
  projectPaymentParamsSchema,
  partyOutstandingParamsSchema,
  summaryQuerySchema,
  projectPaymentQuerySchema,
} from './payment.schema';

export default async function paymentRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // Apply organization middleware to all routes
  app.addHook('preHandler', organizationMiddleware);

  // GET /api/payments - List all payments
  app.get('/', {
    schema: { querystring: paymentQuerySchema },
    handler: controller.listPayments,
  });

  // GET /api/payments/summary - Get payments summary
  // Note: Must be before /:id to avoid route conflict
  app.get('/summary', {
    schema: { querystring: summaryQuerySchema },
    handler: controller.getPaymentsSummary,
  });

  // GET /api/payments/project/:projectId/summary - Get project payment summary
  app.get('/project/:projectId/summary', {
    schema: { params: projectPaymentParamsSchema },
    handler: controller.getProjectPaymentSummary,
  });

  // GET /api/payments/project/:projectId/client - Get client payments
  app.get('/project/:projectId/client', {
    schema: {
      params: projectPaymentParamsSchema,
      querystring: projectPaymentQuerySchema,
    },
    handler: controller.getClientPayments,
  });

  // GET /api/payments/project/:projectId/party - Get party payments
  app.get('/project/:projectId/party', {
    schema: {
      params: projectPaymentParamsSchema,
      querystring: projectPaymentQuerySchema,
    },
    handler: controller.getPartyPayments,
  });

  // GET /api/payments/project/:projectId/party/:partyId/outstanding - Get party outstanding
  app.get('/project/:projectId/party/:partyId/outstanding', {
    schema: { params: partyOutstandingParamsSchema },
    handler: controller.getPartyOutstanding,
  });

  // GET /api/payments/project/:projectId/party/:partyId/unpaid-expenses - Get unpaid expenses
  app.get('/project/:projectId/party/:partyId/unpaid-expenses', {
    schema: { params: partyOutstandingParamsSchema },
    handler: controller.getPartyUnpaidExpenses,
  });

  // GET /api/payments/:id - Get payment by ID
  app.get('/:id', {
    schema: { params: paymentParamsSchema },
    handler: controller.getPayment,
  });

  // POST /api/payments - Create payment
  app.post('/', {
    schema: { body: createPaymentSchema },
    handler: controller.createPayment,
  });

  // PUT /api/payments/:id - Update payment
  app.put('/:id', {
    schema: {
      params: paymentParamsSchema,
      body: updatePaymentSchema,
    },
    handler: controller.updatePayment,
  });

  // DELETE /api/payments/:id - Delete payment
  app.delete('/:id', {
    schema: { params: paymentParamsSchema },
    handler: controller.deletePayment,
  });
}
