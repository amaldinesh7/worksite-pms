/**
 * Auth Store - Zustand store for authentication state
 *
 * Simple token-based auth:
 * - Single access token stored in localStorage
 * - Organization context stored alongside user
 * - On 401, user is redirected to login
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  name: string;
  phone: string;
}

export interface Organization {
  id: string;
  name: string;
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'ACCOUNTANT';

interface AuthState {
  // Persisted state
  user: User | null;
  organization: Organization | null;
  userRole: UserRole | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  // Auth flow state (not persisted)
  phoneNumber: string;
  countryCode: string;
  step: 'phone' | 'otp' | 'complete';

  // Actions
  setPhoneNumber: (phone: string) => void;
  setCountryCode: (code: string) => void;
  setStep: (step: 'phone' | 'otp' | 'complete') => void;
  loginSuccess: (params: {
    user: User;
    organization: Organization | null;
    role: UserRole | null;
    accessToken: string;
  }) => void;
  setOrganization: (organization: Organization) => void;
  updateUser: (userData: Partial<User>) => void;
  logoutUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      organization: null,
      userRole: null,
      accessToken: null,
      isAuthenticated: false,
      phoneNumber: '',
      countryCode: '+91',
      step: 'phone',

      // Auth flow actions
      setPhoneNumber: (phone) => set({ phoneNumber: phone }),
      setCountryCode: (code) => set({ countryCode: code }),
      setStep: (step) => set({ step }),

      /**
       * Called after successful OTP verification.
       * Stores user, organization, role, and token.
       */
      loginSuccess: ({ user, organization, role, accessToken }) =>
        set({
          user,
          organization,
          userRole: role,
          accessToken,
          isAuthenticated: true,
          step: 'complete',
        }),

      /**
       * Set organization after onboarding
       */
      setOrganization: (organization) =>
        set({
          organization,
        }),

      /**
       * Update user info (e.g., after onboarding)
       */
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      /**
       * Clear all auth state and redirect to login.
       */
      logoutUser: () =>
        set({
          user: null,
          organization: null,
          userRole: null,
          accessToken: null,
          isAuthenticated: false,
          phoneNumber: '',
          step: 'phone',
        }),
    }),
    {
      name: 'worksite-auth-storage',
      // Persist everything needed for auth
      partialize: (state) => ({
        user: state.user,
        organization: state.organization,
        userRole: state.userRole,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
