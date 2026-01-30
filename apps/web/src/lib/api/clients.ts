/**
 * Clients API Module
 *
 * Provides functions for interacting with client-specific endpoints.
 * Clients are a special type of Party (type = CLIENT).
 */

import { api } from './client';
import type { AxiosResponse } from 'axios';
import type { ApiSuccessResponse, ApiPaginatedResponse, PaginatedResult } from './types';

// ============================================
// Types
// ============================================

export interface Client {
  id: string;
  organizationId: string;
  name: string;
  phone: string | null;
  location: string;
  type: 'CLIENT';
  credit: number;
  createdAt: string;
  _count?: {
    projectsAsClient: number;
  };
}

export interface ClientProject {
  id: string;
  name: string;
  status: string;
  location: string;
  startDate: string;
  endDate: string | null;
  amount: number | null;
}

export interface CreateClientInput {
  name: string;
  phone?: string;
  location: string;
}

export interface UpdateClientInput {
  name?: string;
  phone?: string;
  location?: string;
}

export interface ClientQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

// ============================================
// Clients API
// ============================================

/**
 * Fetch paginated list of clients
 */
export async function getClients(params?: ClientQueryParams): Promise<PaginatedResult<Client>> {
  const response: AxiosResponse<ApiPaginatedResponse<Client>> = await api.get('/parties', {
    params: {
      ...params,
      type: 'CLIENT',
    },
  });
  return response.data.data;
}

/**
 * Fetch a single client by ID
 */
export async function getClient(id: string): Promise<Client> {
  const response: AxiosResponse<ApiSuccessResponse<Client>> = await api.get(`/parties/${id}`);
  return response.data.data;
}

/**
 * Create a new client
 */
export async function createClient(data: CreateClientInput): Promise<Client> {
  const response: AxiosResponse<ApiSuccessResponse<Client>> = await api.post('/parties', {
    ...data,
    type: 'CLIENT',
  });
  return response.data.data;
}

/**
 * Update an existing client
 */
export async function updateClient(id: string, data: UpdateClientInput): Promise<Client> {
  const response: AxiosResponse<ApiSuccessResponse<Client>> = await api.put(`/parties/${id}`, data);
  return response.data.data;
}

/**
 * Get projects where this party is the client
 */
export async function getClientProjects(clientId: string): Promise<ClientProject[]> {
  const response: AxiosResponse<ApiSuccessResponse<ClientProject[]>> = await api.get(
    `/parties/${clientId}/client-projects`
  );
  return response.data.data;
}
