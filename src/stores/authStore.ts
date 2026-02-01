/**
 * Authentication Store
 *
 * Zustand store for managing authentication state:
 * - User login/logout
 * - Auth token management
 * - User info storage
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { login as loginApi, getUserInfo as getUserInfoApi, type UserInfo } from '@/api/auth';
import { setAuthToken, clearAuthToken, getAuthToken } from '@/api/client';

interface AuthState {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserInfo | null;
  token: string | null;
  error: string | null;

  // Actions
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  getUserInfo: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

/**
 * Secure storage adapter for Zustand persist middleware
 */
const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await SecureStore.deleteItemAsync(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
      error: null,

      // Login action
      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await loginApi({ username, password });
          const { access_token } = response;

          // Store token securely
          await setAuthToken(access_token);

          // Get user info
          const userInfo = await getUserInfoApi();

          set({
            isAuthenticated: true,
            user: userInfo,
            token: access_token,
            isLoading: false,
            error: null,
          });
          return true;
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
            error: errorMessage,
          });
          return false;
        }
      },

      // Logout action
      logout: async () => {
        await clearAuthToken();
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          error: null,
        });
      },

      // Get user info
      getUserInfo: async () => {
        set({ isLoading: true });
        try {
          const userInfo = await getUserInfoApi();
          set({ user: userInfo, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          // If we can't get user info, we should probably logout
          await get().logout();
        }
      },

      // Check if user is authenticated on app start
      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const token = await getAuthToken();
          if (token) {
            // Verify token is still valid by fetching user info
            const userInfo = await getUserInfoApi();
            set({
              isAuthenticated: true,
              user: userInfo,
              token,
              isLoading: false,
            });
          } else {
            set({
              isAuthenticated: false,
              user: null,
              token: null,
              isLoading: false,
            });
          }
        } catch (error) {
          // Token is invalid or expired
          await clearAuthToken();
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
          });
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'moviepilot-auth',
      storage: createJSONStorage(() => secureStorage),
      // Only persist these fields
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
      }),
    }
  )
);
