/**
 * Axios Interceptors
 *
 * Handles request/response intercepting for:
 * - Attaching access tokens to requests
 * - Auto-refreshing tokens on 401 responses
 */

import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../../stores/auth.store';
import type { ApiSuccessResponse } from './types';

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

/**
 * Setup request interceptor to attach access token
 */
export function setupRequestInterceptor(api: AxiosInstance) {
  api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const accessToken = useAuthStore.getState().accessToken;
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
}

/**
 * Setup response interceptor for token refresh
 */
export function setupResponseInterceptor(api: AxiosInstance) {
  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // Handle 401 Unauthorized - attempt token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        // Don't retry refresh endpoint itself
        if (originalRequest.url?.includes('/auth/refresh')) {
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
          const response =
            await api.post<ApiSuccessResponse<{ accessToken: string; expiresIn: number }>>(
              '/auth/refresh'
            );

          const newAccessToken = response.data.data.accessToken;
          useAuthStore.getState().setAccessToken(newAccessToken);
          onTokenRefreshed(newAccessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          return api(originalRequest);
        } catch (refreshError) {
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
}
