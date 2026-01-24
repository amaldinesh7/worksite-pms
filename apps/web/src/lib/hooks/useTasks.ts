/**
 * Tasks React Query Hooks
 *
 * Provides hooks for fetching and mutating task data using TanStack Query.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTasks,
  getTasksByStage,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  type Task,
  type TaskStatus,
  type CreateTaskInput,
  type UpdateTaskInput,
  type TaskQueryParams,
  type PaginatedResult,
} from '../api/tasks';
import { stageKeys } from './useStages';

// ============================================
// Query Keys
// ============================================

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (params?: TaskQueryParams) => [...taskKeys.lists(), params] as const,
  byStage: (stageId: string) => [...taskKeys.all, 'stage', stageId] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
};

// ============================================
// Query Hooks
// ============================================

/**
 * Hook to fetch paginated list of tasks with optional filters
 */
export function useTasks(params?: TaskQueryParams) {
  return useQuery<PaginatedResult<Task>, Error>({
    queryKey: taskKeys.list(params),
    queryFn: () => getTasks(params),
  });
}

/**
 * Hook to fetch tasks by stage ID
 */
export function useTasksByStage(stageId: string) {
  return useQuery<Task[], Error>({
    queryKey: taskKeys.byStage(stageId),
    queryFn: () => getTasksByStage(stageId),
    enabled: !!stageId,
  });
}

/**
 * Hook to fetch a single task by ID
 */
export function useTask(id: string) {
  return useQuery<Task, Error>({
    queryKey: taskKeys.detail(id),
    queryFn: () => getTask(id),
    enabled: !!id,
  });
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Hook to create a new task
 */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskInput) => createTask(data),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.byStage(task.stageId) });
      // Also invalidate stage stats since task count changed
      queryClient.invalidateQueries({ queryKey: stageKeys.stats(task.stageId) });
      queryClient.invalidateQueries({ queryKey: stageKeys.detail(task.stageId) });
    },
  });
}

/**
 * Hook to update an existing task
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) => updateTask(id, data),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(task.id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.byStage(task.stageId) });
      // Invalidate stage stats if status changed
      queryClient.invalidateQueries({ queryKey: stageKeys.stats(task.stageId) });
    },
  });
}

/**
 * Hook to update task status
 */
export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => updateTaskStatus(id, status),
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(task.id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.byStage(task.stageId) });
      // Invalidate stage stats since task progress changed
      queryClient.invalidateQueries({ queryKey: stageKeys.stats(task.stageId) });
    },
  });
}

/**
 * Hook to delete a task
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stageId }: { id: string; stageId: string }) => deleteTask(id),
    onSuccess: (_, { stageId }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.byStage(stageId) });
      // Invalidate stage stats since task count changed
      queryClient.invalidateQueries({ queryKey: stageKeys.stats(stageId) });
      queryClient.invalidateQueries({ queryKey: stageKeys.detail(stageId) });
    },
  });
}
