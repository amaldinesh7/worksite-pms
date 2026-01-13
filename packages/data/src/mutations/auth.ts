import { useMutation, useQueryClient } from '@tanstack/react-query';

// Auth API types
interface SendOtpParams {
  phone: string;
  countryCode: string;
}

interface SendOtpResponse {
  message: string;
  phone: string;
  expiresAt: string;
  devHint?: string;
}

interface VerifyOtpParams {
  phone: string;
  code: string;
  countryCode: string;
}

interface VerifyOtpResponse {
  message: string;
  user: { id: string; name: string; phone: string };
  organization: { id: string; name: string } | null;
  role: 'ADMIN' | 'MANAGER' | 'ACCOUNTANT' | null;
  accessToken: string;
  expiresIn: number;
  isNewUser: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string; code: string };
}

// Generic request function type (injected from web app)
type RequestFn = <T>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  url: string,
  data?: unknown
) => Promise<ApiResponse<T>>;

let requestFn: RequestFn | null = null;

/**
 * Initialize auth mutations with the API request function.
 * Must be called before using any auth mutations.
 */
export function initAuthMutations(fn: RequestFn) {
  requestFn = fn;
}

function getRequestFn(): RequestFn {
  if (!requestFn) {
    throw new Error('Auth mutations not initialized. Call initAuthMutations first.');
  }
  return requestFn;
}

/**
 * Send OTP to phone number
 */
export function useSendOtp() {
  return useMutation({
    mutationFn: async (params: SendOtpParams): Promise<ApiResponse<SendOtpResponse>> => {
      const request = getRequestFn();
      return request<SendOtpResponse>('post', '/auth/send-otp', params);
    },
  });
}

/**
 * Verify OTP and authenticate user
 */
export function useVerifyOtp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: VerifyOtpParams): Promise<ApiResponse<VerifyOtpResponse>> => {
      const request = getRequestFn();
      return request<VerifyOtpResponse>('post', '/auth/verify-otp', params);
    },
    onSuccess: () => {
      // Invalidate any user-related queries after successful auth
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

/**
 * Logout user
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<ApiResponse<{ message: string }>> => {
      const request = getRequestFn();
      return request<{ message: string }>('post', '/auth/logout');
    },
    onSuccess: () => {
      // Clear all queries on logout
      queryClient.clear();
    },
  });
}

// Export types for consumers
export type { SendOtpParams, SendOtpResponse, VerifyOtpParams, VerifyOtpResponse };
