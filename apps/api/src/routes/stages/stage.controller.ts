import type { FastifyReply, FastifyRequest } from 'fastify';
import { stageRepository } from '../../repositories/stage.repository';
import { createErrorHandler } from '../../lib/error-handler';
import {
  sendSuccess,
  sendPaginated,
  sendNotFound,
  sendNoContent,
  buildPagination,
} from '../../lib/response.utils';
import type {
  CreateStageInput,
  UpdateStageInput,
  StageQuery,
  StageParams,
  ProjectParams,
} from './stage.schema';

const handle = createErrorHandler('stage');

// ============================================
// List Stages
// ============================================
export const listStages = handle(
  'fetch',
  async (request: FastifyRequest<{ Querystring: StageQuery }>, reply: FastifyReply) => {
    const { page, limit, projectId } = request.query;
    const skip = (page - 1) * limit;

    const { stages, total } = await stageRepository.findAll(request.organizationId, {
      skip,
      take: limit,
      projectId,
    });

    return sendPaginated(reply, stages, buildPagination(page, limit, total));
  }
);

// ============================================
// Get Stages by Project
// ============================================
export const getStagesByProject = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: ProjectParams }>, reply: FastifyReply) => {
    const stages = await stageRepository.findByProject(
      request.organizationId,
      request.params.projectId
    );

    return sendSuccess(reply, stages);
  }
);

// ============================================
// Get Single Stage
// ============================================
export const getStage = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: StageParams }>, reply: FastifyReply) => {
    const stage = await stageRepository.findById(request.organizationId, request.params.id);

    if (!stage) {
      return sendNotFound(reply, 'Stage');
    }

    return sendSuccess(reply, stage);
  }
);

// ============================================
// Create Stage
// ============================================
export const createStage = handle(
  'create',
  async (request: FastifyRequest<{ Body: CreateStageInput }>, reply: FastifyReply) => {
    const stage = await stageRepository.create(request.organizationId, request.body);

    return sendSuccess(reply, stage, 201);
  }
);

// ============================================
// Update Stage
// ============================================
export const updateStage = handle(
  'update',
  async (
    request: FastifyRequest<{ Params: StageParams; Body: UpdateStageInput }>,
    reply: FastifyReply
  ) => {
    const stage = await stageRepository.update(
      request.organizationId,
      request.params.id,
      request.body
    );

    return sendSuccess(reply, stage);
  }
);

// ============================================
// Delete Stage
// ============================================
export const deleteStage = handle(
  'delete',
  async (request: FastifyRequest<{ Params: StageParams }>, reply: FastifyReply) => {
    await stageRepository.delete(request.organizationId, request.params.id);
    return sendNoContent(reply);
  }
);

// ============================================
// Get Stage Stats
// ============================================
export const getStageStats = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: StageParams }>, reply: FastifyReply) => {
    const stats = await stageRepository.getStageStats(request.organizationId, request.params.id);

    return sendSuccess(reply, stats);
  }
);
