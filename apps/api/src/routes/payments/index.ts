import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { organizationMiddleware } from '../../middleware/organization.middleware';
import * as controller from './payment.controller';
import {
  createPaymentSchema,
  updatePaymentSchema,
  paymentQuerySchema,
  paymentParamsSchema,
  summaryQuerySchema,
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
