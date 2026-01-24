import type { FastifyReply, FastifyRequest } from 'fastify';
import { memberAdvanceRepository } from '../../repositories/member-advance.repository';
import { createErrorHandler } from '../../lib/error-handler';
import {
  sendSuccess,
  sendPaginated,
  sendNotFound,
  sendNoContent,
  buildPagination,
} from '../../lib/response.utils';
import type {
  CreateMemberAdvanceInput,
  UpdateMemberAdvanceInput,
  MemberAdvanceQuery,
  MemberAdvanceParams,
  ProjectMemberAdvanceParams,
  MemberSummaryParams,
  BatchMemberBalancesBody,
} from './member-advance.schema';
import type { PaymentMode } from '@prisma/client';

const handle = createErrorHandler('member-advance');

// ============================================
// List Member Advances
// ============================================
export const listMemberAdvances = handle(
  'fetch',
  async (request: FastifyRequest<{ Querystring: MemberAdvanceQuery }>, reply: FastifyReply) => {
    const { page, limit, projectId, memberId, startDate, endDate, sortBy, sortOrder } =
      request.query;
    const skip = (page - 1) * limit;

    const { advances, total } = await memberAdvanceRepository.findAll(request.organizationId, {
      skip,
      take: limit,
      projectId,
      memberId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      sortBy,
      sortOrder,
    });

    return sendPaginated(reply, advances, buildPagination(page, limit, total));
  }
);

// ============================================
// Get Single Member Advance
// ============================================
export const getMemberAdvance = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: MemberAdvanceParams }>, reply: FastifyReply) => {
    const advance = await memberAdvanceRepository.findById(
      request.organizationId,
      request.params.id
    );

    if (!advance) {
      return sendNotFound(reply, 'Member advance');
    }

    return sendSuccess(reply, advance);
  }
);

// ============================================
// Create Member Advance
// ============================================
export const createMemberAdvance = handle(
  'create',
  async (request: FastifyRequest<{ Body: CreateMemberAdvanceInput }>, reply: FastifyReply) => {
    const advance = await memberAdvanceRepository.create(request.organizationId, {
      ...request.body,
      paymentMode: request.body.paymentMode as PaymentMode,
      advanceDate: new Date(request.body.advanceDate),
      expectedSettlementDate: request.body.expectedSettlementDate
        ? new Date(request.body.expectedSettlementDate)
        : undefined,
    });

    return sendSuccess(reply, advance, 201);
  }
);

// ============================================
// Update Member Advance
// ============================================
export const updateMemberAdvance = handle(
  'update',
  async (
    request: FastifyRequest<{ Params: MemberAdvanceParams; Body: UpdateMemberAdvanceInput }>,
    reply: FastifyReply
  ) => {
    const updateData = {
      ...request.body,
      paymentMode: request.body.paymentMode as PaymentMode | undefined,
      advanceDate: request.body.advanceDate ? new Date(request.body.advanceDate) : undefined,
      expectedSettlementDate: request.body.expectedSettlementDate
        ? new Date(request.body.expectedSettlementDate)
        : request.body.expectedSettlementDate === null
          ? null
          : undefined,
    };

    const advance = await memberAdvanceRepository.update(
      request.organizationId,
      request.params.id,
      updateData
    );

    return sendSuccess(reply, advance);
  }
);

// ============================================
// Delete Member Advance
// ============================================
export const deleteMemberAdvance = handle(
  'delete',
  async (request: FastifyRequest<{ Params: MemberAdvanceParams }>, reply: FastifyReply) => {
    await memberAdvanceRepository.delete(request.organizationId, request.params.id);
    return sendNoContent(reply);
  }
);

// ============================================
// Get Member Advance Summary for a specific member
// ============================================
export const getMemberAdvanceSummary = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: MemberSummaryParams }>, reply: FastifyReply) => {
    const { projectId, memberId } = request.params;
    const summary = await memberAdvanceRepository.getMemberAdvanceSummary(
      request.organizationId,
      projectId,
      memberId
    );

    if (!summary) {
      return sendNotFound(reply, 'Member');
    }

    return sendSuccess(reply, summary);
  }
);

// ============================================
// Get All Members' Advance Summaries for a project
// ============================================
export const getProjectMemberAdvanceSummaries = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: ProjectMemberAdvanceParams }>, reply: FastifyReply) => {
    const { projectId } = request.params;
    const summaries = await memberAdvanceRepository.getProjectMemberAdvanceSummaries(
      request.organizationId,
      projectId
    );

    return sendSuccess(reply, summaries);
  }
);

// ============================================
// Get Project Members (for dropdown)
// ============================================
export const getProjectMembers = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: ProjectMemberAdvanceParams }>, reply: FastifyReply) => {
    const { projectId } = request.params;
    const members = await memberAdvanceRepository.getProjectMembers(
      request.organizationId,
      projectId
    );

    return sendSuccess(reply, members);
  }
);

// ============================================
// Get Member Balances Across All Projects
// ============================================
export const getMemberBalancesAcrossProjects = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: { memberId: string } }>, reply: FastifyReply) => {
    const { memberId } = request.params;
    const balances = await memberAdvanceRepository.getMemberBalancesAcrossProjects(
      request.organizationId,
      memberId
    );

    return sendSuccess(reply, balances);
  }
);

// ============================================
// Get Member Total Balance
// ============================================
export const getMemberTotalBalance = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: { memberId: string } }>, reply: FastifyReply) => {
    const { memberId } = request.params;
    const totalBalance = await memberAdvanceRepository.getMemberTotalBalance(
      request.organizationId,
      memberId
    );

    return sendSuccess(reply, { totalBalance });
  }
);

// ============================================
// Get Member Total Balances in Batch
// ============================================
export const getMemberTotalBalancesBatch = handle(
  'fetch',
  async (request: FastifyRequest<{ Body: BatchMemberBalancesBody }>, reply: FastifyReply) => {
    const { memberIds } = request.body;
    const balances = await memberAdvanceRepository.getMemberTotalBalancesBatch(
      request.organizationId,
      memberIds
    );

    return sendSuccess(reply, { balances });
  }
);
