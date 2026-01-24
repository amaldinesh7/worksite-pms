/**
 * Payments React Query Hooks
 *
 * Provides hooks for fetching and mutating payment data using TanStack Query.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPayments,
  getPayment,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentsSummary,
  getProjectPaymentSummary,
  getClientPayments,
  getPartyPayments,
  getPartyOutstanding,
  getPartyUnpaidExpenses,
  type Payment,
  type PaymentsResponse,
  type PaymentsSummary,
  type ProjectPaymentSummary,
  type PartyOutstanding,
  type UnpaidExpense,
  type CreatePaymentInput,
  type UpdatePaymentInput,
  type PaymentQueryParams,
  type ProjectPaymentQueryParams,
  type PaymentType,
} from '../api/payments';

// ============================================
// Query Keys
// ============================================

export const paymentKeys = {
  all: ['payments'] as const,
  lists: () => [...paymentKeys.all, 'list'] as const,
  list: (params?: PaymentQueryParams) => [...paymentKeys.lists(), params] as const,
  details: () => [...paymentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
  summary: (projectId?: string, type?: PaymentType) =>
    [...paymentKeys.all, 'summary', projectId, type] as const,
  projectSummary: (projectId: string) =>
    [...paymentKeys.all, 'project-summary', projectId] as const,
  clientPayments: (projectId: string, params?: ProjectPaymentQueryParams) =>
    [...paymentKeys.all, 'client', projectId, params] as const,
  partyPayments: (projectId: string, params?: ProjectPaymentQueryParams) =>
    [...paymentKeys.all, 'party', projectId, params] as const,
  partyOutstanding: (projectId: string, partyId: string) =>
    [...paymentKeys.all, 'outstanding', projectId, partyId] as const,
  partyUnpaidExpenses: (projectId: string, partyId: string) =>
    [...paymentKeys.all, 'unpaid-expenses', projectId, partyId] as const,
};

// ============================================
// Query Hooks
// ============================================

/**
 * Hook to fetch paginated list of payments with optional filters
 */
export function usePayments(params?: PaymentQueryParams) {
  return useQuery<PaymentsResponse, Error>({
    queryKey: paymentKeys.list(params),
    queryFn: () => getPayments(params),
  });
}

/**
 * Hook to fetch a single payment by ID
 */
export function usePayment(id: string) {
  return useQuery<Payment, Error>({
    queryKey: paymentKeys.detail(id),
    queryFn: () => getPayment(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch payments summary
 */
export function usePaymentsSummary(projectId?: string, type?: PaymentType) {
  return useQuery<PaymentsSummary, Error>({
    queryKey: paymentKeys.summary(projectId, type),
    queryFn: () => getPaymentsSummary(projectId, type),
  });
}

/**
 * Hook to fetch project payment summary (for client payments tab)
 */
export function useProjectPaymentSummary(projectId: string) {
  return useQuery<ProjectPaymentSummary, Error>({
    queryKey: paymentKeys.projectSummary(projectId),
    queryFn: () => getProjectPaymentSummary(projectId),
    enabled: !!projectId,
  });
}

/**
 * Hook to fetch client payments for a project (type = IN)
 */
export function useClientPayments(projectId: string, params?: ProjectPaymentQueryParams) {
  return useQuery<PaymentsResponse, Error>({
    queryKey: paymentKeys.clientPayments(projectId, params),
    queryFn: () => getClientPayments(projectId, params),
    enabled: !!projectId,
  });
}

/**
 * Hook to fetch party payments for a project (type = OUT)
 */
export function usePartyPayments(projectId: string, params?: ProjectPaymentQueryParams) {
  return useQuery<PaymentsResponse, Error>({
    queryKey: paymentKeys.partyPayments(projectId, params),
    queryFn: () => getPartyPayments(projectId, params),
    enabled: !!projectId,
  });
}

/**
 * Hook to fetch party outstanding amount
 */
export function usePartyOutstanding(projectId: string, partyId: string) {
  return useQuery<PartyOutstanding, Error>({
    queryKey: paymentKeys.partyOutstanding(projectId, partyId),
    queryFn: () => getPartyOutstanding(projectId, partyId),
    enabled: !!projectId && !!partyId,
  });
}

/**
 * Hook to fetch party unpaid expenses
 */
export function usePartyUnpaidExpenses(projectId: string, partyId: string) {
  return useQuery<UnpaidExpense[], Error>({
    queryKey: paymentKeys.partyUnpaidExpenses(projectId, partyId),
    queryFn: () => getPartyUnpaidExpenses(projectId, partyId),
    enabled: !!projectId && !!partyId,
  });
}

// ============================================
// Mutation Hooks
// ============================================

/**
 * Hook to create a new payment
 */
export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentInput) => createPayment(data),
    onSuccess: (_, variables) => {
      // Invalidate all payment-related queries with broader matching
      // Using exact: false to match all queries that start with these keys
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      queryClient.invalidateQueries({ 
        queryKey: ['payments', 'client', variables.projectId],
        exact: false,
      });
      queryClient.invalidateQueries({ 
        queryKey: ['payments', 'party', variables.projectId],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: paymentKeys.projectSummary(variables.projectId),
      });
      if (variables.partyId) {
        queryClient.invalidateQueries({
          queryKey: paymentKeys.partyOutstanding(variables.projectId, variables.partyId),
        });
        queryClient.invalidateQueries({
          queryKey: paymentKeys.partyUnpaidExpenses(variables.projectId, variables.partyId),
        });
      }
    },
  });
}

/**
 * Hook to update an existing payment
 */
export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePaymentInput }) => updatePayment(id, data),
    onSuccess: () => {
      // Invalidate all payment-related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    },
  });
}

/**
 * Hook to delete a payment
 */
export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePayment(id),
    onSuccess: () => {
      // Invalidate all payment-related queries
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    },
  });
}
