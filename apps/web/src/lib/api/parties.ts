/**
 * Parties API Module
 *
 * Provides functions for interacting with the parties endpoints.
 * Parties represent vendors, labours, and subcontractors.
 */

import { api } from './client';
import type { AxiosResponse } from 'axios';
import type {
  PaginationMeta,
  ApiPaginatedResponse,
  PaginatedResult,
  ApiSuccessResponse,
} from './types';

// ============================================
// Types
// ============================================

export type PartyType = 'VENDOR' | 'LABOUR' | 'SUBCONTRACTOR' | 'CLIENT';

export interface Party {
  id: string;
  organizationId: string;
  name: string;
  phone: string | null;
  location: string;
  type: PartyType;
  credit: number;
  createdAt: string;
  updatedAt?: string;
}

export interface PartyStats {
  totalExpenses: number;
  totalPayments: number;
  balance: number;
}

export interface PartySummary {
  totalVendors: number;
  totalLabours: number;
  totalSubcontractors: number;
  vendorsBalance: number;
  laboursBalance: number;
  subcontractorsBalance: number;
}

export interface PartyProject {
  id: string;
  name: string;
  totalExpenses: number;
  totalPayments: number;
  credit: number;
}

export interface PartyProjectsResponse {
  items: PartyProject[];
  totals: {
    totalPaid: number;
    totalCredit: number;
  };
  pagination: PaginationMeta;
}

export interface PartyTransaction {
  id: string;
  date: string;
  title: string;
  amount: number;
  projectId: string;
  projectName: string;
}

export interface PartyTransactionsParams {
  page?: number;
  limit?: number;
  projectId?: string;
  type?: 'payments' | 'expenses';
}

export interface CreatePartyInput {
  name: string;
  phone?: string;
  location: string;
  type: PartyType;
}

export interface UpdatePartyInput {
  name?: string;
  phone?: string;
  location?: string;
  type?: PartyType;
}

export interface PartyQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: PartyType;
  hasCredit?: boolean;
}

// Re-export pagination types for backward compatibility
export type { PaginationMeta, PaginatedResult };

// ============================================
// Parties API
// ============================================

/**
 * Fetch paginated list of parties with optional filters
 */
export async function getParties(params?: PartyQueryParams): Promise<PaginatedResult<Party>> {
  const response: AxiosResponse<ApiPaginatedResponse<Party>> = await api.get('/parties', {
    params,
  });
  return response.data.data;
}

/**
 * Fetch a single party by ID
 */
export async function getParty(id: string): Promise<Party> {
  const response: AxiosResponse<ApiSuccessResponse<Party>> = await api.get(`/parties/${id}`);
  return response.data.data;
}

/**
 * Get party statistics (expenses, payments, balance)
 */
export async function getPartyStats(id: string): Promise<PartyStats> {
  const response: AxiosResponse<ApiSuccessResponse<PartyStats>> = await api.get(
    `/parties/${id}/stats`
  );
  return response.data.data;
}

/**
 * Get summary of all parties by type (for stats cards)
 */
export async function getPartiesSummary(): Promise<PartySummary> {
  const response: AxiosResponse<ApiSuccessResponse<PartySummary>> =
    await api.get('/parties/summary');
  return response.data.data;
}

/**
 * Create a new party
 */
export async function createParty(data: CreatePartyInput): Promise<Party> {
  const response: AxiosResponse<ApiSuccessResponse<Party>> = await api.post('/parties', data);
  return response.data.data;
}

/**
 * Update an existing party
 */
export async function updateParty(id: string, data: UpdatePartyInput): Promise<Party> {
  const response: AxiosResponse<ApiSuccessResponse<Party>> = await api.put(`/parties/${id}`, data);
  return response.data.data;
}

/**
 * Delete a party
 */
export async function deleteParty(id: string): Promise<void> {
  await api.delete(`/parties/${id}`);
}

/**
 * Get party projects with credit calculations
 */
export async function getPartyProjects(
  partyId: string,
  params?: { page?: number; limit?: number }
): Promise<PartyProjectsResponse> {
  interface ApiPartyProjectsResponse {
    success: true;
    data: {
      items: PartyProject[];
      totals: { totalPaid: number; totalCredit: number };
      pagination: PaginationMeta;
    };
  }

  const response: AxiosResponse<ApiPartyProjectsResponse> = await api.get(
    `/parties/${partyId}/projects`,
    { params }
  );

  return response.data.data;
}

/**
 * Get party transactions (payments or expenses)
 */
export async function getPartyTransactions(
  partyId: string,
  params?: PartyTransactionsParams
): Promise<PaginatedResult<PartyTransaction>> {
  const response: AxiosResponse<ApiPaginatedResponse<PartyTransaction>> = await api.get(
    `/parties/${partyId}/transactions`,
    { params }
  );

  return response.data.data;
}
