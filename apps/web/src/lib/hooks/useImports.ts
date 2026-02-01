/**
 * Import Hooks
 *
 * React Query hooks for import operations with Zustand store integration
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  startImport,
  getImportJobStatus,
  getActiveImports,
  getRecentImports,
  confirmImport,
  cancelImport,
  toImportJob,
  type ConfirmImportItem,
} from '../api/imports';
import { useImportsStore } from '@/stores/imports.store';

// ============================================
// Query Keys
// ============================================

export const importKeys = {
  all: ['imports'] as const,
  active: () => [...importKeys.all, 'active'] as const,
  project: (projectId: string) => [...importKeys.all, 'project', projectId] as const,
  job: (projectId: string, jobId: string) => [...importKeys.all, 'job', projectId, jobId] as const,
};

// ============================================
// Queries
// ============================================

/**
 * Get all active imports for the current user
 */
export function useActiveImports() {
  const addJob = useImportsStore((state) => state.addJob);

  return useQuery({
    queryKey: importKeys.active(),
    queryFn: async () => {
      const jobs = await getActiveImports();
      // Sync with store
      jobs.forEach((job) => {
        addJob(toImportJob(job));
      });
      return jobs;
    },
    // Refetch every 30 seconds to catch any missed WebSocket updates
    refetchInterval: 30000,
    staleTime: 10000,
  });
}

/**
 * Get recent imports for a project
 */
export function useRecentImports(projectId: string) {
  return useQuery({
    queryKey: importKeys.project(projectId),
    queryFn: () => getRecentImports(projectId),
    enabled: !!projectId,
    staleTime: 30000,
  });
}

/**
 * Get status of a specific import job
 */
export function useImportJobStatus(projectId: string, jobId: string) {
  const updateJob = useImportsStore((state) => state.updateJob);

  return useQuery({
    queryKey: importKeys.job(projectId, jobId),
    queryFn: async () => {
      const job = await getImportJobStatus(projectId, jobId);
      // Sync with store
      updateJob(job.id, toImportJob(job));
      return job;
    },
    enabled: !!projectId && !!jobId,
    // Poll every 2 seconds if job is active
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      const isActive = !['COMPLETED', 'FAILED'].includes(data.status);
      return isActive ? 2000 : false;
    },
  });
}

// ============================================
// Mutations
// ============================================

/**
 * Start a new import job
 */
export function useStartImport() {
  const queryClient = useQueryClient();
  const addJob = useImportsStore((state) => state.addJob);

  return useMutation({
    mutationFn: ({
      projectId,
      file,
      projectName,
    }: {
      projectId: string;
      file: File;
      projectName?: string;
    }) =>
      startImport(projectId, file).then((result) => ({ ...result, projectId, file, projectName })),
    onSuccess: (data) => {
      // Add job to store immediately
      addJob({
        id: data.jobId,
        projectId: data.projectId,
        projectName: data.projectName,
        status: 'QUEUED',
        progress: 0,
        fileName: data.file.name,
        fileSize: data.file.size,
        fileType: data.file.name.split('.').pop() || 'unknown',
        itemsFound: null,
        itemsSaved: null,
        errors: [],
        result: null,
        startedAt: null,
        completedAt: null,
        createdAt: new Date().toISOString(),
      });

      toast.success('Import started', {
        description: 'Your file is being processed in the background.',
      });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: importKeys.active() });
      queryClient.invalidateQueries({ queryKey: importKeys.project(data.projectId) });
    },
    onError: (error) => {
      toast.error('Failed to start import', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });
}

/**
 * Confirm and save parsed items
 */
export function useConfirmImport() {
  const queryClient = useQueryClient();
  const updateJob = useImportsStore((state) => state.updateJob);

  return useMutation({
    mutationFn: ({
      projectId,
      jobId,
      items,
    }: {
      projectId: string;
      jobId: string;
      items: ConfirmImportItem[];
    }) => confirmImport(projectId, jobId, items).then((result) => ({ ...result, jobId })),
    onSuccess: (data, variables) => {
      // Update store
      updateJob(variables.jobId, {
        status: 'COMPLETED',
        itemsSaved: data.itemsSaved,
      });

      toast.success('Import confirmed', {
        description: `${data.itemsSaved} items saved successfully.`,
      });

      // Invalidate BOQ queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['boq'] });
      queryClient.invalidateQueries({ queryKey: importKeys.project(variables.projectId) });
    },
    onError: (error) => {
      toast.error('Failed to confirm import', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });
}

/**
 * Cancel an import job
 */
export function useCancelImport() {
  const queryClient = useQueryClient();
  const updateJob = useImportsStore((state) => state.updateJob);

  return useMutation({
    mutationFn: ({ projectId, jobId }: { projectId: string; jobId: string }) =>
      cancelImport(projectId, jobId).then(() => ({ projectId, jobId })),
    onSuccess: (_, variables) => {
      // Update store
      updateJob(variables.jobId, {
        status: 'FAILED',
        errors: ['Cancelled by user'],
      });

      toast.success('Import cancelled');

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: importKeys.active() });
      queryClient.invalidateQueries({ queryKey: importKeys.project(variables.projectId) });
    },
    onError: (error) => {
      toast.error('Failed to cancel import', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });
}
