/**
 * Member Advances React Query Hooks
 *
 * Provides hooks for fetching and mutating member advance data using TanStack Query.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMemberAdvances,
  getMemberAdvance,
  createMemberAdvance,
  updateMemberAdvance,
  deleteMemberAdvance,
  getMemberAdvanceSummary,
  getProjectMemberAdvanceSummaries,
  getProjectMembers,
  getMemberBalancesAcrossProjects,
  getMemberTotalBalance,
  type MemberAdvance,
  type MemberAdvancesResponse,
  type MemberAdvanceSummary,
  type ProjectMember,
  type MemberProjectBalance,
  type CreateMemberAdvanceInput,
  type UpdateMemberAdvanceInput,
  type MemberAdvanceQueryParams,
} from '../api/member-advances';

// ============================================
// Query Keys
// ============================================

export const memberAdvanceKeys = {
  all: ['member-advances'] as const,
  lists: () => [...memberAdvanceKeys.all, 'list'] as const,
  list: (params?: MemberAdvanceQueryParams) => [...memberAdvanceKeys.lists(), params] as const,
  details: () => [...memberAdvanceKeys.all, 'detail'] as const,
  detail: (id: string) => [...memberAdvanceKeys.details(), id] as const,
  memberSummary: (projectId: string, memberId: string) =>
    [...memberAdvanceKeys.all, 'member-summary', projectId, memberId] as const,
  projectSummaries: (projectId: string) =>
    [...memberAdvanceKeys.all, 'project-summaries', projectId] as const,
  projectMembers: (projectId: string) =>
    [...memberAdvanceKeys.all, 'project-members', projectId] as const,
  memberBalances: (memberId: string) =>
    [...memberAdvanceKeys.all, 'member-balances', memberId] as const,
  memberTotalBalance: (memberId: string) =>
    [...memberAdvanceKeys.all, 'member-total-balance', memberId] as const,
};

// ============================================
// Query Hooks
// ============================================

/**
 * Hook to fetch paginated list of member advances with optional filters
 */
export function useMemberAdvances(params?: MemberAdvanceQueryParams) {
  return useQuery<MemberAdvancesResponse, Error>({
    queryKey: memberAdvanceKeys.list(params),
    queryFn: () => getMemberAdvances(params),
  });
}

/**
 * Hook to fetch a single member advance by ID
 */
export function useMemberAdvance(id: string) {
  return useQuery<MemberAdvance, Error>({
    queryKey: memberAdvanceKeys.detail(id),
    queryFn: () => getMemberAdvance(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch member advance summary for a specific member
 */
export function useMemberAdvanceSummary(projectId: string, memberId: string) {
  return useQuery<MemberAdvanceSummary, Error>({
    queryKey: memberAdvanceKeys.memberSummary(projectId, memberId),
    queryFn: () => getMemberAdvanceSummary(projectId, memberId),
    enabled: !!projectId && !!memberId,
  });
}

/**
 * Hook to fetch all members' advance summaries for a project
 */
export function useProjectMemberAdvanceSummaries(projectId: string) {
  return useQuery<MemberAdvanceSummary[], Error>({
    queryKey: memberAdvanceKeys.projectSummaries(projectId),
    queryFn: () => getProjectMemberAdvanceSummaries(projectId),
    enabled: !!projectId,
  });
}

/**
 * Hook to fetch project members for dropdown
 */
export function useProjectMembers(projectId: string) {
  return useQuery<ProjectMember[], Error>({
    queryKey: memberAdvanceKeys.projectMembers(projectId),
    queryFn: () => getProjectMembers(projectId),
    enabled: !!projectId,
  });
}

/**
 * Hook to fetch member balances across all projects
 */
export function useMemberBalancesAcrossProjects(memberId: string) {
  return useQuery<MemberProjectBalance[], Error>({
    queryKey: memberAdvanceKeys.memberBalances(memberId),
    queryFn: () => getMemberBalancesAcrossProjects(memberId),
    enabled: !!memberId,
  });
}

/**
 * Hook to fetch member total balance across all projects
 */
export function useMemberTotalBalance(memberId: string) {
  return useQuery<number, Error>({
    queryKey: memberAdvanceKeys.memberTotalBalance(memberId),
    queryFn: () => getMemberTotalBalance(memberId),
    enabled: !!memberId,
  });
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Hook to create a new member advance
 */
export function useCreateMemberAdvance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMemberAdvanceInput) => createMemberAdvance(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: memberAdvanceKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: memberAdvanceKeys.memberSummary(variables.projectId, variables.memberId),
      });
      queryClient.invalidateQueries({
        queryKey: memberAdvanceKeys.projectSummaries(variables.projectId),
      });
    },
  });
}

/**
 * Hook to update an existing member advance
 */
export function useUpdateMemberAdvance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMemberAdvanceInput }) =>
      updateMemberAdvance(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: memberAdvanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: memberAdvanceKeys.detail(id) });
      // Invalidate all summaries as we don't know which project/member this belongs to
      queryClient.invalidateQueries({ queryKey: ['member-advances'] });
    },
  });
}

/**
 * Hook to delete a member advance
 */
export function useDeleteMemberAdvance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMemberAdvance(id),
    onSuccess: () => {
      // Invalidate all member advance-related queries
      queryClient.invalidateQueries({ queryKey: ['member-advances'] });
    },
  });
}
