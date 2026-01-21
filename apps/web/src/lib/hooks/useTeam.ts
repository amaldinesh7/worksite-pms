/**
 * Team React Query Hooks
 *
 * Provides hooks for fetching and mutating team member data using TanStack Query.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTeamMembers,
  getTeamMember,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  type TeamMember,
  type CreateTeamMemberInput,
  type UpdateTeamMemberInput,
  type TeamMemberQueryParams,
  type PaginatedResult,
} from '../api/team';

// ============================================
// Query Keys
// ============================================

export const teamKeys = {
  all: ['team'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  list: (params?: TeamMemberQueryParams) => [...teamKeys.lists(), params] as const,
  details: () => [...teamKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamKeys.details(), id] as const,
};

// ============================================
// Query Hooks
// ============================================

/**
 * Hook to fetch paginated list of team members with optional filters
 */
export function useTeamMembers(params?: TeamMemberQueryParams) {
  return useQuery<PaginatedResult<TeamMember>, Error>({
    queryKey: teamKeys.list(params),
    queryFn: () => getTeamMembers(params),
  });
}

/**
 * Hook to fetch a single team member by ID
 */
export function useTeamMember(id: string) {
  return useQuery<TeamMember, Error>({
    queryKey: teamKeys.detail(id),
    queryFn: () => getTeamMember(id),
    enabled: !!id,
  });
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Hook to create a new team member
 */
export function useCreateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTeamMemberInput) => createTeamMember(data),
    onSuccess: () => {
      // Invalidate all team queries to refetch
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

/**
 * Hook to update an existing team member
 */
export function useUpdateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTeamMemberInput }) =>
      updateTeamMember(id, data),
    onSuccess: (_data, variables) => {
      // Invalidate the specific team member and all lists
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
}

/**
 * Hook to delete a team member
 */
export function useDeleteTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTeamMember(id),
    onSuccess: () => {
      // Invalidate all team queries
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}
