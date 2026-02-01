/**
 * Projects API Module
 *
 * Provides functions for interacting with the projects endpoints.
 */

import { api } from './client';
import type { AxiosResponse } from 'axios';
import type { PaginationMeta, ApiSuccessResponse } from './types';

// ============================================
// Types
// ============================================

export type ProjectStatus = 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';

export interface ProjectMember {
  id: string;
  memberId: string;
  projectId: string;
  createdAt: string;
  member: {
    id: string;
    userId: string;
    role: string;
    user: {
      id: string;
      name: string;
      phone: string | null;
      email: string | null;
    };
  };
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  clientId: string | null;
  location: string;
  startDate: string;
  endDate: string | null;
  amount: number | null;
  projectTypeItemId: string;
  area: string | null;
  projectPicture: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  progress?: number;
  projectType: {
    id: string;
    name: string;
  };
  client: {
    id: string;
    name: string;
    phone?: string | null;
    location?: string;
  } | null;
  projectAccess: ProjectMember[];
  _count: {
    expenses: number;
    payments: number;
  };
}

export interface ProjectStats {
  totalExpenses: number;
  totalPayments: number;
  totalPaymentsIn: number;
  totalPaymentsOut: number;
  balance: number;
}

export interface ProjectCounts {
  all: number;
  active: number;
  onHold: number;
  completed: number;
}

export interface ProjectsResponse {
  items: Project[];
  pagination: PaginationMeta;
  counts: ProjectCounts;
}

export interface CreateProjectInput {
  name: string;
  clientId?: string;
  location: string;
  startDate: string;
  endDate?: string;
  amount?: number;
  projectTypeItemId: string;
  area?: string;
  projectPicture?: string;
  status?: ProjectStatus;
  memberIds?: string[];
}

export interface UpdateProjectInput {
  name?: string;
  clientId?: string | null;
  location?: string;
  startDate?: string;
  endDate?: string | null;
  amount?: number | null;
  projectTypeItemId?: string;
  area?: string | null;
  projectPicture?: string | null;
  status?: ProjectStatus;
  memberIds?: string[];
}

export interface ProjectQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProjectStatus;
}

// ============================================
// Projects API
// ============================================

/**
 * Fetch paginated list of projects with optional filters
 */
export async function getProjects(params?: ProjectQueryParams): Promise<ProjectsResponse> {
  const response: AxiosResponse<ApiSuccessResponse<ProjectsResponse>> = await api.get('/projects', {
    params,
  });
  return response.data.data;
}

/**
 * Fetch a single project by ID
 */
export async function getProject(id: string): Promise<Project> {
  const response: AxiosResponse<ApiSuccessResponse<Project>> = await api.get(`/projects/${id}`);
  return response.data.data;
}

/**
 * Get project statistics (expenses, payments, balance)
 */
export async function getProjectStats(id: string): Promise<ProjectStats> {
  const response: AxiosResponse<ApiSuccessResponse<ProjectStats>> = await api.get(
    `/projects/${id}/stats`
  );
  return response.data.data;
}

/**
 * Create a new project
 */
export async function createProject(data: CreateProjectInput): Promise<Project> {
  const response: AxiosResponse<ApiSuccessResponse<Project>> = await api.post('/projects', data);
  return response.data.data;
}

/**
 * Update an existing project
 */
export async function updateProject(id: string, data: UpdateProjectInput): Promise<Project> {
  const response: AxiosResponse<ApiSuccessResponse<Project>> = await api.put(
    `/projects/${id}`,
    data
  );
  return response.data.data;
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<void> {
  await api.delete(`/projects/${id}`);
}

// ============================================
// Project Members API
// ============================================

/**
 * Get project members
 */
export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const response: AxiosResponse<ApiSuccessResponse<ProjectMember[]>> = await api.get(
    `/projects/${projectId}/members`
  );
  return response.data.data;
}

/**
 * Add member to project
 */
export async function addProjectMember(
  projectId: string,
  memberId: string
): Promise<ProjectMember> {
  const response: AxiosResponse<ApiSuccessResponse<ProjectMember>> = await api.post(
    `/projects/${projectId}/members`,
    { memberId }
  );
  return response.data.data;
}

/**
 * Remove member from project
 */
export async function removeProjectMember(projectId: string, memberId: string): Promise<void> {
  await api.delete(`/projects/${projectId}/members/${memberId}`);
}
