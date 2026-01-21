/**
 * Permissions API Module
 *
 * Provides functions for fetching permissions.
 * Permissions are global (not organization-specific).
 */

import { api } from './client';
import type { AxiosResponse } from 'axios';
import type { ApiSuccessResponse } from './types';

// ============================================
// Types
// ============================================

export interface Permission {
  id: string;
  key: string;
  name: string;
  description: string | null;
  category: string;
  createdAt: string;
}

export type PermissionsByCategory = Record<string, Permission[]>;

// ============================================
// Permissions API
// ============================================

/**
 * Fetch all permissions
 */
export async function getPermissions(): Promise<Permission[]> {
  const response: AxiosResponse<ApiSuccessResponse<Permission[]>> = await api.get('/permissions');
  return response.data.data;
}

/**
 * Fetch permissions grouped by category
 */
export async function getPermissionsGrouped(): Promise<PermissionsByCategory> {
  const response: AxiosResponse<ApiSuccessResponse<PermissionsByCategory>> = await api.get(
    '/permissions/grouped'
  );
  return response.data.data;
}
