// Auth Store - Zustand store for authentication state

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  phone: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;

  // Auth flow state
  phoneNumber: string;
  countryCode: string;
  step: 'phone' | 'otp' | 'complete';

  // Actions
  setPhoneNumber: (phone: string) => void;
  setCountryCode: (code: string) => void;
  setStep: (step: 'phone' | 'otp' | 'complete') => void;
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  updateTokens: (tokens: AuthTokens) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      phoneNumber: '',
      countryCode: '+91',
      step: 'phone',

      setPhoneNumber: (phone) => set({ phoneNumber: phone }),
      setCountryCode: (code) => set({ countryCode: code }),
      setStep: (step) => set({ step }),

      login: (user, tokens) =>
        set({
          user,
          tokens,
          isAuthenticated: true,
          step: 'complete',
        }),

      logout: () =>
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          phoneNumber: '',
          step: 'phone',
        }),

      updateTokens: (tokens) => set({ tokens }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
