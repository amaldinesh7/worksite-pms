/**
 * Imports Store
 *
 * Zustand store for tracking active import jobs across the application.
 * Persists import state so floating status bar shows even after navigation.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// Types
// ============================================

export type ImportJobStatus =
  | 'PENDING'
  | 'UPLOADING'
  | 'QUEUED'
  | 'PROCESSING'
  | 'AI_PARSING'
  | 'SAVING'
  | 'COMPLETED'
  | 'FAILED';

export interface ImportJob {
  id: string;
  projectId: string;
  projectName?: string;
  status: ImportJobStatus;
  progress: number;
  fileName: string;
  fileSize: number;
  fileType: string;
  itemsFound: number | null;
  itemsSaved: number | null;
  errors: string[];
  result: unknown | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

interface ImportsState {
  // Active import jobs
  jobs: Map<string, ImportJob>;

  // UI state
  isFloatingBarMinimized: boolean;
  isFloatingBarVisible: boolean;

  // Actions
  addJob: (job: ImportJob) => void;
  updateJob: (jobId: string, updates: Partial<ImportJob>) => void;
  removeJob: (jobId: string) => void;
  clearCompletedJobs: () => void;

  // UI actions
  setFloatingBarMinimized: (minimized: boolean) => void;
  setFloatingBarVisible: (visible: boolean) => void;

  // Getters
  getActiveJobs: () => ImportJob[];
  getJob: (jobId: string) => ImportJob | undefined;
  hasActiveJobs: () => boolean;
}

// ============================================
// Store
// ============================================

export const useImportsStore = create<ImportsState>()(
  persist(
    (set, get) => ({
      jobs: new Map(),
      isFloatingBarMinimized: false,
      isFloatingBarVisible: true,

      addJob: (job) =>
        set((state) => {
          const newJobs = new Map(state.jobs);
          newJobs.set(job.id, job);
          return { jobs: newJobs, isFloatingBarVisible: true };
        }),

      updateJob: (jobId, updates) =>
        set((state) => {
          const job = state.jobs.get(jobId);
          if (!job) return state;

          const newJobs = new Map(state.jobs);
          newJobs.set(jobId, { ...job, ...updates });
          return { jobs: newJobs };
        }),

      removeJob: (jobId) =>
        set((state) => {
          const newJobs = new Map(state.jobs);
          newJobs.delete(jobId);
          return { jobs: newJobs };
        }),

      clearCompletedJobs: () =>
        set((state) => {
          const newJobs = new Map(state.jobs);
          for (const [id, job] of newJobs) {
            if (job.status === 'COMPLETED' || job.status === 'FAILED') {
              newJobs.delete(id);
            }
          }
          return { jobs: newJobs };
        }),

      setFloatingBarMinimized: (minimized) => set({ isFloatingBarMinimized: minimized }),

      setFloatingBarVisible: (visible) => set({ isFloatingBarVisible: visible }),

      getActiveJobs: () => {
        const jobs = Array.from(get().jobs.values());
        return jobs.filter((job) => !['COMPLETED', 'FAILED'].includes(job.status));
      },

      getJob: (jobId) => get().jobs.get(jobId),

      hasActiveJobs: () => {
        const jobs = Array.from(get().jobs.values());
        return jobs.some((job) => !['COMPLETED', 'FAILED'].includes(job.status));
      },
    }),
    {
      name: 'worksite-imports',
      // Custom serialization for Map
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          // Convert jobs array back to Map
          if (parsed.state?.jobs) {
            parsed.state.jobs = new Map(parsed.state.jobs);
          }
          return parsed;
        },
        setItem: (name, value) => {
          // Convert Map to array for serialization
          const toStore = {
            ...value,
            state: {
              ...value.state,
              jobs: Array.from(value.state.jobs.entries()),
            },
          };
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

// ============================================
// Selectors (for better performance)
// ============================================

export const selectActiveJobs = (state: ImportsState) => state.getActiveJobs();
export const selectHasActiveJobs = (state: ImportsState) => state.hasActiveJobs();
export const selectIsFloatingBarVisible = (state: ImportsState) =>
  state.isFloatingBarVisible && state.jobs.size > 0;
export const selectIsFloatingBarMinimized = (state: ImportsState) => state.isFloatingBarMinimized;

// ============================================
// Helper Functions
// ============================================

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: ImportJobStatus): string {
  const labels: Record<ImportJobStatus, string> = {
    PENDING: 'Pending',
    UPLOADING: 'Uploading',
    QUEUED: 'Queued',
    PROCESSING: 'Processing',
    AI_PARSING: 'AI Parsing',
    SAVING: 'Saving',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
  };
  return labels[status] || status;
}

/**
 * Check if status is terminal (no more updates expected)
 */
export function isTerminalStatus(status: ImportJobStatus): boolean {
  return status === 'COMPLETED' || status === 'FAILED';
}

/**
 * Check if status indicates active processing
 */
export function isActiveStatus(status: ImportJobStatus): boolean {
  return !isTerminalStatus(status);
}
