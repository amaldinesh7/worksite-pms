/**
 * Clients React Query Hooks
 *
 * Provides hooks for fetching and mutating client data using TanStack Query.
 * Wraps the parties API with type='CLIENT' filter.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getClients,
  getClient,
  getClientProjects,
  createClient,
  updateClient,
  type Client,
  type ClientProject,
  type CreateClientInput,
  type UpdateClientInput,
  type ClientQueryParams,
} from '../api/clients';
import type { PaginatedResult } from '../api/types';
import { partyKeys } from './useParties';

// ============================================
// Query Keys
// ============================================

export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (params?: ClientQueryParams) => [...clientKeys.lists(), params] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
  projects: (id: string) => [...clientKeys.all, 'projects', id] as const,
};

// ============================================
// Query Hooks
// ============================================

/**
 * Hook to fetch paginated list of clients
 */
export function useClients(params?: ClientQueryParams) {
  return useQuery<PaginatedResult<Client>, Error>({
    queryKey: clientKeys.list(params),
    queryFn: () => getClients(params),
  });
}

/**
 * Hook to fetch a single client by ID
 */
export function useClient(id: string) {
  return useQuery<Client, Error>({
    queryKey: clientKeys.detail(id),
    queryFn: () => getClient(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch projects for a client
 */
export function useClientProjects(clientId: string) {
  return useQuery<ClientProject[], Error>({
    queryKey: clientKeys.projects(clientId),
    queryFn: () => getClientProjects(clientId),
    enabled: !!clientId,
  });
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Hook to create a new client
 */
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClientInput) => createClient(data),
    onSuccess: () => {
      // Invalidate client queries and party queries (since clients are parties)
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      queryClient.invalidateQueries({ queryKey: partyKeys.all });
    },
  });
}

/**
 * Hook to update an existing client
 */
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientInput }) => updateClient(id, data),
    onSuccess: (_data, variables) => {
      // Invalidate the specific client, all lists, and party queries
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: partyKeys.all });
    },
  });
}
