import type { FastifyReply, FastifyRequest } from 'fastify';
import { taskRepository } from '../../repositories/task.repository';
import { createErrorHandler } from '../../lib/error-handler';
import {
  sendSuccess,
  sendPaginated,
  sendNotFound,
  sendNoContent,
  buildPagination,
} from '../../lib/response.utils';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  UpdateTaskStatusInput,
  TaskQuery,
  TaskParams,
  StageParams,
  ProjectParams,
} from './task.schema';

const handle = createErrorHandler('task');

// ============================================
// List Tasks
// ============================================
export const listTasks = handle(
  'fetch',
  async (request: FastifyRequest<{ Querystring: TaskQuery }>, reply: FastifyReply) => {
    const { page, limit, stageId, projectId, status } = request.query;
    const skip = (page - 1) * limit;

    const { tasks, total } = await taskRepository.findAll(request.organizationId, {
      skip,
      take: limit,
      stageId,
      projectId,
      status,
    });

    return sendPaginated(reply, tasks, buildPagination(page, limit, total));
  }
);

// ============================================
// Get Tasks by Stage
// ============================================
export const getTasksByStage = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: StageParams }>, reply: FastifyReply) => {
    const tasks = await taskRepository.findByStage(request.organizationId, request.params.stageId);

    return sendSuccess(reply, tasks);
  }
);

// ============================================
// Get Tasks by Project
// ============================================
export const getTasksByProject = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: ProjectParams }>, reply: FastifyReply) => {
    const tasks = await taskRepository.findByProject(
      request.organizationId,
      request.params.projectId
    );

    return sendSuccess(reply, tasks);
  }
);

// ============================================
// Get Single Task
// ============================================
export const getTask = handle(
  'fetch',
  async (request: FastifyRequest<{ Params: TaskParams }>, reply: FastifyReply) => {
    const task = await taskRepository.findById(request.organizationId, request.params.id);

    if (!task) {
      return sendNotFound(reply, 'Task');
    }

    return sendSuccess(reply, task);
  }
);

// ============================================
// Create Task
// ============================================
export const createTask = handle(
  'create',
  async (request: FastifyRequest<{ Body: CreateTaskInput }>, reply: FastifyReply) => {
    const task = await taskRepository.create(request.organizationId, request.body);

    return sendSuccess(reply, task, 201);
  }
);

// ============================================
// Update Task
// ============================================
export const updateTask = handle(
  'update',
  async (
    request: FastifyRequest<{ Params: TaskParams; Body: UpdateTaskInput }>,
    reply: FastifyReply
  ) => {
    const task = await taskRepository.update(
      request.organizationId,
      request.params.id,
      request.body
    );

    return sendSuccess(reply, task);
  }
);

// ============================================
// Update Task Status
// ============================================
export const updateTaskStatus = handle(
  'update',
  async (
    request: FastifyRequest<{ Params: TaskParams; Body: UpdateTaskStatusInput }>,
    reply: FastifyReply
  ) => {
    const task = await taskRepository.updateStatus(
      request.organizationId,
      request.params.id,
      request.body.status
    );

    return sendSuccess(reply, task);
  }
);

// ============================================
// Delete Task
// ============================================
export const deleteTask = handle(
  'delete',
  async (request: FastifyRequest<{ Params: TaskParams }>, reply: FastifyReply) => {
    await taskRepository.delete(request.organizationId, request.params.id);
    return sendNoContent(reply);
  }
);
