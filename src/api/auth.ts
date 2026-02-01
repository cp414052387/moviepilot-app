/**
 * Authentication API
 *
 * Handles login, logout, and user info endpoints
 */

import { apiClient } from './client';

// Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface UserInfo {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  level: number;
  is_admin: boolean;
}

/**
 * Login with username and password
 * POST /login/access-token
 */
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  // Login endpoint uses form data, not JSON
  const params = new URLSearchParams();
  params.append('username', credentials.username);
  params.append('password', credentials.password);

  const response = await apiClient.post<AuthResponse>('/login/access-token', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
}

/**
 * Get current user information
 * GET /user/info
 */
export async function getUserInfo(): Promise<UserInfo> {
  const response = await apiClient.get<UserInfo>('/user/info');
  return response.data;
}

/**
 * Logout (client-side)
 * Note: Server may not have a logout endpoint, so we just clear the token
 * Token clearing should be handled by the auth store
 */
export async function logout(): Promise<void> {
  // Optionally call a logout endpoint if it exists
  // await apiClient.post('/logout');
  // Token clearing is handled by clearAuthToken() in client.ts
}
