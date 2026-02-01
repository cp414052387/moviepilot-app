/**
 * Subscription API
 *
 * Handles subscription CRUD operations:
 * - List subscriptions
 * - Add new subscription
 * - Update subscription
 * - Delete subscription
 * - Refresh subscription status
 */

import { apiClient } from './client';
import type {
  Subscription,
  SubscriptionRequest,
  SubscriptionResponse,
} from '@/types';

/**
 * Get all subscriptions
 * GET /subscribe/
 */
export async function getSubscriptions(params?: {
  page?: number;
  size?: number;
  status?: string;
}): Promise<SubscriptionResponse> {
  const response = await apiClient.get<SubscriptionResponse>('/subscribe/', {
    params: {
      page: params?.page || 1,
      size: params?.size || 20,
      status: params?.status,
    },
  });
  return response.data;
}

/**
 * Get subscription by ID
 * GET /subscribe/{subscribe_id}
 */
export async function getSubscription(subscribeId: string): Promise<Subscription> {
  const response = await apiClient.get<Subscription>(`/subscribe/${subscribeId}`);
  return response.data;
}

/**
 * Create new subscription
 * POST /subscribe/
 */
export async function createSubscription(
  request: SubscriptionRequest
): Promise<Subscription> {
  const response = await apiClient.post<Subscription>('/subscribe/', request);
  return response.data;
}

/**
 * Update existing subscription
 * PUT /subscribe/
 */
export async function updateSubscription(params: {
  subscribeId: string;
  seasons?: number[];
}): Promise<Subscription> {
  const response = await apiClient.put<Subscription>('/subscribe/', {
    subscribe_id: params.subscribeId,
    seasons: params.seasons,
  });
  return response.data;
}

/**
 * Delete subscription
 * DELETE /subscribe/{subscribe_id}
 */
export async function deleteSubscription(subscribeId: string): Promise<void> {
  await apiClient.delete(`/subscribe/${subscribeId}`);
}

/**
 * Refresh subscription status
 * GET /subscribe/refresh
 * Can refresh all or specific subscription
 */
export async function refreshSubscription(subscribeId?: string): Promise<{ message: string }> {
  const url = subscribeId ? `/subscribe/refresh?id=${subscribeId}` : '/subscribe/refresh';
  const response = await apiClient.get<{ message: string }>(url);
  return response.data;
}

/**
 * Batch refresh subscriptions
 * POST /subscribe/batch-refresh
 */
export async function batchRefreshSubscriptions(subscribeIds: string[]): Promise<{
  success: number;
  failed: number;
  results: Array<{ id: string; success: boolean; message?: string }>;
}> {
  const response = await apiClient.post('/subscribe/batch-refresh', {
    subscribe_ids: subscribeIds,
  });
  return response.data;
}
