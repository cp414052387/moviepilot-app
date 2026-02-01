/**
 * History API
 *
 * Handles activity history, logs, and statistics
 */

import { apiClient } from './client';
import type { HistoryItem, HistoryFilter, HistoryStats } from '@/types/history';

/**
 * Get history items
 * GET /history
 */
export async function getHistory(params?: {
  page?: number;
  size?: number;
  type?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}): Promise<{ items: HistoryItem[]; total: number; page: number; pageSize: number }> {
  const response = await apiClient.get<{ items: HistoryItem[]; total: number; page: number; pageSize: number }>('/history', {
    params: {
      page: params?.page || 1,
      size: params?.size || 50,
      type: params?.type,
      status: params?.status,
      date_from: params?.date_from,
      date_to: params?.date_to,
      search: params?.search,
    },
  });
  return response.data;
}

/**
 * Get history statistics
 * GET /history/stats
 */
export async function getHistoryStats(): Promise<HistoryStats> {
  const response = await apiClient.get<HistoryStats>('/history/stats');
  return response.data;
}

/**
 * Delete history item
 * DELETE /history/{itemId}
 */
export async function deleteHistoryItem(itemId: string): Promise<void> {
  await apiClient.delete(`/history/${itemId}`);
}

/**
 * Clear all history
 * DELETE /history
 */
export async function clearHistory(params?: { type?: string; date_before?: string }): Promise<void> {
  await apiClient.delete('/history', { params });
}
