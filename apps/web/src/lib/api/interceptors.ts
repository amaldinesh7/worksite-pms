/**
 * Axios Interceptors
 *
 * Simple auth flow:
 * - Attaches access token and organization headers to all requests
 * - On 401 from our API, clears auth state and redirects to login
 */

import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../../stores/auth.store';

// Our API base URL to distinguish from external APIs
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Setup request interceptor to attach auth and organization headers
 */
export function setupRequestInterceptor(api: AxiosInstance) {
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const { accessToken, user, organization, userRole } = useAuthStore.getState();

      if (config.headers) {
        // Add Authorization header
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }

        // Add organization context headers
        if (organization) {
          config.headers['x-organization-id'] = organization.id;
        }
        if (user) {
          config.headers['x-user-id'] = user.id;
        }
        if (userRole) {
          config.headers['x-user-role'] = userRole;
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );
}

/**
 * Check if the request URL is to our API (not external services)
 */
function isOurApi(url: string | undefined): boolean {
  if (!url) return false;
  // Check if it's a relative URL (starts with /) or matches our API base
  return url.startsWith('/') || url.startsWith(API_BASE);
}

/**
 * Setup response interceptor to handle 401 errors
 */
export function setupResponseInterceptor(api: AxiosInstance) {
  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const requestUrl = error.config?.url;

      // Only handle 401 from OUR API endpoints (not external APIs)
      if (error.response?.status === 401 && isOurApi(requestUrl)) {
        // Don't logout for auth endpoints (login flow)
        const isAuthEndpoint = requestUrl?.includes('/auth/');
        if (!isAuthEndpoint) {
          useAuthStore.getState().logoutUser();
          // Redirect to login page
          window.location.href = '/auth';
        }
      }

      return Promise.reject(error);
    }
  );
}
