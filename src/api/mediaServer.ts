/**
 * Media Server API
 *
 * Handles media server management, library browsing, and file system operations
 */

import { apiClient } from './client';
import type {
  MediaServer,
  Library,
  MediaFile,
  MediaFolder,
  FileSystemItem,
  ScanProgress,
  MediaServerStats,
} from '@/types/mediaServer';

/**
 * Get all media servers
 * GET /server/servers
 */
export async function getMediaServers(): Promise<MediaServer[]> {
  const response = await apiClient.get<MediaServer[]>('/server/servers');
  return response.data;
}

/**
 * Get media server details
 * GET /server/servers/{serverId}
 */
export async function getMediaServerDetails(serverId: string): Promise<MediaServer> {
  const response = await apiClient.get<MediaServer>(`/server/servers/${serverId}`);
  return response.data;
}

/**
 * Test media server connection
 * POST /server/servers/{serverId}/test
 */
export async function testMediaServerConnection(serverId: string): Promise<{ success: boolean; message?: string }> {
  const response = await apiClient.post<{ success: boolean; message?: string }>(
    `/server/servers/${serverId}/test`
  );
  return response.data;
}

/**
 * Get all libraries
 * GET /server/libraries
 */
export async function getLibraries(serverId?: string): Promise<Library[]> {
  const response = await apiClient.get<Library[]>('/server/libraries', {
    params: serverId ? { server_id: serverId } : undefined,
  });
  return response.data;
}

/**
 * Get library details
 * GET /server/libraries/{libraryId}
 */
export async function getLibraryDetails(libraryId: string): Promise<Library> {
  const response = await apiClient.get<Library>(`/server/libraries/${libraryId}`);
  return response.data;
}

/**
 * Browse file system
 * GET /server/browse
 */
export async function browseFileSystem(params: {
  path: string;
  serverId?: string;
  libraryId?: string;
}): Promise<FileSystemItem[]> {
  const response = await apiClient.get<FileSystemItem[]>('/server/browse', {
    params: {
      path: params.path,
      server_id: params.serverId,
      library_id: params.libraryId,
    },
  });
  return response.data;
}

/**
 * Get media file details
 * GET /server/files/{fileId}
 */
export async function getMediaFileDetails(fileId: string): Promise<MediaFile> {
  const response = await apiClient.get<MediaFile>(`/server/files/${fileId}`);
  return response.data;
}

/**
 * Start library scan
 * POST /server/scan
 */
export async function startScan(params: {
  serverId: string;
  libraryId?: string;
}): Promise<ScanProgress> {
  const response = await apiClient.post<ScanProgress>('/server/scan', {
    server_id: params.serverId,
    library_id: params.libraryId,
  });
  return response.data;
}

/**
 * Get scan progress
 * GET /server/scan/{scanId}
 */
export async function getScanProgress(scanId: string): Promise<ScanProgress> {
  const response = await apiClient.get<ScanProgress>(`/server/scan/${scanId}`);
  return response.data;
}

/**
 * Get active scans
 * GET /server/scans
 */
export async function getActiveScans(): Promise<ScanProgress[]> {
  const response = await apiClient.get<ScanProgress[]>('/server/scans');
  return response.data;
}

/**
 * Cancel scan
 * DELETE /server/scan/{scanId}
 */
export async function cancelScan(scanId: string): Promise<void> {
  await apiClient.delete(`/server/scan/${scanId}`);
}

/**
 * Get media server statistics
 * GET /server/stats
 */
export async function getMediaServerStats(): Promise<MediaServerStats> {
  const response = await apiClient.get<MediaServerStats>('/server/stats');
  return response.data;
}

/**
 * Refresh media server metadata
 * POST /server/servers/{serverId}/refresh
 */
export async function refreshMediaServer(serverId: string): Promise<void> {
  await apiClient.post(`/server/servers/${serverId}/refresh`);
}

/**
 * Get recent media additions
 * GET /server/recent
 */
export async function getRecentAdditions(params: {
  serverId?: string;
  libraryId?: string;
  limit?: number;
}): Promise<{ items: any[]; total: number }> {
  const response = await apiClient.get<{ items: any[]; total: number }>('/server/recent', {
    params: {
      server_id: params.serverId,
      library_id: params.libraryId,
      limit: params.limit || 20,
    },
  });
  return response.data;
}
