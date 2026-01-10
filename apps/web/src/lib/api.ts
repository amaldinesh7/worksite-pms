// API Client for auth endpoints

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      success: false,
      error: data.error || { message: 'An error occurred', code: 'UNKNOWN' },
    };
  }

  return { success: true, data: data.data };
}

// Auth API
export const authApi = {
  sendOtp: (phone: string, countryCode: string = '+91') =>
    request<{ message: string; phone: string; expiresAt: string; devHint?: string }>(
      '/auth/send-otp',
      {
        method: 'POST',
        body: JSON.stringify({ phone, countryCode }),
      }
    ),

  verifyOtp: (phone: string, code: string, countryCode: string = '+91') =>
    request<{
      message: string;
      user: { id: string; name: string; phone: string };
      tokens: { accessToken: string; refreshToken: string; expiresIn: number };
      isNewUser: boolean;
    }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, countryCode, code }),
    }),

  refreshToken: (refreshToken: string) =>
    request<{ accessToken: string; refreshToken: string; expiresIn: number }>(
      '/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }
    ),

  logout: (refreshToken: string) =>
    request<{ message: string }>('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
};
