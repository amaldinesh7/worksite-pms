/**
 * Organizations API Module
 *
 * Provides functions for interacting with organization endpoints.
 */

import { api } from './client';
import type { AxiosResponse } from 'axios';
import type { ApiSuccessResponse } from './types';

// ============================================
// Types
// ============================================

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: 'ADMIN' | 'MANAGER' | 'ACCOUNTANT' | 'SUPERVISOR' | 'CLIENT';
  createdAt: string;
  user: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
  };
}

// ============================================
// Organizations API
// ============================================

/**
 * Fetch organization members
 */
export async function getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
  const response: AxiosResponse<ApiSuccessResponse<OrganizationMember[]>> = await api.get(
    `/organizations/${organizationId}/members`
  );
  return response.data.data;
}
