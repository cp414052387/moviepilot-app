/**
 * Axios Client Configuration
 *
 * Configures HTTP client with:
 * - Base URL for MoviePilot API
 * - Request/Response interceptors for auth token injection
 * - Error handling
 */

import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';

// API Configuration
export const API_BASE_URL = 'https://api.movie-pilot.org/api/v1';
export const TOKEN_KEY = 'moviepilot_auth_token';
export const SERVER_URL_KEY = 'moviepilot_server_url';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 * Injects auth token into Authorization header
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Failed to retrieve auth token from secure storage:', error);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handles 401 errors (unauthorized) by clearing token
 * Can trigger logout/redirect to login screen
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear stored token
      try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } catch (e) {
        console.warn('Failed to clear auth token:', e);
      }
      // Note: Navigation to login screen should be handled by auth store
    }
    return Promise.reject(error);
  }
);

/**
 * Helper to set auth token (after login)
 */
export async function setAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/**
 * Helper to get current auth token
 */
export async function getAuthToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

/**
 * Helper to clear auth token (logout)
 */
export async function clearAuthToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

/**
 * Helper to set custom server URL
 */
export async function setServerUrl(url: string): Promise<void> {
  await SecureStore.setItemAsync(SERVER_URL_KEY, url);
  // Update base URL for future requests
  apiClient.defaults.baseURL = url;
}

/**
 * Helper to get custom server URL
 */
export async function getServerUrl(): Promise<string | null> {
  return await SecureStore.getItemAsync(SERVER_URL_KEY);
}
