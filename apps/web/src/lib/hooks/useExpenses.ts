/**
 * Expenses React Query Hooks
 *
 * Provides hooks for fetching and mutating expense data using TanStack Query.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpensesSummary,
  type Expense,
  type ExpensesResponse,
  type ExpenseSummary,
  type CreateExpenseInput,
  type UpdateExpenseInput,
  type ExpenseQueryParams,
} from '../api/expenses';

// ============================================
// Query Keys
// ============================================

export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (params?: ExpenseQueryParams) => [...expenseKeys.lists(), params] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
  summary: (projectId?: string) => [...expenseKeys.all, 'summary', projectId] as const,
};

// ============================================
// Query Hooks
// ============================================

/**
 * Hook to fetch paginated list of expenses with optional filters
 */
export function useExpenses(params?: ExpenseQueryParams) {
  return useQuery<ExpensesResponse, Error>({
    queryKey: expenseKeys.list(params),
    queryFn: () => getExpenses(params),
  });
}

/**
 * Hook to fetch a single expense by ID
 */
export function useExpense(id: string) {
  return useQuery<Expense, Error>({
    queryKey: expenseKeys.detail(id),
    queryFn: () => getExpense(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch expenses summary by category
 */
export function useExpensesSummary(projectId?: string) {
  return useQuery<ExpenseSummary[], Error>({
    queryKey: expenseKeys.summary(projectId),
    queryFn: () => getExpensesSummary(projectId),
  });
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Hook to create a new expense
 */
export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseInput) => createExpense(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.summary(variables.projectId) });
    },
  });
}

/**
 * Hook to update an existing expense
 */
export function useUpdateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseInput }) => updateExpense(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: expenseKeys.summary() });
    },
  });
}

/**
 * Hook to delete an expense
 */
export function useDeleteExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.summary() });
    },
  });
}
