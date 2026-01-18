import type { FastifyReply, FastifyRequest } from 'fastify';
import { expenseService } from '../../services/expense.service';
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
import type { PaymentMode, ExpenseStatus } from '@prisma/client';

// Create a resource-specific error handler
const handle = createErrorHandler('expense');

// ============================================
// List Expenses
// ============================================
export const listExpenses = handle(
  'fetch',
  async (request: FastifyRequest<{ Querystring: ExpenseQuery }>, reply: FastifyReply) => {
    const { page, limit, projectId, partyId, stageId, search, status, startDate, endDate } =
      request.query;
    const skip = (page - 1) * limit;

    const { expenses, total } = await expenseService.findAll(request.organizationId, {
      skip,
      take: limit,
      projectId,
      partyId,
      stageId,
      search,
      status: status as ExpenseStatus | undefined,
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
    const expense = await expenseService.findById(request.organizationId, request.params.id);

    if (!expense) {
      return sendNotFound(reply, 'Expense');
    }

    return sendSuccess(reply, expense);
  }
);

// ============================================
// Create Expense (with optional payment via service)
// ============================================
export const createExpense = handle(
  'create',
  async (request: FastifyRequest<{ Body: CreateExpenseInput }>, reply: FastifyReply) => {
    const { paidAmount, paymentMode, status, ...expenseData } = request.body;

    // Service handles the expense + payment transaction logic
    const expense = await expenseService.create(request.organizationId, {
      ...expenseData,
      expenseDate: new Date(expenseData.expenseDate),
      status: status as ExpenseStatus | undefined,
      paidAmount,
      paymentMode: paymentMode as PaymentMode | undefined,
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
    const { status, ...rest } = request.body;
    const updateData = {
      ...rest,
      status: status as ExpenseStatus | undefined,
      expenseDate: rest.expenseDate ? new Date(rest.expenseDate) : undefined,
    };

    const expense = await expenseService.update(
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
    await expenseService.delete(request.organizationId, request.params.id);
    return sendNoContent(reply);
  }
);

// ============================================
// Get Expenses Summary by Category
// ============================================
export const getExpensesByCategory = handle(
  'fetch',
  async (request: FastifyRequest<{ Querystring: { projectId?: string } }>, reply: FastifyReply) => {
    const summary = await expenseService.getExpensesByCategory(
      request.organizationId,
      request.query.projectId
    );

    return sendSuccess(reply, summary);
  }
);
