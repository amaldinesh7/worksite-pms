/**
 * BOQ API Client
 *
 * API functions for BOQ (Bill of Quantities) management.
 */

import { api } from './client';
import type { ApiPaginatedResponse, PaginatedResult, SuccessResponse } from './types';

// ============================================
// Types
// ============================================

export interface BOQWorkCategory {
  id: string;
  name: string;
}

export interface BOQSection {
  id: string;
  name: string;
  sortOrder: number;
  createdAt: string;
}

export interface BOQExpenseLink {
  id: string;
  expenseId: string;
  expense: {
    id: string;
    rate: number;
    quantity: number;
    expenseDate: string;
    description?: string;
  };
}

export interface BOQItem {
  id: string;
  projectId: string;
  sectionId?: string;
  stageId?: string;
  code?: string;
  boqCategoryItemId?: string; // Optional - items grouped by section instead
  boqCategory?: BOQWorkCategory;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  notes?: string;
  isReviewFlagged: boolean;
  flagReason?: string;
  createdAt: string;
  updatedAt: string;
  section?: { id: string; name: string };
  stage?: { id: string; name: string };
  expenseLinks: BOQExpenseLink[];
}

export interface BOQCategoryBreakdownItem {
  categoryName: string;
  sortOrder: number;
  quoted: number;
  actual: number;
  count: number;
}

export interface BOQStats {
  totalQuoted: number;
  totalActual: number;
  variance: number;
  variancePercent: number;
  budgetUsage: number;
  itemCount: number;
  categoryBreakdown: Record<string, BOQCategoryBreakdownItem>;
}

export interface BOQCategoryGroup {
  categoryId: string;
  categoryName: string;
  items: BOQItem[];
  itemCount: number;
  quotedTotal: number;
  actualTotal: number;
  variance: number;
}

export interface BOQSectionGroup {
  sectionId: string | null;
  sectionName: string;
  items: BOQItem[];
  itemCount: number;
  quotedTotal: number;
  actualTotal: number;
  variance: number;
}

export interface BOQStageGroup {
  stageId: string | null;
  stageName: string;
  items: BOQItem[];
  itemCount: number;
  quotedTotal: number;
  actualTotal: number;
  variance: number;
}

export interface FieldConfidences {
  description: number;
  unit: number;
  quantity: number;
  rate: number;
}

export interface ParsedBOQItem {
  code?: string;
  boqCategoryItemId?: string; // Optional - items grouped by section instead
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  sectionName?: string;
  stageId?: string;
  isReviewFlagged: boolean;
  flagReason?: string;
  fieldConfidences?: FieldConfidences;
}

export interface ParseResult {
  fileName: string;
  items: ParsedBOQItem[];
  sections: string[];
  totalItems: number;
  flaggedItems: number;
  errors: string[];
  checksumMatch: boolean;
  documentTotal?: number;
  calculatedTotal: number;
}

// ============================================
// Query Parameters
// ============================================

export interface BOQListParams {
  page?: number;
  limit?: number;
  boqCategoryItemId?: string;
  stageId?: string;
  sectionId?: string;
  search?: string;
  sortBy?: 'description' | 'boqCategoryItemId' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// Input Types
// ============================================

export interface CreateBOQItemInput {
  sectionId?: string;
  stageId?: string;
  code?: string;
  boqCategoryItemId?: string; // Optional - items grouped by section instead
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  notes?: string;
}

export interface UpdateBOQItemInput {
  sectionId?: string | null;
  stageId?: string | null;
  code?: string | null;
  boqCategoryItemId?: string;
  description?: string;
  unit?: string;
  quantity?: number;
  rate?: number;
  notes?: string | null;
  isReviewFlagged?: boolean;
  flagReason?: string | null;
}

export interface CreateBOQSectionInput {
  name: string;
  sortOrder?: number;
}

export interface UpdateBOQSectionInput {
  name?: string;
  sortOrder?: number;
}

export interface ConfirmImportInput {
  items: ParsedBOQItem[];
}

// ============================================
// API Functions
// ============================================

/**
 * List BOQ items for a project
 */
export async function getBOQItems(
  projectId: string,
  params: BOQListParams = {}
): Promise<PaginatedResult<BOQItem>> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.boqCategoryItemId) searchParams.set('boqCategoryItemId', params.boqCategoryItemId);
  if (params.stageId) searchParams.set('stageId', params.stageId);
  if (params.sectionId) searchParams.set('sectionId', params.sectionId);
  if (params.search) searchParams.set('search', params.search);
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const query = searchParams.toString();
  const url = `/projects/${projectId}/boq${query ? `?${query}` : ''}`;

  const response = await api.get<ApiPaginatedResponse<BOQItem>>(url);
  return response.data.data;
}

