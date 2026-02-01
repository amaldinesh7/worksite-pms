/**
 * Import API Client
 *
 * API functions for async BOQ import operations
 */

import { api } from '../api';
import type { ImportJob, ImportJobStatus } from '@/stores/imports.store';

// ============================================
// Types
// ============================================

export interface StartImportResponse {
  jobId: string;
  status: string;
  message: string;
}

export interface ImportJobResponse {
  id: string;
  projectId?: string;
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

export interface ActiveImportsResponse {
  jobs: ImportJobResponse[];
}

export interface ConfirmImportItem {
  code?: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  sectionName?: string;
}

export interface ConfirmImportResponse {
  itemsSaved: number;
  message: string;
}

// ============================================
// API Functions
// ============================================

/**
 * Start a new import job by uploading a file
 */
export async function startImport(projectId: string, file: File): Promise<StartImportResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<{ data: StartImportResponse }>(
    `/projects/${projectId}/imports/start`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data.data;
}

/**
 * Get the status of an import job
 */
export async function getImportJobStatus(
  projectId: string,
  jobId: string
): Promise<ImportJobResponse> {
  const response = await api.get<{ data: ImportJobResponse }>(
    `/projects/${projectId}/imports/${jobId}`
  );
  return response.data.data;
}

/**
 * Get all active imports for the current user
 */
export async function getActiveImports(): Promise<ImportJobResponse[]> {
  const response = await api.get<{ data: ActiveImportsResponse }>('/imports/active');
  return response.data.data.jobs;
}

/**
 * Get recent imports for a project
 */
export async function getRecentImports(projectId: string): Promise<ImportJobResponse[]> {
  const response = await api.get<{ data: { jobs: ImportJobResponse[] } }>(
    `/projects/${projectId}/imports`
  );
  return response.data.data.jobs;
}

/**
 * Confirm and save parsed items from an import job
 */
export async function confirmImport(
  projectId: string,
  jobId: string,
  items: ConfirmImportItem[]
): Promise<ConfirmImportResponse> {
  const response = await api.post<{ data: ConfirmImportResponse }>(
    `/projects/${projectId}/imports/${jobId}/confirm`,
    { items }
  );
  return response.data.data;
}

/**
 * Cancel/discard an import job
 */
export async function cancelImport(projectId: string, jobId: string): Promise<void> {
  await api.delete(`/projects/${projectId}/imports/${jobId}`);
}

// ============================================
// Helpers
// ============================================

/**
 * Convert API response to ImportJob store format
 */
export function toImportJob(response: ImportJobResponse, projectName?: string): ImportJob {
  return {
    id: response.id,
    projectId: response.projectId || '',
    projectName,
    status: response.status,
    progress: response.progress,
    fileName: response.fileName,
    fileSize: response.fileSize,
    fileType: response.fileType,
    itemsFound: response.itemsFound,
    itemsSaved: response.itemsSaved,
    errors: response.errors,
    result: response.result,
    startedAt: response.startedAt,
    completedAt: response.completedAt,
    createdAt: response.createdAt,
  };
}
