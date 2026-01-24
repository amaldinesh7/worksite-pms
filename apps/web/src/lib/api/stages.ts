/**
 * Stages API Module
 *
 * Provides functions for interacting with the stages endpoints.
 */

import { api } from './client';
import type { AxiosResponse } from 'axios';
import type { PaginationMeta, ApiPaginatedResponse, PaginatedResult, ApiSuccessResponse } from './types';

// ============================================
// Types
// ============================================

export type StageStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD';

export interface StageMemberAssignment {
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

export interface StagePartyAssignment {
  id: string;
  partyId: string;
  party: {
    id: string;
    name: string;
    type: string;
    phone: string | null;
    profilePicture: string | null;
  };
}

export interface Stage {
  id: string;
  organizationId: string;
  projectId: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  budgetAmount: number;
  weight: number;
  status: StageStatus;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
  };
  memberAssignments: StageMemberAssignment[];
  partyAssignments: StagePartyAssignment[];
  _count?: {
    tasks: number;
    expenses: number;
  };
}

export interface StageStats {
  budgetAmount: number;
  totalExpenses: number;
  remaining: number;
  percentUsed: number;
  taskCount: number;
  completedTaskCount: number;
  taskProgress: number;
}

export interface CreateStageInput {
  projectId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  budgetAmount: number;
  weight: number;
  status?: StageStatus;
  memberIds?: string[];
  partyIds?: string[];
}

export interface UpdateStageInput {
  name?: string;
  description?: string | null;
  startDate?: string;
  endDate?: string;
  budgetAmount?: number;
  weight?: number;
  status?: StageStatus;
  memberIds?: string[];
  partyIds?: string[];
}

export interface StageQueryParams {
  page?: number;
  limit?: number;
  projectId?: string;
  status?: StageStatus;
}

// Re-export pagination types for backward compatibility
export type { PaginationMeta, PaginatedResult };

// ============================================
// Stages API
// ============================================

/**
 * Fetch paginated list of stages with optional filters
 */
export async function getStages(params?: StageQueryParams): Promise<PaginatedResult<Stage>> {
  const response: AxiosResponse<ApiPaginatedResponse<Stage>> = await api.get('/stages', {
    params,
  });
  return response.data.data;
}

/**
 * Fetch stages by project ID
 */
export async function getStagesByProject(projectId: string): Promise<Stage[]> {
  const response: AxiosResponse<ApiSuccessResponse<Stage[]>> = await api.get(
    `/stages/project/${projectId}`
  );
  return response.data.data;
}

/**
 * Fetch a single stage by ID
 */
export async function getStage(id: string): Promise<Stage> {
  const response: AxiosResponse<ApiSuccessResponse<Stage>> = await api.get(`/stages/${id}`);
  return response.data.data;
}

/**
 * Fetch stage statistics
 */
export async function getStageStats(id: string): Promise<StageStats> {
  const response: AxiosResponse<ApiSuccessResponse<StageStats>> = await api.get(
    `/stages/${id}/stats`
  );
  return response.data.data;
}

/**
 * Create a new stage
 */
export async function createStage(data: CreateStageInput): Promise<Stage> {
  const response: AxiosResponse<ApiSuccessResponse<Stage>> = await api.post('/stages', data);
  return response.data.data;
}

/**
 * Update an existing stage
 */
export async function updateStage(id: string, data: UpdateStageInput): Promise<Stage> {
  const response: AxiosResponse<ApiSuccessResponse<Stage>> = await api.put(`/stages/${id}`, data);
  return response.data.data;
}

/**
 * Delete a stage
 */
export async function deleteStage(id: string): Promise<void> {
  await api.delete(`/stages/${id}`);
}
