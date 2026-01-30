/**
 * Tasks API Module
 *
 * Provides functions for interacting with the tasks endpoints.
 */

import { api } from './client';
import type { AxiosResponse } from 'axios';
import type {
  PaginationMeta,
  ApiPaginatedResponse,
  PaginatedResult,
  ApiSuccessResponse,
} from './types';

// ============================================
// Types
// ============================================

export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'BLOCKED';

export interface TaskMemberAssignment {
  id: string;
  memberId: string;
  member: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string | null;
      phone: string | null;
    };
    role: {
      id: string;
      name: string;
      isSystemRole: boolean;
    };
  };
}

export interface TaskPartyAssignment {
  id: string;
  partyId: string;
  party: {
    id: string;
    name: string;
    type: 'LABOUR' | 'SUBCONTRACTOR';
    phone: string | null;
    profilePicture: string | null;
  };
}

export interface Task {
  id: string;
  organizationId: string;
  stageId: string;
  name: string;
  description: string | null;
  daysAllocated: number;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  stage?: {
    id: string;
    name: string;
    projectId: string;
  };
  memberAssignments: TaskMemberAssignment[];
  partyAssignments: TaskPartyAssignment[];
}

export interface CreateTaskInput {
  stageId: string;
  name: string;
  description?: string;
  daysAllocated: number;
  status?: TaskStatus;
  memberIds?: string[];
  partyIds?: string[];
}

export interface UpdateTaskInput {
  name?: string;
  description?: string | null;
  daysAllocated?: number;
  status?: TaskStatus;
  memberIds?: string[];
  partyIds?: string[];
}

export interface UpdateTaskStatusInput {
  status: TaskStatus;
}

export interface TaskQueryParams {
  page?: number;
  limit?: number;
  stageId?: string;
  projectId?: string;
  status?: TaskStatus;
}

// Re-export pagination types for backward compatibility
export type { PaginationMeta, PaginatedResult };

// ============================================
// Tasks API
// ============================================

/**
 * Fetch paginated list of tasks with optional filters
 */
export async function getTasks(params?: TaskQueryParams): Promise<PaginatedResult<Task>> {
  const response: AxiosResponse<ApiPaginatedResponse<Task>> = await api.get('/tasks', {
    params,
  });
  return response.data.data;
}

/**
 * Fetch tasks by stage ID
 */
export async function getTasksByStage(stageId: string): Promise<Task[]> {
  const response: AxiosResponse<ApiSuccessResponse<Task[]>> = await api.get(
    `/tasks/stage/${stageId}`
  );
  return response.data.data;
}

/**
 * Fetch tasks by project ID
 */
export async function getTasksByProject(projectId: string): Promise<Task[]> {
  const response: AxiosResponse<ApiSuccessResponse<Task[]>> = await api.get(
    `/tasks/project/${projectId}`
  );
  return response.data.data;
}

/**
 * Fetch a single task by ID
 */
export async function getTask(id: string): Promise<Task> {
  const response: AxiosResponse<ApiSuccessResponse<Task>> = await api.get(`/tasks/${id}`);
  return response.data.data;
}

/**
 * Create a new task
 */
export async function createTask(data: CreateTaskInput): Promise<Task> {
  const response: AxiosResponse<ApiSuccessResponse<Task>> = await api.post('/tasks', data);
  return response.data.data;
}

/**
 * Update an existing task
 */
export async function updateTask(id: string, data: UpdateTaskInput): Promise<Task> {
  const response: AxiosResponse<ApiSuccessResponse<Task>> = await api.put(`/tasks/${id}`, data);
  return response.data.data;
}

/**
 * Update task status
 */
export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  const response: AxiosResponse<ApiSuccessResponse<Task>> = await api.put(`/tasks/${id}/status`, {
    status,
  });
  return response.data.data;
}

/**
 * Delete a task
 */
export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`);
}
