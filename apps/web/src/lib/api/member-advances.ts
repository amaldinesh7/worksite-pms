/**
 * Member Advances API Module
 *
 * Provides functions for interacting with the member advances endpoints.
 */

import { api } from './client';
import type { AxiosResponse } from 'axios';
import type { PaginationMeta, ApiSuccessResponse, ApiPaginatedResponse } from './types';

// ============================================
// Types
// ============================================

export type PaymentMode = 'CASH' | 'CHEQUE' | 'ONLINE';
export type MemberAdvanceSortBy = 'advanceDate' | 'amount' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

export interface MemberAdvanceProject {
  id: string;
  name: string;
}

export interface MemberAdvanceMember {
  id: string;
  user: {
    id: string;
    name: string;
    phone: string | null;
  };
  role: {
    id: string;
    name: string;
  };
}

export interface MemberAdvance {
  id: string;
  organizationId: string;
  projectId: string;
  memberId: string;
  amount: number;
  purpose: string;
  paymentMode: PaymentMode;
  advanceDate: string;
  expectedSettlementDate: string | null;
  notes: string | null;
  createdAt: string;
  // Relations
  project: MemberAdvanceProject;
  member: MemberAdvanceMember;
}

export interface MemberAdvanceSummary {
  memberId: string;
  memberName: string;
  memberRole: string;
  totalAdvanceGiven: number;
  expensesLogged: number;
  balance: number;
}

export interface ProjectMember {
  id: string;
  name: string;
  role: string;
}

export interface MemberProjectBalance {
  projectId: string;
  projectName: string;
  balance: number;
}

export interface CreateMemberAdvanceInput {
  projectId: string;
  memberId: string;
  amount: number;
  purpose: string;
  paymentMode: PaymentMode;
  advanceDate: string;
  expectedSettlementDate?: string;
  notes?: string;
}

export interface UpdateMemberAdvanceInput {
  amount?: number;
  purpose?: string;
  paymentMode?: PaymentMode;
  advanceDate?: string;
  expectedSettlementDate?: string | null;
  notes?: string | null;
}

export interface MemberAdvanceQueryParams {
  page?: number;
  limit?: number;
  projectId?: string;
  memberId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: MemberAdvanceSortBy;
  sortOrder?: SortOrder;
}

export interface MemberAdvancesResponse {
  items: MemberAdvance[];
  pagination: PaginationMeta;
}

// ============================================
// Member Advances API
// ============================================

/**
 * Fetch paginated list of member advances with optional filters
 */
export async function getMemberAdvances(
  params?: MemberAdvanceQueryParams
): Promise<MemberAdvancesResponse> {
  const response: AxiosResponse<ApiPaginatedResponse<MemberAdvance>> = await api.get(
    '/member-advances',
    { params }
  );
  return response.data.data;
}

/**
 * Fetch a single member advance by ID
 */
export async function getMemberAdvance(id: string): Promise<MemberAdvance> {
  const response: AxiosResponse<ApiSuccessResponse<MemberAdvance>> = await api.get(
    `/member-advances/${id}`
  );
  return response.data.data;
}

/**
 * Create a new member advance
 */
export async function createMemberAdvance(data: CreateMemberAdvanceInput): Promise<MemberAdvance> {
  const response: AxiosResponse<ApiSuccessResponse<MemberAdvance>> = await api.post(
    '/member-advances',
    data
  );
  return response.data.data;
}

/**
 * Update an existing member advance
 */
export async function updateMemberAdvance(
  id: string,
  data: UpdateMemberAdvanceInput
): Promise<MemberAdvance> {
  const response: AxiosResponse<ApiSuccessResponse<MemberAdvance>> = await api.put(
    `/member-advances/${id}`,
    data
  );
  return response.data.data;
}

/**
 * Delete a member advance
 */
export async function deleteMemberAdvance(id: string): Promise<void> {
  await api.delete(`/member-advances/${id}`);
}

/**
 * Get member advance summary for a specific member
 */
export async function getMemberAdvanceSummary(
  projectId: string,
  memberId: string
): Promise<MemberAdvanceSummary> {
  const response: AxiosResponse<ApiSuccessResponse<MemberAdvanceSummary>> = await api.get(
    `/member-advances/project/${projectId}/member/${memberId}/summary`
  );
  return response.data.data;
}

/**
 * Get all members' advance summaries for a project
 */
export async function getProjectMemberAdvanceSummaries(
  projectId: string
): Promise<MemberAdvanceSummary[]> {
  const response: AxiosResponse<ApiSuccessResponse<MemberAdvanceSummary[]>> = await api.get(
    `/member-advances/project/${projectId}/summaries`
  );
  return response.data.data;
}

/**
 * Get project members for dropdown
 */
export async function getProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const response: AxiosResponse<ApiSuccessResponse<ProjectMember[]>> = await api.get(
    `/member-advances/project/${projectId}/members`
  );
  return response.data.data;
}

/**
 * Get member balances across all projects
 */
export async function getMemberBalancesAcrossProjects(
  memberId: string
): Promise<MemberProjectBalance[]> {
  const response: AxiosResponse<ApiSuccessResponse<MemberProjectBalance[]>> = await api.get(
    `/member-advances/member/${memberId}/balances`
  );
  return response.data.data;
}

/**
 * Get member total balance across all projects
 */
export async function getMemberTotalBalance(memberId: string): Promise<number> {
  const response: AxiosResponse<ApiSuccessResponse<{ totalBalance: number }>> = await api.get(
    `/member-advances/member/${memberId}/total-balance`
  );
  return response.data.data.totalBalance;
}
