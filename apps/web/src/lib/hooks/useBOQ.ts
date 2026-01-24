/**
 * BOQ Hooks
 *
 * React Query hooks for BOQ data fetching and mutations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBOQItems,
  getBOQByCategory,
  getBOQByStage,
  getBOQStats,
  getBOQItem,
  createBOQItem,
  updateBOQItem,
  deleteBOQItem,
  getBOQSections,
  createBOQSection,
  parseBOQFile,
  confirmBOQImport,
  linkExpenseToBOQ,
  unlinkExpenseFromBOQ,
} from '../api/boq';
import type {
  BOQListParams,
  CreateBOQItemInput,
  UpdateBOQItemInput,
  CreateBOQSectionInput,
  ConfirmImportInput,
} from '../api/boq';

// ============================================
// Query Keys
// ============================================

export const boqKeys = {
  all: ['boq'] as const,
  lists: () => [...boqKeys.all, 'list'] as const,
  list: (projectId: string, params?: BOQListParams) =>
    [...boqKeys.lists(), projectId, params] as const,
  byCategory: (projectId: string) => [...boqKeys.all, 'by-category', projectId] as const,
  byStage: (projectId: string) => [...boqKeys.all, 'by-stage', projectId] as const,
  stats: (projectId: string) => [...boqKeys.all, 'stats', projectId] as const,
  detail: (projectId: string, id: string) => [...boqKeys.all, 'detail', projectId, id] as const,
  sections: (projectId: string) => [...boqKeys.all, 'sections', projectId] as const,
};

// ============================================
// Query Hooks
// ============================================

/**
 * Fetch paginated BOQ items
 */
export function useBOQItems(projectId: string, params: BOQListParams = {}) {
  return useQuery({
    queryKey: boqKeys.list(projectId, params),
    queryFn: () => getBOQItems(projectId, params),
    enabled: !!projectId,
  });
}

/**
 * Fetch BOQ items grouped by category
 */
export function useBOQByCategory(projectId: string) {
  return useQuery({
    queryKey: boqKeys.byCategory(projectId),
    queryFn: () => getBOQByCategory(projectId),
    enabled: !!projectId,
  });
}

/**
 * Fetch BOQ items grouped by stage
 */
export function useBOQByStage(projectId: string) {
  return useQuery({
    queryKey: boqKeys.byStage(projectId),
    queryFn: () => getBOQByStage(projectId),
    enabled: !!projectId,
  });
}

/**
 * Fetch BOQ statistics
 */
export function useBOQStats(projectId: string) {
  return useQuery({
    queryKey: boqKeys.stats(projectId),
    queryFn: () => getBOQStats(projectId),
    enabled: !!projectId,
  });
}

/**
 * Fetch a single BOQ item
 */
export function useBOQItem(projectId: string, id: string) {
  return useQuery({
    queryKey: boqKeys.detail(projectId, id),
    queryFn: () => getBOQItem(projectId, id),
    enabled: !!projectId && !!id,
  });
}

/**
 * Fetch BOQ sections
 */
export function useBOQSections(projectId: string) {
  return useQuery({
    queryKey: boqKeys.sections(projectId),
    queryFn: () => getBOQSections(projectId),
    enabled: !!projectId,
  });
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Create a new BOQ item
 */
export function useCreateBOQItem(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBOQItemInput) => createBOQItem(projectId, data),
    onSuccess: () => {
      // Invalidate all BOQ queries for this project
      queryClient.invalidateQueries({ queryKey: boqKeys.lists() });
      queryClient.invalidateQueries({ queryKey: boqKeys.byCategory(projectId) });
      queryClient.invalidateQueries({ queryKey: boqKeys.byStage(projectId) });
      queryClient.invalidateQueries({ queryKey: boqKeys.stats(projectId) });
    },
  });
}

/**
 * Update a BOQ item
 */
export function useUpdateBOQItem(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBOQItemInput }) =>
      updateBOQItem(projectId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: boqKeys.lists() });
      queryClient.invalidateQueries({ queryKey: boqKeys.byCategory(projectId) });
      queryClient.invalidateQueries({ queryKey: boqKeys.byStage(projectId) });
      queryClient.invalidateQueries({ queryKey: boqKeys.stats(projectId) });
      queryClient.invalidateQueries({ queryKey: boqKeys.detail(projectId, id) });
    },
  });
}

/**
 * Delete a BOQ item
 */
export function useDeleteBOQItem(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBOQItem(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boqKeys.lists() });
      queryClient.invalidateQueries({ queryKey: boqKeys.byCategory(projectId) });
      queryClient.invalidateQueries({ queryKey: boqKeys.byStage(projectId) });
      queryClient.invalidateQueries({ queryKey: boqKeys.stats(projectId) });
    },
  });
}

/**
 * Create a new BOQ section
 */
export function useCreateBOQSection(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBOQSectionInput) => createBOQSection(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boqKeys.sections(projectId) });
    },
  });
}

/**
 * Parse uploaded BOQ file
 */
export function useParseBOQFile(projectId: string) {
  return useMutation({
    mutationFn: (file: File) => parseBOQFile(projectId, file),
  });
}

/**
 * Confirm and save imported BOQ items
 */
export function useConfirmBOQImport(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConfirmImportInput) => confirmBOQImport(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boqKeys.lists() });
      queryClient.invalidateQueries({ queryKey: boqKeys.byCategory(projectId) });
      queryClient.invalidateQueries({ queryKey: boqKeys.byStage(projectId) });
      queryClient.invalidateQueries({ queryKey: boqKeys.stats(projectId) });
      queryClient.invalidateQueries({ queryKey: boqKeys.sections(projectId) });
    },
  });
}

/**
 * Link an expense to a BOQ item
 */
export function useLinkExpenseToBOQ(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boqItemId, expenseId }: { boqItemId: string; expenseId: string }) =>
      linkExpenseToBOQ(projectId, boqItemId, expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boqKeys.lists() });
      queryClient.invalidateQueries({ queryKey: boqKeys.byCategory(projectId) });
      queryClient.invalidateQueries({ queryKey: boqKeys.byStage(projectId) });
      queryClient.invalidateQueries({ queryKey: boqKeys.stats(projectId) });
    },
  });
}

/**
 * Unlink an expense from a BOQ item
 */
export function useUnlinkExpenseFromBOQ(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ boqItemId, expenseId }: { boqItemId: string; expenseId: string }) =>
      unlinkExpenseFromBOQ(projectId, boqItemId, expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boqKeys.lists() });
      queryClient.invalidateQueries({ queryKey: boqKeys.byCategory(projectId) });
      queryClient.invalidateQueries({ queryKey: boqKeys.byStage(projectId) });
      queryClient.invalidateQueries({ queryKey: boqKeys.stats(projectId) });
    },
  });
}
