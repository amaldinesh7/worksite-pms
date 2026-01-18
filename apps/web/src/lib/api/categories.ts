/**
 * Categories API Module
 *
 * Provides functions for interacting with the categories endpoints.
 * Uses the existing backend API structure:
 * - Category Types: The sections (e.g., "Labour Types", "Material Types")
 * - Category Items: The items under each section (e.g., "General Labourer")
 */

import { api } from './client';
import type { AxiosResponse } from 'axios';

// ============================================
// Types
// ============================================

export interface CategoryType {
  id: string;
  key: string;
  label: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items?: CategoryItem[];
}

export interface CategoryItem {
  id: string;
  organizationId: string;
  categoryTypeId: string;
  name: string;
  isActive: boolean;
  isEditable: boolean;
  createdAt: string;
  updatedAt: string;
  categoryType?: CategoryType;
}

export interface CreateCategoryItemInput {
  categoryTypeId: string;
  name: string;
}

export interface ApiSuccessResponse<T> {
  data: T;
}

// ============================================
// Category Types API
// ============================================

/**
 * Fetch all category types for the organization
 */
export async function getCategoryTypes(): Promise<CategoryType[]> {
  const response: AxiosResponse<ApiSuccessResponse<CategoryType[]>> =
    await api.get('/categories/types');
  return response.data.data;
}

/**
 * Fetch a single category type by its key
 */
export async function getCategoryTypeByKey(key: string): Promise<CategoryType> {
  const response: AxiosResponse<ApiSuccessResponse<CategoryType>> = await api.get(
    `/categories/types/key/${key}`
  );
  return response.data.data;
}

// ============================================
// Category Items API
// ============================================

/**
 * Fetch all category items for a given type key
 */
export async function getCategoryItems(typeKey: string): Promise<CategoryItem[]> {
  const response: AxiosResponse<ApiSuccessResponse<CategoryItem[]>> = await api.get(
    `/categories/items/type/${typeKey}`
  );
  return response.data.data;
}

/**
 * Create a new category item
 */
export async function createCategoryItem(data: CreateCategoryItemInput): Promise<CategoryItem> {
  const response: AxiosResponse<ApiSuccessResponse<CategoryItem>> = await api.post(
    '/categories/items',
    data
  );
  return response.data.data;
}

/**
 * Update a category item
 */
export async function updateCategoryItem(
  id: string,
  data: { name?: string; isActive?: boolean }
): Promise<CategoryItem> {
  const response: AxiosResponse<ApiSuccessResponse<CategoryItem>> = await api.put(
    `/categories/items/${id}`,
    data
  );
  return response.data.data;
}

/**
 * Delete a category item
 */
export async function deleteCategoryItem(id: string): Promise<void> {
  await api.delete(`/categories/items/${id}`);
}
