/**
 * Roles API Module
 *
 * Provides functions for interacting with the roles endpoints.
 * Roles are organization-specific with associated permissions.
 */

import { api } from './client';
import type { AxiosResponse } from 'axios';
import type { PaginationMeta, ApiPaginatedResponse, PaginatedResult, ApiSuccessResponse } from './types';
import type { Permission } from './permissions';

// ============================================
// Types
// ============================================

export interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  memberCount: number;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleInput {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string | null;
  permissionIds?: string[];
}

export interface RoleQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Re-export pagination types for backward compatibility
export type { PaginationMeta, PaginatedResult };

// ============================================
// Roles API
// ============================================

/**
 * Fetch paginated list of roles with optional filters
 */
export async function getRoles(params?: RoleQueryParams): Promise<PaginatedResult<Role>> {
  const response: AxiosResponse<ApiPaginatedResponse<Role>> = await api.get('/roles', {
    params,
  });
  return response.data.data;
}

/**
 * Fetch a single role by ID
 */
export async function getRole(id: string): Promise<Role> {
  const response: AxiosResponse<ApiSuccessResponse<Role>> = await api.get(`/roles/${id}`);
  return response.data.data;
}

/**
 * Create a new role
 */
export async function createRole(data: CreateRoleInput): Promise<Role> {
  const response: AxiosResponse<ApiSuccessResponse<Role>> = await api.post('/roles', data);
  return response.data.data;
}

/**
 * Update an existing role
 */
export async function updateRole(id: string, data: UpdateRoleInput): Promise<Role> {
  const response: AxiosResponse<ApiSuccessResponse<Role>> = await api.put(`/roles/${id}`, data);
  return response.data.data;
}

/**
 * Delete a role
 */
export async function deleteRole(id: string): Promise<void> {
  await api.delete(`/roles/${id}`);
}
