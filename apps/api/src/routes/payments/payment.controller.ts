import type { FastifyReply, FastifyRequest } from 'fastify';
import { paymentRepository } from '../../repositories/payment.repository';
import { createErrorHandler } from '../../lib/error-handler';
import {
  sendSuccess,
  sendPaginated,
  sendNotFound,
  sendNoContent,
  buildPagination,
} from '../../lib/response.utils';
import type {
  CreatePaymentInput,
  UpdatePaymentInput,
  PaymentQuery,
  PaymentParams,
  ProjectPaymentParams,
  PartyOutstandingParams,
  SummaryQuery,
  ProjectPaymentQuery,
} from './payment.schema';
import type { PaymentType, PaymentMode, PartyType } from '@prisma/client';

const handle = createErrorHandler('payment');

// ============================================
// List Payments
// ============================================
export const listPayments = handle(
  'fetch',
  async (request: FastifyRequest<{ Querystring: PaymentQuery }>, reply: FastifyReply) => {
    const { page, limit, projectId, partyId, expenseId, type, partyType, startDate, endDate, sortBy, sortOrder } = request.query;
    const skip = (page - 1) * limit;

    const { payments, total } = await paymentRepository.findAll(request.organizationId, {
      skip,
      take: limit,
      projectId,
      partyId,
      expenseId,
      type: type as PaymentType | undefined,
      partyType: partyType as PartyType | undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      sortBy,
      sortOrder,
    });

    return sendPaginated(reply, payments, buildPagination(page, limit, total));
  }
);

// ============================================
// Get Single Payment
// ============================================
export const getPayment = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: PaymentParams }>, reply: FastifyReply) => {
    const payment = await paymentRepository.findById(request.organizationId, request.params.id);

    if (!payment) {
      return sendNotFound(reply, 'Payment');
    }

    return sendSuccess(reply, payment);
  }
);

// ============================================
// Create Payment
// ============================================
export const createPayment = handle(
  'create',
  async (request: FastifyRequest<{ Body: CreatePaymentInput }>, reply: FastifyReply) => {
    const payment = await paymentRepository.create(request.organizationId, {
      ...request.body,
      type: request.body.type as PaymentType,
      paymentMode: request.body.paymentMode as PaymentMode,
      paymentDate: new Date(request.body.paymentDate),
    });

    return sendSuccess(reply, payment, 201);
  }
);

// ============================================
// Update Payment
// ============================================
export const updatePayment = handle(
  'update',
  async (
    request: FastifyRequest<{ Params: PaymentParams; Body: UpdatePaymentInput }>,
    reply: FastifyReply
  ) => {
    const updateData = {
      ...request.body,
      type: request.body.type as PaymentType | undefined,
      paymentMode: request.body.paymentMode as PaymentMode | undefined,
      paymentDate: request.body.paymentDate ? new Date(request.body.paymentDate) : undefined,
    };

    const payment = await paymentRepository.update(
      request.organizationId,
      request.params.id,
      updateData
    );

    return sendSuccess(reply, payment);
  }
);

// ============================================
// Delete Payment
// ============================================
export const deletePayment = handle(
  'delete',
  async (request: FastifyRequest<{ Params: PaymentParams }>, reply: FastifyReply) => {
    await paymentRepository.delete(request.organizationId, request.params.id);
    return sendNoContent(reply);
  }
);

// ============================================
// Get Payments Summary
// ============================================
export const getPaymentsSummary = handle(
  'fetch',
  async (request: FastifyRequest<{ Querystring: SummaryQuery }>, reply: FastifyReply) => {
    const { projectId, type } = request.query;
    const summary = await paymentRepository.getPaymentsSummary(
      request.organizationId,
      projectId,
      type as PaymentType | undefined
    );

    return sendSuccess(reply, summary);
  }
);

// ============================================
// Get Project Payment Summary (for client payments tab)
// ============================================
export const getProjectPaymentSummary = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: ProjectPaymentParams }>, reply: FastifyReply) => {
    const { projectId } = request.params;
    const summary = await paymentRepository.getProjectPaymentSummary(
      request.organizationId,
      projectId
    );

    return sendSuccess(reply, summary);
  }
);

// ============================================
// Get Client Payments (type = IN)
// ============================================
export const getClientPayments = handle(
  'fetch',
  async (
    request: FastifyRequest<{ Params: ProjectPaymentParams; Querystring: ProjectPaymentQuery }>,
    reply: FastifyReply
  ) => {
    const { projectId } = request.params;
    const { page, limit, startDate, endDate, sortBy, sortOrder } = request.query;
    const skip = (page - 1) * limit;

    const { payments, total } = await paymentRepository.getClientPayments(
      request.organizationId,
      projectId,
      {
        skip,
        take: limit,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        sortBy,
        sortOrder,
      }
    );

    return sendPaginated(reply, payments, buildPagination(page, limit, total));
  }
);

// ============================================
// Get Party Payments (type = OUT)
// ============================================
export const getPartyPayments = handle(
  'fetch',
  async (
    request: FastifyRequest<{ Params: ProjectPaymentParams; Querystring: ProjectPaymentQuery }>,
    reply: FastifyReply
  ) => {
    const { projectId } = request.params;
    const { page, limit, partyId, partyType, startDate, endDate, sortBy, sortOrder } = request.query;
    const skip = (page - 1) * limit;

    const { payments, total } = await paymentRepository.getPartyPayments(
      request.organizationId,
      projectId,
      {
        skip,
        take: limit,
        partyId,
        partyType: partyType as PartyType | undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        sortBy,
        sortOrder,
      }
    );

    return sendPaginated(reply, payments, buildPagination(page, limit, total));
  }
);

// ============================================
// Get Party Outstanding Amount
// ============================================
export const getPartyOutstanding = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: PartyOutstandingParams }>, reply: FastifyReply) => {
    const { projectId, partyId } = request.params;
    const outstanding = await paymentRepository.getPartyOutstanding(
      request.organizationId,
      projectId,
      partyId
    );

    return sendSuccess(reply, { outstanding });
  }
);

// ============================================
// Get Party Unpaid Expenses (for "pay against" dropdown)
// ============================================
export const getPartyUnpaidExpenses = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: PartyOutstandingParams }>, reply: FastifyReply) => {
    const { projectId, partyId } = request.params;
    const expenses = await paymentRepository.getPartyUnpaidExpenses(
      request.organizationId,
      projectId,
      partyId
    );

    return sendSuccess(reply, expenses);
  }
);
