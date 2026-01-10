/**
 * Axios API Client
 *
 * SECURITY:
 * - All requests include credentials to send/receive httpOnly cookies
 * - Refresh tokens are handled via httpOnly cookies
 * - Access tokens are attached via Authorization header from auth store
 */

import axios from 'axios';
import { setupRequestInterceptor, setupResponseInterceptor } from './interceptors';
import type { ApiSuccessResponse, ApiErrorResponse, ApiResponse } from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Setup interceptors
setupRequestInterceptor(api);
setupResponseInterceptor(api);

/**
 * Wrapper for API calls that returns a consistent response shape
 */
export async function request<T>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  data?: unknown
): Promise<ApiResponse<T>> {
  try {
    const response = await api.request<ApiSuccessResponse<T>>({
      method,
      url,
      data,
    });

    return { success: true, data: response.data.data };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as ApiErrorResponse;
      return {
        success: false,
        error: errorData.error || { message: 'An error occurred', code: 'UNKNOWN' },
      };
    }

    return {
      success: false,
      error: { message: 'Network error', code: 'NETWORK_ERROR' },
    };
  }
}

export type { ApiResponse, ApiSuccessResponse, ApiErrorResponse };
