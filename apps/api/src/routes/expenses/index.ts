import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { organizationMiddleware } from '../../middleware/organization.middleware';
import * as controller from './expense.controller';
import {
  createExpenseSchema,
  updateExpenseSchema,
  expenseQuerySchema,
  expenseParamsSchema,
  summaryQuerySchema,
} from './expense.schema';

export default async function expenseRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  // Apply organization middleware to all routes
  app.addHook('preHandler', organizationMiddleware);

  // GET /api/expenses - List all expenses
  app.get('/', {
    schema: { querystring: expenseQuerySchema },
    handler: controller.listExpenses,
  });

  // GET /api/expenses/summary/by-category - Get expenses summary by category
  // Note: Must be before /:id to avoid route conflict
  app.get('/summary/by-category', {
    schema: { querystring: summaryQuerySchema },
    handler: controller.getExpensesByCategory,
  });

  // GET /api/expenses/:id - Get expense by ID
  app.get('/:id', {
    schema: { params: expenseParamsSchema },
    handler: controller.getExpense,
  });

  // POST /api/expenses - Create expense
  app.post('/', {
    schema: { body: createExpenseSchema },
    handler: controller.createExpense,
  });

  // PUT /api/expenses/:id - Update expense
  app.put('/:id', {
    schema: {
      params: expenseParamsSchema,
      body: updateExpenseSchema,
    },
    handler: controller.updateExpense,
  });

  // DELETE /api/expenses/:id - Delete expense
  app.delete('/:id', {
    schema: { params: expenseParamsSchema },
    handler: controller.deleteExpense,
  });
}
