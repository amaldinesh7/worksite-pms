/**
 * Roles React Query Hooks
 *
 * Provides hooks for fetching and mutating role data using TanStack Query.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  type Role,
  type CreateRoleInput,
  type UpdateRoleInput,
  type RoleQueryParams,
  type PaginatedResult,
} from '../api/roles';

// ============================================
// Query Keys
// ============================================

export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (params?: RoleQueryParams) => [...roleKeys.lists(), params] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
};

// ============================================
// Query Hooks
// ============================================

/**
 * Hook to fetch paginated list of roles with optional filters
 */
export function useRoles(params?: RoleQueryParams) {
  return useQuery<PaginatedResult<Role>, Error>({
    queryKey: roleKeys.list(params),
    queryFn: () => getRoles(params),
  });
}

/**
 * Hook to fetch a single role by ID
 */
export function useRole(id: string) {
  return useQuery<Role, Error>({
    queryKey: roleKeys.detail(id),
    queryFn: () => getRole(id),
    enabled: !!id,
  });
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Hook to create a new role
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleInput) => createRole(data),
    onSuccess: () => {
      // Invalidate all role queries to refetch
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}

/**
 * Hook to update an existing role
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleInput }) => updateRole(id, data),
    onSuccess: (_data, variables) => {
      // Invalidate the specific role and all lists
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
}

/**
 * Hook to delete a role
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      // Invalidate all role queries
      queryClient.invalidateQueries({ queryKey: roleKeys.all });
    },
  });
}
