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
  SummaryQuery,
} from './payment.schema';
import type { PaymentType, PaymentMode } from '@prisma/client';

const handle = createErrorHandler('payment');

// ============================================
// List Payments
// ============================================
export const listPayments = handle(
  'fetch',
  async (request: FastifyRequest<{ Querystring: PaymentQuery }>, reply: FastifyReply) => {
    const { page, limit, projectId, partyId, expenseId, type, startDate, endDate } = request.query;
    const skip = (page - 1) * limit;

    const { payments, total } = await paymentRepository.findAll(request.organizationId, {
      skip,
      take: limit,
      projectId,
      partyId,
      expenseId,
      type: type as PaymentType | undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
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
