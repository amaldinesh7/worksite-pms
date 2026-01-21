/**
 * Team API Module
 *
 * Provides functions for interacting with the team endpoints.
 * Team members are users within an organization with assigned roles.
 */

import { api } from './client';
import type { AxiosResponse } from 'axios';
import type { PaginationMeta, ApiPaginatedResponse, PaginatedResult, ApiSuccessResponse } from './types';

// ============================================
// Types
// ============================================

export interface TeamMemberRole {
  id: string;
  name: string;
  isSystemRole: boolean;
}

export interface TeamMemberMembership {
  id: string;
  roleId: string;
  role: TeamMemberRole;
}

export interface TeamMember {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  location: string | null;
  createdAt: string;
  membership: TeamMemberMembership;
}

export interface CreateTeamMemberInput {
  name: string;
  phone?: string;
  email?: string;
  location?: string;
  roleId: string;
}

export interface UpdateTeamMemberInput {
  name?: string;
  phone?: string | null;
  email?: string | null;
  location?: string | null;
  roleId?: string;
}

export interface TeamMemberQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
}

// Re-export pagination types for backward compatibility
export type { PaginationMeta, PaginatedResult };

// ============================================
// Team API
// ============================================

/**
 * Fetch paginated list of team members with optional filters
 */
export async function getTeamMembers(params?: TeamMemberQueryParams): Promise<PaginatedResult<TeamMember>> {
  const response: AxiosResponse<ApiPaginatedResponse<TeamMember>> = await api.get('/team', {
    params,
  });
  return response.data.data;
}

/**
 * Fetch a single team member by ID
 */
export async function getTeamMember(id: string): Promise<TeamMember> {
  const response: AxiosResponse<ApiSuccessResponse<TeamMember>> = await api.get(`/team/${id}`);
  return response.data.data;
}

/**
 * Create a new team member
 */
export async function createTeamMember(data: CreateTeamMemberInput): Promise<TeamMember> {
  const response: AxiosResponse<ApiSuccessResponse<TeamMember>> = await api.post('/team', data);
  return response.data.data;
}

/**
 * Update an existing team member
 */
export async function updateTeamMember(id: string, data: UpdateTeamMemberInput): Promise<TeamMember> {
  const response: AxiosResponse<ApiSuccessResponse<TeamMember>> = await api.put(`/team/${id}`, data);
  return response.data.data;
}

/**
 * Delete a team member
 */
export async function deleteTeamMember(id: string): Promise<void> {
  await api.delete(`/team/${id}`);
}
