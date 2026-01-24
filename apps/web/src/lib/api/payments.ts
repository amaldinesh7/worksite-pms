/**
 * Payments API Module
 *
 * Provides functions for interacting with the payments endpoints.
 */

import { api } from './client';
import type { AxiosResponse } from 'axios';
import type { PaginationMeta, ApiSuccessResponse, ApiPaginatedResponse } from './types';

// ============================================
// Types
// ============================================

export type PaymentType = 'IN' | 'OUT';
export type PaymentMode = 'CASH' | 'CHEQUE' | 'ONLINE';
export type PartyType = 'VENDOR' | 'LABOUR' | 'SUBCONTRACTOR' | 'CLIENT';
export type PaymentSortBy = 'paymentDate' | 'amount' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface PaymentProject {
  id: string;
  name: string;
}

export interface PaymentParty {
  id: string;
  name: string;
  type: PartyType;
}

export interface PaymentExpense {
  id: string;
  description: string | null;
  rate: number;
  quantity: number;
  expenseDate: string;
}

export interface PaymentRecordedBy {
  id: string;
  user: {
    id: string;
    name: string;
  };
  role: {
    id: string;
    name: string;
  };
}

export interface Payment {
  id: string;
  organizationId: string;
  projectId: string;
  partyId: string | null;
  expenseId: string | null;
  recordedById: string | null;
  type: PaymentType;
  paymentMode: PaymentMode;
  amount: number;
  paymentDate: string;
  referenceNumber: string | null;
  notes: string | null;
  createdAt: string;
  // Relations
  project: PaymentProject;
  party: PaymentParty | null;
  expense: PaymentExpense | null;
  recordedBy: PaymentRecordedBy | null;
}

export interface ProjectPaymentSummary {
  projectBudget: number;
  totalReceived: number;
  totalPending: number;
  receivedPercentage: number;
}

export interface PaymentsSummary {
  total: number;
  count: number;
  totalIn: number;
  totalOut: number;
}

export interface PartyOutstanding {
  outstanding: number;
}

export interface UnpaidExpense {
  id: string;
  description: string | null;
  totalAmount: number;
  paidAmount: number;
  outstanding: number;
  expenseDate: string;
}

export interface CreatePaymentInput {
  projectId: string;
  partyId?: string;
  expenseId?: string;
  recordedById?: string;
  type: PaymentType;
  paymentMode: PaymentMode;
  amount: number;
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
}

export interface UpdatePaymentInput {
  partyId?: string | null;
  expenseId?: string | null;
  recordedById?: string | null;
  type?: PaymentType;
  paymentMode?: PaymentMode;
  amount?: number;
  paymentDate?: string;
  referenceNumber?: string | null;
  notes?: string | null;
}

export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  projectId?: string;
  partyId?: string;
  expenseId?: string;
  type?: PaymentType;
  partyType?: PartyType;
  startDate?: string;
  endDate?: string;
  sortBy?: PaymentSortBy;
  sortOrder?: SortOrder;
}

export interface ProjectPaymentQueryParams {
  page?: number;
  limit?: number;
  partyId?: string;
  partyType?: PartyType;
  startDate?: string;
  endDate?: string;
  sortBy?: PaymentSortBy;
  sortOrder?: SortOrder;
}

export interface PaymentsResponse {
  items: Payment[];
  pagination: PaginationMeta;
}

// ============================================
// Payments API
// ============================================

/**
 * Fetch paginated list of payments with optional filters
 */
export async function getPayments(params?: PaymentQueryParams): Promise<PaymentsResponse> {
  const response: AxiosResponse<ApiPaginatedResponse<Payment>> = await api.get('/payments', {
    params,
  });
  return response.data.data;
}

/**
 * Fetch a single payment by ID
 */
export async function getPayment(id: string): Promise<Payment> {
  const response: AxiosResponse<ApiSuccessResponse<Payment>> = await api.get(`/payments/${id}`);
  return response.data.data;
}

/**
 * Create a new payment
 */
export async function createPayment(data: CreatePaymentInput): Promise<Payment> {
  const response: AxiosResponse<ApiSuccessResponse<Payment>> = await api.post('/payments', data);
  return response.data.data;
}

/**
 * Update an existing payment
 */
export async function updatePayment(id: string, data: UpdatePaymentInput): Promise<Payment> {
  const response: AxiosResponse<ApiSuccessResponse<Payment>> = await api.put(
    `/payments/${id}`,
    data
  );
  return response.data.data;
}

/**
 * Delete a payment
 */
export async function deletePayment(id: string): Promise<void> {
  await api.delete(`/payments/${id}`);
}

/**
 * Get payments summary
 */
export async function getPaymentsSummary(
  projectId?: string,
  type?: PaymentType
): Promise<PaymentsSummary> {
  const response: AxiosResponse<ApiSuccessResponse<PaymentsSummary>> = await api.get(
    '/payments/summary',
    { params: { projectId, type } }
  );
  return response.data.data;
}

/**
 * Get project payment summary (for client payments tab)
 */
export async function getProjectPaymentSummary(projectId: string): Promise<ProjectPaymentSummary> {
  const response: AxiosResponse<ApiSuccessResponse<ProjectPaymentSummary>> = await api.get(
    `/payments/project/${projectId}/summary`
  );
  return response.data.data;
}

/**
 * Get client payments for a project (type = IN)
 */
export async function getClientPayments(
  projectId: string,
  params?: ProjectPaymentQueryParams
): Promise<PaymentsResponse> {
  const response: AxiosResponse<ApiPaginatedResponse<Payment>> = await api.get(
    `/payments/project/${projectId}/client`,
    { params }
  );
  return response.data.data;
}

/**
 * Get party payments for a project (type = OUT)
 */
export async function getPartyPayments(
  projectId: string,
  params?: ProjectPaymentQueryParams
): Promise<PaymentsResponse> {
  const response: AxiosResponse<ApiPaginatedResponse<Payment>> = await api.get(
    `/payments/project/${projectId}/party`,
    { params }
  );
  return response.data.data;
}

/**
 * Get party outstanding amount
 */
export async function getPartyOutstanding(
  projectId: string,
  partyId: string
): Promise<PartyOutstanding> {
  const response: AxiosResponse<ApiSuccessResponse<PartyOutstanding>> = await api.get(
    `/payments/project/${projectId}/party/${partyId}/outstanding`
  );
  return response.data.data;
}

/**
 * Get party unpaid expenses (for "pay against" dropdown)
 */
export async function getPartyUnpaidExpenses(
  projectId: string,
  partyId: string
): Promise<UnpaidExpense[]> {
  const response: AxiosResponse<ApiSuccessResponse<UnpaidExpense[]>> = await api.get(
    `/payments/project/${projectId}/party/${partyId}/unpaid-expenses`
  );
  return response.data.data;
}
