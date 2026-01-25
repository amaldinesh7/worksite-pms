/**
 * Stages React Query Hooks
 *
 * Provides hooks for fetching and mutating stage data using TanStack Query.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getStages,
  getStagesByProject,
  getStage,
  getStageStats,
  createStage,
  updateStage,
  deleteStage,
  type Stage,
  type StageStats,
  type CreateStageInput,
  type UpdateStageInput,
  type StageQueryParams,
  type PaginatedResult,
} from '../api/stages';

// ============================================
// Query Keys
// ============================================

export const stageKeys = {
  all: ['stages'] as const,
  lists: () => [...stageKeys.all, 'list'] as const,
  list: (params?: StageQueryParams) => [...stageKeys.lists(), params] as const,
  byProject: (projectId: string) => [...stageKeys.all, 'project', projectId] as const,
  details: () => [...stageKeys.all, 'detail'] as const,
  detail: (id: string) => [...stageKeys.details(), id] as const,
  stats: (id: string) => [...stageKeys.all, 'stats', id] as const,
};

// ============================================
// Query Hooks
// ============================================

/**
 * Hook to fetch paginated list of stages with optional filters
 */
export function useStages(params?: StageQueryParams) {
  return useQuery<PaginatedResult<Stage>, Error>({
    queryKey: stageKeys.list(params),
    queryFn: () => getStages(params),
  });
}

/**
 * Hook to fetch stages by project ID
 */
export function useStagesByProject(projectId: string) {
  return useQuery<Stage[], Error>({
    queryKey: stageKeys.byProject(projectId),
    queryFn: () => getStagesByProject(projectId),
    enabled: !!projectId,
  });
}

/**
 * Hook to fetch a single stage by ID
 */
export function useStage(id: string) {
  return useQuery<Stage, Error>({
    queryKey: stageKeys.detail(id),
    queryFn: () => getStage(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch stage statistics
 */
export function useStageStats(id: string) {
  return useQuery<StageStats, Error>({
    queryKey: stageKeys.stats(id),
    queryFn: () => getStageStats(id),
    enabled: !!id,
  });
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Hook to create a new stage
 */
export function useCreateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStageInput) => createStage(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: stageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: stageKeys.byProject(variables.projectId) });
    },
  });
}

/**
 * Hook to update an existing stage
 */
export function useUpdateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStageInput }) => updateStage(id, data),
    onSuccess: (stage) => {
      queryClient.invalidateQueries({ queryKey: stageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: stageKeys.detail(stage.id) });
      queryClient.invalidateQueries({ queryKey: stageKeys.byProject(stage.projectId) });
      queryClient.invalidateQueries({ queryKey: stageKeys.stats(stage.id) });
    },
  });
}

/**
 * Hook to delete a stage
 */
export function useDeleteStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; projectId: string }) => deleteStage(id),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: stageKeys.lists() });
      queryClient.invalidateQueries({ queryKey: stageKeys.byProject(projectId) });
    },
  });
}