/**
 * Get BOQ items grouped by category
 * @deprecated Use getBOQBySection instead - items are now grouped by section
 */
export async function getBOQByCategory(projectId: string): Promise<BOQCategoryGroup[]> {
  const response = await api.get<SuccessResponse<BOQCategoryGroup[]>>(
    `/projects/${projectId}/boq/by-category`
  );
  return response.data.data;
}

/**
 * Get BOQ items grouped by section
 * This is the preferred way to view BOQ items - sections are extracted from documents
 */
export async function getBOQBySection(projectId: string): Promise<BOQSectionGroup[]> {
  const response = await api.get<SuccessResponse<BOQSectionGroup[]>>(
    `/projects/${projectId}/boq/by-section`
  );
  return response.data.data;
}

/**
 * Get BOQ items grouped by stage
 */
export async function getBOQByStage(projectId: string): Promise<BOQStageGroup[]> {
  const response = await api.get<SuccessResponse<BOQStageGroup[]>>(
    `/projects/${projectId}/boq/by-stage`
  );
  return response.data.data;
}

/**
 * Get BOQ statistics for a project
 */
export async function getBOQStats(projectId: string): Promise<BOQStats> {
  const response = await api.get<SuccessResponse<BOQStats>>(`/projects/${projectId}/boq/stats`);
  return response.data.data;
}

/**
 * Get a single BOQ item
 */
export async function getBOQItem(projectId: string, id: string): Promise<BOQItem> {
  const response = await api.get<SuccessResponse<BOQItem>>(`/projects/${projectId}/boq/${id}`);
  return response.data.data;
}

/**
 * Create a new BOQ item
 */
export async function createBOQItem(projectId: string, data: CreateBOQItemInput): Promise<BOQItem> {
  const response = await api.post<SuccessResponse<BOQItem>>(`/projects/${projectId}/boq`, data);
  return response.data.data;
}

/**
 * Update a BOQ item
 */
export async function updateBOQItem(
  projectId: string,
  id: string,
  data: UpdateBOQItemInput
): Promise<BOQItem> {
  const response = await api.put<SuccessResponse<BOQItem>>(
    `/projects/${projectId}/boq/${id}`,
    data
  );
  return response.data.data;
}

/**
 * Delete a BOQ item
 */
export async function deleteBOQItem(projectId: string, id: string): Promise<void> {
  await api.delete(`/projects/${projectId}/boq/${id}`);
}

/**
 * List BOQ sections for a project
 */
export async function getBOQSections(projectId: string): Promise<BOQSection[]> {
  const response = await api.get<SuccessResponse<BOQSection[]>>(
    `/projects/${projectId}/boq-sections`
  );
  return response.data.data;
}

/**
 * Create a new BOQ section
 */
export async function createBOQSection(
  projectId: string,
  data: CreateBOQSectionInput
): Promise<BOQSection> {
  const response = await api.post<SuccessResponse<BOQSection>>(
    `/projects/${projectId}/boq-sections`,
    data
  );
  return response.data.data;
}

/**
 * Update a BOQ section
 */
export async function updateBOQSection(
  projectId: string,
  sectionId: string,
  data: UpdateBOQSectionInput
): Promise<BOQSection> {
  const response = await api.put<SuccessResponse<BOQSection>>(
    `/projects/${projectId}/boq-sections/${sectionId}`,
    data
  );
  return response.data.data;
}

/**
 * Delete a BOQ section
 */
export async function deleteBOQSection(projectId: string, sectionId: string): Promise<void> {
  await api.delete(`/projects/${projectId}/boq-sections/${sectionId}`);
}

