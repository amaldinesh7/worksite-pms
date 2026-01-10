/**
 * Auth Store - Zustand store for authentication state
 *
 * SECURITY THREAT MODEL:
 * ----------------------
 * - Access tokens are stored ONLY in memory (this store, not persisted)
 *   This protects against XSS attacks that could steal tokens from localStorage
 *
 * - Refresh tokens are NEVER stored on the client. They are handled via:
 *   1. Server-set httpOnly, Secure, SameSite=Strict cookies
 *   2. The /auth/refresh endpoint reads the cookie and returns a new access token
 *   3. This prevents JavaScript (including XSS payloads) from accessing refresh tokens
 *
 * - Only user profile data is persisted to localStorage for UX (remember who's logged in)
 *   This data is non-sensitive and improves the user experience on page reload
 *
 * - On page load, the app should call /auth/refresh to get a new access token
 *   if the user appears to be logged in (has persisted user data)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  phone: string;
}

interface AuthState {
  // Persisted state (safe to store)
  user: User | null;
  isAuthenticated: boolean;

  // In-memory only state (NEVER persisted)
  accessToken: string | null;

  // Auth flow state (not persisted)
  phoneNumber: string;
  countryCode: string;
  step: 'phone' | 'otp' | 'complete';

  // Actions
  setPhoneNumber: (phone: string) => void;
  setCountryCode: (code: string) => void;
  setStep: (step: 'phone' | 'otp' | 'complete') => void;
  setAccessToken: (token: string | null) => void;
  loginSuccess: (user: User, accessToken: string) => void;
  logoutUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      accessToken: null,
      phoneNumber: '',
      countryCode: '+91',
      step: 'phone',

      // Auth flow actions
      setPhoneNumber: (phone) => set({ phoneNumber: phone }),
      setCountryCode: (code) => set({ countryCode: code }),
      setStep: (step) => set({ step }),

      // Token actions (in-memory only)
      setAccessToken: (token) => set({ accessToken: token }),

      /**
       * Called after successful OTP verification.
       * - Stores user profile (persisted for UX)
       * - Stores access token in memory only
       * - Refresh token is set as httpOnly cookie by the server
       */
      loginSuccess: (user, accessToken) =>
        set({
          user,
          accessToken,
          isAuthenticated: true,
          step: 'complete',
        }),

      /**
       * Clear all auth state.
       * Server should also be called to clear the httpOnly refresh token cookie.
       */
      logoutUser: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          phoneNumber: '',
          step: 'phone',
        }),
    }),
    {
      name: 'auth-storage',
      /**
       * SECURITY: Only persist non-sensitive user profile data.
       * Tokens are NEVER written to localStorage.
       */
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
