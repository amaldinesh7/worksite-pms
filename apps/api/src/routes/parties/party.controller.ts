import type { FastifyReply, FastifyRequest } from 'fastify';
import { partyRepository } from '../../repositories/party.repository';
import { createErrorHandler } from '../../lib/error-handler';
import {
  sendSuccess,
  sendPaginated,
  sendNotFound,
  sendNoContent,
  buildPagination,
} from '../../lib/response.utils';
import type {
  CreatePartyInput,
  UpdatePartyInput,
  PartyQuery,
  PartyParams,
  PartyProjectsQuery,
  PartyTransactionsQuery,
} from './party.schema';

const handle = createErrorHandler('party');

// ============================================
// List Parties
// ============================================
export const listParties = handle(
  'fetch',
  async (request: FastifyRequest<{ Querystring: PartyQuery }>, reply: FastifyReply) => {
    const { page, limit, search, type, hasCredit } = request.query;
    const skip = (page - 1) * limit;

    const { parties, total } = await partyRepository.findAll(request.organizationId, {
      skip,
      take: limit,
      search,
      type,
      hasCredit,
    });

    return sendPaginated(reply, parties, buildPagination(page, limit, total));
  }
);

// ============================================
// Get Single Party
// ============================================
export const getParty = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: PartyParams }>, reply: FastifyReply) => {
    const party = await partyRepository.findById(request.organizationId, request.params.id);

    if (!party) {
      return sendNotFound(reply, 'Party');
    }

    return sendSuccess(reply, party);
  }
);

// ============================================
// Create Party
// ============================================
export const createParty = handle(
  'create',
  async (request: FastifyRequest<{ Body: CreatePartyInput }>, reply: FastifyReply) => {
    const party = await partyRepository.create(request.organizationId, request.body);

    return sendSuccess(reply, party, 201);
  }
);

// ============================================
// Update Party
// ============================================
export const updateParty = handle(
  'update',
  async (
    request: FastifyRequest<{ Params: PartyParams; Body: UpdatePartyInput }>,
    reply: FastifyReply
  ) => {
    const party = await partyRepository.update(
      request.organizationId,
      request.params.id,
      request.body
    );

    return sendSuccess(reply, party);
  }
);

// ============================================
// Delete Party
// ============================================
export const deleteParty = handle(
  'delete',
  async (request: FastifyRequest<{ Params: PartyParams }>, reply: FastifyReply) => {
    await partyRepository.delete(request.organizationId, request.params.id);
    return sendNoContent(reply);
  }
);

// ============================================
// Get Party Stats
// ============================================
export const getPartyStats = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: PartyParams }>, reply: FastifyReply) => {
    const stats = await partyRepository.getPartyStats(request.organizationId, request.params.id);

    return sendSuccess(reply, stats);
  }
);

// ============================================
// Get Parties Summary
// ============================================
export const getPartiesSummary = handle(
  'fetch',
  async (request: FastifyRequest, reply: FastifyReply) => {
    const summary = await partyRepository.getSummary(request.organizationId);

    return sendSuccess(reply, summary);
  }
);

// ============================================
// Get Party Projects with Credits
// ============================================
export const getPartyProjects = handle(
  'fetch',
  async (
    request: FastifyRequest<{ Params: PartyParams; Querystring: PartyProjectsQuery }>,
    reply: FastifyReply
  ) => {
    const { page, limit } = request.query;
    const skip = (page - 1) * limit;

    // First verify party exists
    const party = await partyRepository.findById(request.organizationId, request.params.id);
    if (!party) {
      return sendNotFound(reply, 'Party');
    }

    const result = await partyRepository.getPartyProjects(
      request.organizationId,
      request.params.id,
      {
        skip,
        take: limit,
      }
    );

    return sendSuccess(reply, {
      items: result.projects,
      totals: result.totals,
      pagination: buildPagination(page, limit, result.total),
    });
  }
);

// ============================================
// Get Party Transactions (Payments/Expenses)
// ============================================
export const getPartyTransactions = handle(
  'fetch',
  async (
    request: FastifyRequest<{ Params: PartyParams; Querystring: PartyTransactionsQuery }>,
    reply: FastifyReply
  ) => {
    const { page, limit, projectId, type } = request.query;
    const skip = (page - 1) * limit;

    // First verify party exists
    const party = await partyRepository.findById(request.organizationId, request.params.id);
    if (!party) {
      return sendNotFound(reply, 'Party');
    }

    const result = await partyRepository.getPartyTransactions(
      request.organizationId,
      request.params.id,
      {
        type,
        projectId,
        skip,
        take: limit,
      }
    );

    return sendPaginated(reply, result.transactions, buildPagination(page, limit, result.total));
  }
);

// ============================================
// Get Client Projects (for CLIENT type parties)
// ============================================
export const getClientProjects = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: PartyParams }>, reply: FastifyReply) => {
    // First verify party exists and is a CLIENT
    const party = await partyRepository.findById(request.organizationId, request.params.id);
    if (!party) {
      return sendNotFound(reply, 'Party');
    }

    if (party.type !== 'CLIENT') {
      return reply.status(400).send({
        success: false,
        error: 'Party is not a client',
      });
    }

    const projects = await partyRepository.getClientProjects(
      request.organizationId,
      request.params.id
    );

    return sendSuccess(reply, projects);
  }
);
