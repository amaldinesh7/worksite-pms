/**
 * Axios API Client
 *
 * SECURITY:
 * - All requests include credentials to send/receive httpOnly cookies
 * - Refresh tokens are handled via httpOnly cookies, not in request/response bodies
 * - Access tokens are attached via Authorization header from auth store
 * - Automatic token refresh on 401 responses
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/auth.store';

// ===========================================
// Axios Instance Configuration
// ===========================================

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Include httpOnly cookies in requests
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// ===========================================
// Request Interceptor
// ===========================================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Attach access token to Authorization header if available
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===========================================
// Response Interceptor
// ===========================================

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't retry refresh endpoint itself
      if (originalRequest.url?.includes('/auth/refresh')) {
        // Refresh failed - clear auth state
        useAuthStore.getState().logoutUser();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Wait for the refresh to complete
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        const response =
          await api.post<ApiSuccessResponse<{ accessToken: string; expiresIn: number }>>(
            '/auth/refresh'
          );

        const newAccessToken = response.data.data.accessToken;

        // Update auth store with new token
        useAuthStore.getState().setAccessToken(newAccessToken);

        // Notify waiting requests
        onTokenRefreshed(newAccessToken);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear auth state and redirect to login
        useAuthStore.getState().logoutUser();
        refreshSubscribers = [];
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ===========================================
// Response Types
// ===========================================

interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
  };
}

// ===========================================
// API Helper Functions
// ===========================================

/**
 * Wrapper for API calls that returns a consistent response shape
 */
async function request<T>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  data?: unknown
): Promise<{ success: boolean; data?: T; error?: { message: string; code: string } }> {
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

// ===========================================
// Auth API
// ===========================================

export const authApi = {
  /**
   * Send OTP to phone number
   */
  sendOtp: (phone: string, countryCode: string = '+91') =>
    request<{ message: string; phone: string; expiresAt: string; devHint?: string }>(
      'post',
      '/auth/send-otp',
      { phone, countryCode }
    ),

  /**
   * Verify OTP and receive access token.
   * Refresh token is automatically set as httpOnly cookie by the server.
   */
  verifyOtp: (phone: string, code: string, countryCode: string = '+91') =>
    request<{
      message: string;
      user: { id: string; name: string; phone: string };
      tokens: { accessToken: string; expiresIn: number };
      isNewUser: boolean;
    }>('post', '/auth/verify-otp', { phone, countryCode, code }),

  /**
   * Refresh access token using httpOnly cookie.
   * No parameters needed - refresh token is read from cookie by server.
   * New refresh token is set as httpOnly cookie (token rotation).
   */
  refreshToken: () => request<{ accessToken: string; expiresIn: number }>('post', '/auth/refresh'),

  /**
   * Logout and invalidate refresh token.
   * No parameters needed - refresh token is read from cookie by server.
   * Cookie is cleared by server response.
   */
  logout: () => request<{ message: string }>('post', '/auth/logout'),

  /**
   * Get current authenticated user info
   */
  me: () =>
    request<{ id: string; name: string; phone: string; createdAt: string }>('get', '/auth/me'),
};