/**
 * Parse uploaded BOQ file (PDF, Excel, CSV)
 * Uses AI-powered parsing which can take 30-90 seconds for large PDFs
 *
 * @param projectId - The project ID
 * @param file - The file to parse
 * @param signal - Optional AbortSignal for cancellation
 */
export async function parseBOQFile(
  projectId: string,
  file: File,
  signal?: AbortSignal
): Promise<ParseResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<SuccessResponse<ParseResult>>(
    `/projects/${projectId}/boq/import/parse`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // Extended timeout for AI-powered PDF parsing (5 minutes)
      timeout: 300000,
      signal,
    }
  );
  return response.data.data;
}

/**
 * Confirm and save imported BOQ items
 */
export async function confirmBOQImport(
  projectId: string,
  data: ConfirmImportInput
): Promise<{ importedCount: number }> {
  const response = await api.post<SuccessResponse<{ importedCount: number }>>(
    `/projects/${projectId}/boq/import/confirm`,
    data
  );
  return response.data.data;
}

/**
 * Link an expense to a BOQ item
 */
export async function linkExpenseToBOQ(
  projectId: string,
  boqItemId: string,
  expenseId: string
): Promise<void> {
  await api.post(`/projects/${projectId}/boq/${boqItemId}/link-expense`, {
    expenseId,
  });
}

/**
 * Unlink an expense from a BOQ item
 */
export async function unlinkExpenseFromBOQ(
  projectId: string,
  boqItemId: string,
  expenseId: string
): Promise<void> {
  await api.delete(`/projects/${projectId}/boq/${boqItemId}/unlink-expense/${expenseId}`);
}

// ============================================
// Batch Operations
// ============================================

export interface BatchItemUpdate {
  id: string;
  changes: Partial<UpdateBOQItemInput>;
}

export interface BatchItemCreate {
  sectionId?: string | null;
  stageId?: string | null;
  code?: string | null;
  boqCategoryItemId?: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
}

export interface BatchSectionUpdate {
  id: string;
  changes: Partial<UpdateBOQSectionInput>;
}

export interface BatchSectionCreate {
  name: string;
  sortOrder?: number;
}

export interface BatchBOQInput {
  itemUpdates?: BatchItemUpdate[];
  itemCreates?: BatchItemCreate[];
  itemDeletes?: string[];
  sectionUpdates?: BatchSectionUpdate[];
  sectionCreates?: BatchSectionCreate[];
  sectionDeletes?: string[];
}

export interface BatchBOQResult {
  itemsUpdated: number;
  itemsCreated: number;
  itemsDeleted: number;
  sectionsUpdated: number;
  sectionsCreated: number;
  sectionsDeleted: number;
}

/**
 * Batch update BOQ items and sections
 * Single API call for all changes from edit mode
 */
export async function batchUpdateBOQ(
  projectId: string,
  data: BatchBOQInput
): Promise<BatchBOQResult> {
  const response = await api.post<SuccessResponse<BatchBOQResult>>(
    `/projects/${projectId}/boq/batch`,
    data
  );
  return response.data.data;
}

// ============================================
// BOQ Item Images
// ============================================

export interface BOQItemImage {
  id: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  uploadedAt: string;
}

/**
 * Get all images for a BOQ item
 */
export async function getBOQItemImages(
  projectId: string,
  boqItemId: string
): Promise<BOQItemImage[]> {
  const response = await api.get<SuccessResponse<BOQItemImage[]>>(
    `/projects/${projectId}/boq/${boqItemId}/images`
  );
  return response.data.data;
}

/**
 * Upload an image for a BOQ item
 */
export async function uploadBOQItemImage(
  projectId: string,
  boqItemId: string,
  file: File
): Promise<BOQItemImage> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<SuccessResponse<BOQItemImage>>(
    `/projects/${projectId}/boq/${boqItemId}/images`,
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
 * Delete an image from a BOQ item
 */
export async function deleteBOQItemImage(
  projectId: string,
  boqItemId: string,
  imageId: string
): Promise<void> {
  await api.delete(`/projects/${projectId}/boq/${boqItemId}/images/${imageId}`);
}
