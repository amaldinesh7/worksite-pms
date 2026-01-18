/**
 * Projects React Query Hooks
 *
 * Provides hooks for fetching and mutating project data using TanStack Query.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProjects,
  getProject,
  getProjectStats,
  getProjectMembers,
  createProject,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  type Project,
  type ProjectStats,
  type ProjectsResponse,
  type ProjectMember,
  type CreateProjectInput,
  type UpdateProjectInput,
  type ProjectQueryParams,
} from '../api/projects';

// ============================================
// Query Keys
// ============================================

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (params?: ProjectQueryParams) => [...projectKeys.lists(), params] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  stats: (id: string) => [...projectKeys.all, 'stats', id] as const,
  members: (id: string) => [...projectKeys.all, 'members', id] as const,
};

// ============================================
// Query Hooks
// ============================================

/**
 * Hook to fetch paginated list of projects with optional filters
 */
export function useProjects(params?: ProjectQueryParams) {
  return useQuery<ProjectsResponse, Error>({
    queryKey: projectKeys.list(params),
    queryFn: () => getProjects(params),
  });
}

/**
 * Hook to fetch a single project by ID
 */
export function useProject(id: string) {
  return useQuery<Project, Error>({
    queryKey: projectKeys.detail(id),
    queryFn: () => getProject(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch project statistics
 */
export function useProjectStats(id: string) {
  return useQuery<ProjectStats, Error>({
    queryKey: projectKeys.stats(id),
    queryFn: () => getProjectStats(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch project members
 */
export function useProjectMembers(projectId: string) {
  return useQuery<ProjectMember[], Error>({
    queryKey: projectKeys.members(projectId),
    queryFn: () => getProjectMembers(projectId),
    enabled: !!projectId,
  });
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Hook to create a new project
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectInput) => createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/**
 * Hook to update an existing project
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectInput }) => updateProject(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
    },
  });
}

/**
 * Hook to delete a project
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/**
 * Hook to add a member to a project
 */
export function useAddProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, memberId }: { projectId: string; memberId: string }) =>
      addProjectMember(projectId, memberId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

/**
 * Hook to remove a member from a project
 */
export function useRemoveProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, memberId }: { projectId: string; memberId: string }) =>
      removeProjectMember(projectId, memberId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}
