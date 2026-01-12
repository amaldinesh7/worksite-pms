/**
 * Categories React Query Hooks
 *
 * Provides hooks for fetching and mutating category data using TanStack Query.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCategoryTypes,
  getCategoryItems,
  createCategoryItem,
  updateCategoryItem,
  deleteCategoryItem,
  type CategoryType,
  type CategoryItem,
  type CreateCategoryItemInput,
} from '../api/categories';

// ============================================
// Query Keys
// ============================================

export const categoryKeys = {
  all: ['categories'] as const,
  types: () => [...categoryKeys.all, 'types'] as const,
  items: (typeKey: string) => [...categoryKeys.all, 'items', typeKey] as const,
};

// ============================================
// Query Hooks
// ============================================

/**
 * Hook to fetch all category types
 */
export function useCategoryTypes() {
  return useQuery<CategoryType[], Error>({
    queryKey: categoryKeys.types(),
    queryFn: getCategoryTypes,
  });
}

/**
 * Hook to fetch category items by type key
 */
export function useCategoryItems(typeKey: string) {
  return useQuery<CategoryItem[], Error>({
    queryKey: categoryKeys.items(typeKey),
    queryFn: () => getCategoryItems(typeKey),
    enabled: !!typeKey,
  });
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Hook to create a new category item
 */
export function useCreateCategoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryItemInput) => createCategoryItem(data),
    onSuccess: (_data, _variables) => {
      // Invalidate the items query for the category type
      // We need to find the type key from the categoryTypeId
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

/**
 * Hook to update a category item
 */
export function useUpdateCategoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; isActive?: boolean } }) =>
      updateCategoryItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}

/**
 * Hook to delete a category item
 */
export function useDeleteCategoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategoryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}
