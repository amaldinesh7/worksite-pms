import type { FastifyReply, FastifyRequest } from 'fastify';
import { projectRepository } from '../../repositories/project.repository';
import { createErrorHandler } from '../../lib/error-handler';
import {
  sendSuccess,
  sendNotFound,
  sendNoContent,
  buildPagination,
} from '../../lib/response.utils';
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectQuery,
  ProjectParams,
  AddProjectMemberInput,
  ProjectMemberParams,
} from './project.schema';

const handle = createErrorHandler('project');

// ============================================
// List Projects
// ============================================
export const listProjects = handle(
  'fetch',
  async (request: FastifyRequest<{ Querystring: ProjectQuery }>, reply: FastifyReply) => {
    const { page, limit, search, status } = request.query;
    const skip = (page - 1) * limit;

    const { projects, total, counts } = await projectRepository.findAll(request.organizationId, {
      skip,
      take: limit,
      search,
      status,
    });

    // Add progress to each project
    const projectsWithProgress = await Promise.all(
      projects.map(async (project) => {
        const progress = await projectRepository.calculateProgress(
          request.organizationId,
          project.id
        );
        return { ...project, progress };
      })
    );

    return sendSuccess(reply, {
      items: projectsWithProgress,
      pagination: buildPagination(page, limit, total),
      counts,
    });
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
    const { startDate, endDate, ...rest } = request.body;
    
    const project = await projectRepository.create(request.organizationId, {
      ...rest,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : undefined,
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
    const { startDate, endDate, ...rest } = request.body;
    
    const updateData = {
      ...rest,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : endDate === null ? null : undefined,
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

// ============================================
// Project Members Management
// ============================================

export const getProjectMembers = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: ProjectParams }>, reply: FastifyReply) => {
    const members = await projectRepository.getProjectMembers(
      request.organizationId,
      request.params.id
    );

    return sendSuccess(reply, members);
  }
);

export const addProjectMember = handle(
  'create',
  async (
    request: FastifyRequest<{ Params: ProjectParams; Body: AddProjectMemberInput }>,
    reply: FastifyReply
  ) => {
    const access = await projectRepository.addMember(
      request.organizationId,
      request.params.id,
      request.body.memberId
    );

    return sendSuccess(reply, access, 201);
  }
);

export const removeProjectMember = handle(
  'delete',
  async (request: FastifyRequest<{ Params: ProjectMemberParams }>, reply: FastifyReply) => {
    await projectRepository.removeMember(
      request.organizationId,
      request.params.id,
      request.params.memberId
    );

    return sendNoContent(reply);
  }
);
