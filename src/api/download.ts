/**
 * Download API
 *
 * Handles download management:
 * - List all downloads
 * - Add new download
 * - Start/pause/delete tasks
 * - Get task details
 */

import { apiClient } from './client';
import type {
  DownloadTask,
  DownloadResponse,
  DownloadProgress,
} from '@/types';

/**
 * Get all downloads
 * GET /download/
 */
export async function getDownloads(params?: {
  page?: number;
}): Promise<DownloadResponse> {
  const response = await apiClient.get<DownloadResponse>('/download/', {
    params: {
      page: params?.page || 1,
    },
  });
  return response.data;
}

/**
 * Get download task by hash
 * GET /download/{hash}
 */
export async function getDownload(hash: string): Promise<DownloadTask> {
  const response = await apiClient.get<DownloadTask>(`/download/${hash}`);
  return response.data;
}

/**
 * Add new download
 * POST /download/
 */
export async function createDownload(params: {
  magnet?: string;
  torrent?: string;
  savePath?: string;
}): Promise<DownloadTask> {
  const response = await apiClient.post<DownloadTask>('/download/', {
    magnet: params.magnet,
    torrent: params.torrent,
    save_path: params.savePath,
  });
  return response.data;
}

/**
 * Start download task
 * GET /download/start/{hash}
 */
export async function startDownload(hash: string): Promise<{ message: string }> {
  const response = await apiClient.get<{ message: string }>(`/download/start/${hash}`);
  return response.data;
}

/**
 * Pause download task
 * GET /download/stop/{hash}
 */
export async function pauseDownload(hash: string): Promise<{ message: string }> {
  const response = await apiClient.get<{ message: string }>(`/download/stop/${hash}`);
  return response.data;
}

/**
 * Delete download task
 * DELETE /download/{hash}
 */
export async function deleteDownload(hash: string): Promise<void> {
  await apiClient.delete(`/download/${hash}`);
}

/**
 * Batch start downloads
 */
export async function batchStartDownloads(hashes: string[]): Promise<{
  success: number;
  failed: number;
  results: Array<{ hash: string; success: boolean; message?: string }>;
}> {
  const response = await apiClient.post('/download/batch-start', { hashes });
  return response.data;
}

/**
 * Batch pause downloads
 */
export async function batchPauseDownloads(hashes: string[]): Promise<{
  success: number;
  failed: number;
  results: Array<{ hash: string; success: boolean; message?: string }>;
}> {
  const response = await apiClient.post('/download/batch-stop', { hashes });
  return response.data;
}

/**
 * Batch delete downloads
 */
export async function batchDeleteDownloads(hashes: string[]): Promise<{
  success: number;
  failed: number;
  results: Array<{ hash: string; success: boolean; message?: string }>;
}> {
  const response = await apiClient.post('/download/batch-delete', { hashes });
  return response.data;
}
