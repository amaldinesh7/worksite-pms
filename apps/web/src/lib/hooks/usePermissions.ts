/**
 * Permissions React Query Hooks
 *
 * Provides hooks for fetching permission data using TanStack Query.
 */

import { useQuery } from '@tanstack/react-query';
import {
  getPermissions,
  getPermissionsGrouped,
  type Permission,
  type PermissionsByCategory,
} from '../api/permissions';

// ============================================
// Query Keys
// ============================================

export const permissionKeys = {
  all: ['permissions'] as const,
  list: () => [...permissionKeys.all, 'list'] as const,
  grouped: () => [...permissionKeys.all, 'grouped'] as const,
};

// ============================================
// Query Hooks
// ============================================

/**
 * Hook to fetch all permissions
 */
export function usePermissions() {
  return useQuery<Permission[], Error>({
    queryKey: permissionKeys.list(),
    queryFn: getPermissions,
    staleTime: 1000 * 60 * 60, // Permissions rarely change, cache for 1 hour
  });
}

/**
 * Hook to fetch permissions grouped by category
 */
export function usePermissionsGrouped() {
  return useQuery<PermissionsByCategory, Error>({
    queryKey: permissionKeys.grouped(),
    queryFn: getPermissionsGrouped,
    staleTime: 1000 * 60 * 60, // Permissions rarely change, cache for 1 hour
  });
}
