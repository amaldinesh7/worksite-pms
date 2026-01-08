import type { FastifyReply, FastifyRequest } from 'fastify';
import { projectRepository } from '../../repositories/project.repository';
import { createErrorHandler } from '../../lib/error-handler';
import {
  sendSuccess,
  sendPaginated,
  sendNotFound,
  sendNoContent,
  buildPagination,
} from '../../lib/response.utils';
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectQuery,
  ProjectParams,
} from './project.schema';

const handle = createErrorHandler('project');

// ============================================
// List Projects
// ============================================
export const listProjects = handle(
  'fetch',
  async (request: FastifyRequest<{ Querystring: ProjectQuery }>, reply: FastifyReply) => {
    const { page, limit, search } = request.query;
    const skip = (page - 1) * limit;

    const { projects, total } = await projectRepository.findAll(request.organizationId, {
      skip,
      take: limit,
      search,
    });

    return sendPaginated(reply, projects, buildPagination(page, limit, total));
  }
);

// ============================================
// Get Single Project
// ============================================
export const getProject = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: ProjectParams }>, reply: FastifyReply) => {
    const project = await projectRepository.findById(request.organizationId, request.params.id);

    if (!project) {
      return sendNotFound(reply, 'Project');
    }

    return sendSuccess(reply, project);
  }
);

// ============================================
// Create Project
// ============================================
export const createProject = handle(
  'create',
  async (request: FastifyRequest<{ Body: CreateProjectInput }>, reply: FastifyReply) => {
    const project = await projectRepository.create(request.organizationId, {
      ...request.body,
      startDate: new Date(request.body.startDate),
    });

    return sendSuccess(reply, project, 201);
  }
);

// ============================================
// Update Project
// ============================================
export const updateProject = handle(
  'update',
  async (
    request: FastifyRequest<{ Params: ProjectParams; Body: UpdateProjectInput }>,
    reply: FastifyReply
  ) => {
    const updateData = {
      ...request.body,
      startDate: request.body.startDate ? new Date(request.body.startDate) : undefined,
    };

    const project = await projectRepository.update(
      request.organizationId,
      request.params.id,
      updateData
    );

    return sendSuccess(reply, project);
  }
);

// ============================================
// Delete Project
// ============================================
export const deleteProject = handle(
  'delete',
  async (request: FastifyRequest<{ Params: ProjectParams }>, reply: FastifyReply) => {
    await projectRepository.delete(request.organizationId, request.params.id);
    return sendNoContent(reply);
  }
);

// ============================================
// Get Project Stats
// ============================================
export const getProjectStats = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: ProjectParams }>, reply: FastifyReply) => {
    const stats = await projectRepository.getProjectStats(
      request.organizationId,
      request.params.id
    );

    return sendSuccess(reply, stats);
  }
);
