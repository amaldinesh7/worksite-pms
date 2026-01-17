/**
 * Parties React Query Hooks
 *
 * Provides hooks for fetching and mutating party data using TanStack Query.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getParties,
  getParty,
  getPartyStats,
  getPartiesSummary,
  getPartyProjects,
  getPartyTransactions,
  createParty,
  updateParty,
  deleteParty,
  type Party,
  type PartyStats,
  type PartySummary,
  type PartyProjectsResponse,
  type PartyTransaction,
  type PartyTransactionsParams,
  type CreatePartyInput,
  type UpdatePartyInput,
  type PartyQueryParams,
  type PaginatedResult,
} from '../api/parties';

// ============================================
// Query Keys
// ============================================

export const partyKeys = {
  all: ['parties'] as const,
  lists: () => [...partyKeys.all, 'list'] as const,
  list: (params?: PartyQueryParams) => [...partyKeys.lists(), params] as const,
  details: () => [...partyKeys.all, 'detail'] as const,
  detail: (id: string) => [...partyKeys.details(), id] as const,
  stats: (id: string) => [...partyKeys.all, 'stats', id] as const,
  summary: () => [...partyKeys.all, 'summary'] as const,
  projects: (id: string) => [...partyKeys.all, 'projects', id] as const,
  transactions: (id: string, params?: PartyTransactionsParams) =>
    [...partyKeys.all, 'transactions', id, params] as const,
};

// ============================================
// Query Hooks
// ============================================

/**
 * Hook to fetch paginated list of parties with optional filters
 */
export function useParties(params?: PartyQueryParams) {
  return useQuery<PaginatedResult<Party>, Error>({
    queryKey: partyKeys.list(params),
    queryFn: () => getParties(params),
  });
}

/**
 * Hook to fetch a single party by ID
 */
export function useParty(id: string) {
  return useQuery<Party, Error>({
    queryKey: partyKeys.detail(id),
    queryFn: () => getParty(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch party statistics (expenses, payments, balance)
 */
export function usePartyStats(id: string) {
  return useQuery<PartyStats, Error>({
    queryKey: partyKeys.stats(id),
    queryFn: () => getPartyStats(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch summary of all parties by type (for stats cards)
 */
export function usePartiesSummary() {
  return useQuery<PartySummary, Error>({
    queryKey: partyKeys.summary(),
    queryFn: getPartiesSummary,
  });
}

/**
 * Hook to fetch party projects with credit calculations
 */
export function usePartyProjects(partyId: string) {
  return useQuery<PartyProjectsResponse, Error>({
    queryKey: partyKeys.projects(partyId),
    queryFn: () => getPartyProjects(partyId),
    enabled: !!partyId,
  });
}

/**
 * Hook to fetch party transactions (payments or expenses)
 */
export function usePartyTransactions(partyId: string, params?: PartyTransactionsParams) {
  return useQuery<PaginatedResult<PartyTransaction>, Error>({
    queryKey: partyKeys.transactions(partyId, params),
    queryFn: () => getPartyTransactions(partyId, params),
    enabled: !!partyId,
  });
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Hook to create a new party
 */
export function useCreateParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePartyInput) => createParty(data),
    onSuccess: () => {
      // Invalidate all party queries to refetch
      queryClient.invalidateQueries({ queryKey: partyKeys.all });
    },
  });
}

/**
 * Hook to update an existing party
 */
export function useUpdateParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePartyInput }) => updateParty(id, data),
    onSuccess: (_data, variables) => {
      // Invalidate the specific party and all lists
      queryClient.invalidateQueries({ queryKey: partyKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: partyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: partyKeys.summary() });
    },
  });
}

/**
 * Hook to delete a party
 */
export function useDeleteParty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteParty(id),
    onSuccess: () => {
      // Invalidate all party queries
      queryClient.invalidateQueries({ queryKey: partyKeys.all });
    },
  });
}
