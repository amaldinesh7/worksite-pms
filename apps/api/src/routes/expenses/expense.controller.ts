import type { FastifyReply, FastifyRequest } from 'fastify';
import { expenseRepository } from '../../repositories/expense.repository';
import { createErrorHandler } from '../../lib/error-handler';
import {
  sendSuccess,
  sendPaginated,
  sendNotFound,
  sendNoContent,
  buildPagination,
} from '../../lib/response.utils';
import type {
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseQuery,
  ExpenseParams,
} from './expense.schema';

// Create a resource-specific error handler
const handle = createErrorHandler('expense');

// ============================================
// List Expenses
// ============================================
export const listExpenses = handle(
  'fetch',
  async (request: FastifyRequest<{ Querystring: ExpenseQuery }>, reply: FastifyReply) => {
    const { page, limit, projectId, partyId, stageId, startDate, endDate } = request.query;
    const skip = (page - 1) * limit;

    const { expenses, total } = await expenseRepository.findAll(request.organizationId, {
      skip,
      take: limit,
      projectId,
      partyId,
      stageId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return sendPaginated(reply, expenses, buildPagination(page, limit, total));
  }
);

// ============================================
// Get Single Expense
// ============================================
export const getExpense = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: ExpenseParams }>, reply: FastifyReply) => {
    const expense = await expenseRepository.findById(request.organizationId, request.params.id);

    if (!expense) {
      return sendNotFound(reply, 'Expense');
    }

    return sendSuccess(reply, expense);
  }
);

// ============================================
// Create Expense
// ============================================
export const createExpense = handle(
  'create',
  async (request: FastifyRequest<{ Body: CreateExpenseInput }>, reply: FastifyReply) => {
    const expense = await expenseRepository.create(request.organizationId, {
      ...request.body,
      expenseDate: new Date(request.body.expenseDate),
    });

    return sendSuccess(reply, expense, 201);
  }
);

// ============================================
// Update Expense
// ============================================
export const updateExpense = handle(
  'update',
  async (
    request: FastifyRequest<{ Params: ExpenseParams; Body: UpdateExpenseInput }>,
    reply: FastifyReply
  ) => {
    const updateData = {
      ...request.body,
      expenseDate: request.body.expenseDate ? new Date(request.body.expenseDate) : undefined,
    };

    const expense = await expenseRepository.update(
      request.organizationId,
      request.params.id,
      updateData
    );

    return sendSuccess(reply, expense);
  }
);

// ============================================
// Delete Expense
// ============================================
export const deleteExpense = handle(
  'delete',
  async (request: FastifyRequest<{ Params: ExpenseParams }>, reply: FastifyReply) => {
    await expenseRepository.delete(request.organizationId, request.params.id);
    return sendNoContent(reply);
  }
);

// ============================================
// Get Expenses Summary by Category
// ============================================
export const getExpensesByCategory = handle(
  'fetch',
  async (request: FastifyRequest<{ Querystring: { projectId?: string } }>, reply: FastifyReply) => {
    const summary = await expenseRepository.getExpensesByCategory(
      request.organizationId,
      request.query.projectId
    );

    return sendSuccess(reply, summary);
  }
);
