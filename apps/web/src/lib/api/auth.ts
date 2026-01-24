/**
 * Auth API Endpoints
 */

import { request } from './client';

export interface OnboardingInput {
  userName: string;
  organizationName: string;
  organizationType?: 'CONSTRUCTION' | 'INTERIOR' | 'CONTRACTOR' | 'OTHER';
}

export interface OnboardingResponse {
  message: string;
  user: { id: string; name: string; phone: string };
  organization: { id: string; name: string };
  role: string | null;
}

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
   */
  refreshToken: () => request<{ accessToken: string; expiresIn: number }>('post', '/auth/refresh'),

  /**
   * Logout and invalidate refresh token.
   */
  logout: () => request<{ message: string }>('post', '/auth/logout'),

  /**
   * Get current authenticated user info
   */
  me: () =>
    request<{ id: string; name: string; phone: string; createdAt: string }>('get', '/auth/me'),

  /**
   * Complete onboarding for new users without organization
   */
  onboarding: (data: OnboardingInput) =>
    request<OnboardingResponse>('post', '/auth/onboarding', data),
};

/**
 * Complete onboarding for new users
 */
export async function completeOnboarding(data: OnboardingInput) {
  return authApi.onboarding(data);
}
