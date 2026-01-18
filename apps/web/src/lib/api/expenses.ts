/**
 * Expenses API Module
 *
 * Provides functions for interacting with the expenses endpoints.
 */

import { api } from './client';
import type { AxiosResponse } from 'axios';
import type { PaginationMeta, ApiSuccessResponse, ApiPaginatedResponse } from './types';

// ============================================
// Types
// ============================================

export type ExpenseStatus = 'PENDING' | 'APPROVED';
export type PaymentMode = 'CASH' | 'CHEQUE' | 'ONLINE';

export interface ExpenseCategory {
  id: string;
  name: string;
  isEditable: boolean;
}

export interface ExpenseParty {
  id: string;
  name: string;
  type: string;
}

export interface ExpenseProject {
  id: string;
  name: string;
}

export interface ExpenseStage {
  id: string;
  name: string;
}

export interface ExpensePayment {
  id: string;
  amount: number;
  paymentMode: PaymentMode;
  paymentDate: string;
}

export interface Expense {
  id: string;
  organizationId: string;
  projectId: string;
  partyId: string;
  stageId: string | null;
  expenseCategoryItemId: string;
  materialTypeItemId: string | null;
  labourTypeItemId: string | null;
  subWorkTypeItemId: string | null;
  description: string | null;
  rate: number;
  quantity: number;
  expenseDate: string;
  status: ExpenseStatus;
  notes: string | null;
  createdAt: string;
  // Relations
  project: ExpenseProject;
  party: ExpenseParty;
  stage: ExpenseStage | null;
  expenseCategory: ExpenseCategory;
  materialType: ExpenseCategory | null;
  labourType: ExpenseCategory | null;
  subWorkType: ExpenseCategory | null;
  payments: ExpensePayment[];
}

export interface ExpenseSummary {
  categoryId: string;
  categoryName: string;
  total: number;
}

export interface CreateExpenseInput {
  projectId: string;
  partyId: string;
  stageId?: string;
  expenseCategoryItemId: string;
  materialTypeItemId?: string;
  labourTypeItemId?: string;
  subWorkTypeItemId?: string;
  description?: string;
  rate: number;
  quantity: number;
  expenseDate: string;
  status?: ExpenseStatus;
  notes?: string;
  paidAmount?: number;
  paymentMode?: PaymentMode;
}

export interface UpdateExpenseInput {
  partyId?: string;
  stageId?: string | null;
  expenseCategoryItemId?: string;
  materialTypeItemId?: string | null;
  labourTypeItemId?: string | null;
  subWorkTypeItemId?: string | null;
  description?: string | null;
  rate?: number;
  quantity?: number;
  expenseDate?: string;
  status?: ExpenseStatus;
  notes?: string | null;
}

export interface ExpenseQueryParams {
  page?: number;
  limit?: number;
  projectId?: string;
  partyId?: string;
  stageId?: string;
  search?: string;
  status?: ExpenseStatus;
  startDate?: string;
  endDate?: string;
}

export interface ExpensesResponse {
  items: Expense[];
  pagination: PaginationMeta;
}

// ============================================
// Expenses API
// ============================================

/**
 * Fetch paginated list of expenses with optional filters
 */
export async function getExpenses(params?: ExpenseQueryParams): Promise<ExpensesResponse> {
  const response: AxiosResponse<ApiPaginatedResponse<Expense>> = await api.get('/expenses', {
    params,
  });
  return response.data.data;
}

/**
 * Fetch a single expense by ID
 */
export async function getExpense(id: string): Promise<Expense> {
  const response: AxiosResponse<ApiSuccessResponse<Expense>> = await api.get(`/expenses/${id}`);
  return response.data.data;
}

/**
 * Create a new expense
 */
export async function createExpense(data: CreateExpenseInput): Promise<Expense> {
  const response: AxiosResponse<ApiSuccessResponse<Expense>> = await api.post('/expenses', data);
  return response.data.data;
}

/**
 * Update an existing expense
 */
export async function updateExpense(id: string, data: UpdateExpenseInput): Promise<Expense> {
  const response: AxiosResponse<ApiSuccessResponse<Expense>> = await api.put(
    `/expenses/${id}`,
    data
  );
  return response.data.data;
}

/**
 * Delete an expense
 */
export async function deleteExpense(id: string): Promise<void> {
  await api.delete(`/expenses/${id}`);
}

/**
 * Get expenses summary by category
 */
export async function getExpensesSummary(projectId?: string): Promise<ExpenseSummary[]> {
  const response: AxiosResponse<ApiSuccessResponse<ExpenseSummary[]>> = await api.get(
    '/expenses/summary/by-category',
    { params: { projectId } }
  );
  return response.data.data;
}
