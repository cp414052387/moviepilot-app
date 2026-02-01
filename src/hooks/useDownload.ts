/**
 * useDownload Hook
 *
 * Custom hook for managing downloads:
 * - Fetch download list
 * - Real-time progress updates via SSE
 * - Task control (start/pause/delete)
 * - Filter by status
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDownloads,
  getDownload,
  startDownload,
  pauseDownload,
  deleteDownload,
} from '@/api/download';
import { sseService, connectSSE } from '@/services/SSEService';
import type { DownloadTask, DownloadStatus } from '@/types';

// Download status filter type
export type DownloadStatusFilter = 'all' | DownloadStatus;

/**
 * Download management hook
 */
export function useDownload(statusFilter: DownloadStatusFilter = 'all') {
  const queryClient = useQueryClient();
  const sseConnected = useRef(false);

  // Fetch downloads
  const {
    data: downloadsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['downloads'],
    queryFn: () => getDownloads(),
    staleTime: 30000, // 30 seconds
  });

  // Local state for real-time updates
  const [downloads, setDownloads] = useState<DownloadTask[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  // Update downloads when query data changes
  useEffect(() => {
    if (downloadsData?.results) {
      let filtered = downloadsData.results;

      // Apply status filter
      if (statusFilter !== 'all') {
        filtered = filtered.filter((d) => d.status === statusFilter);
      }

      setDownloads(filtered);
    }
  }, [downloadsData, statusFilter]);

  // Setup SSE for real-time updates
  useEffect(() => {
    if (!sseConnected.current) {
      connectSSE();
      sseConnected.current = true;
    }

    // Listen for download progress updates
    const handleProgress = (data: unknown) => {
      if (typeof data === 'object' && data !== null) {
        const progress = data as { hash: string; progress: number };
        if (progress.hash && typeof progress.progress === 'number') {
          setProgressMap((prev) => ({
            ...prev,
            [progress.hash]: progress.progress,
          }));
        }
      }
    };

    sseService.on('download-progress', handleProgress);

    return () => {
      sseService.off('download-progress', handleProgress);
    };
  }, []);

  // Start download mutation
  const startMutation = useMutation({
    mutationFn: (hash: string) => startDownload(hash),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
    },
  });

  // Pause download mutation
  const pauseMutation = useMutation({
    mutationFn: (hash: string) => pauseDownload(hash),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
    },
  });

  // Delete download mutation
  const deleteMutation = useMutation({
    mutationFn: (hash: string) => deleteDownload(hash),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downloads'] });
    },
  });

  // Start download
  const start = useCallback(
    async (hash: string) => {
      await startMutation.mutateAsync(hash);
    },
    [startMutation]
  );

  // Pause download
  const pause = useCallback(
    async (hash: string) => {
      await pauseMutation.mutateAsync(hash);
    },
    [pauseMutation]
  );

  // Delete download
  const remove = useCallback(
    async (hash: string) => {
      await deleteMutation.mutateAsync(hash);
    },
    [deleteMutation]
  );

  // Refresh downloads
  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Get progress for specific download
  const getProgress = useCallback(
    (hash: string): number => {
      // Use SSE progress if available
      if (progressMap[hash] !== undefined) {
        return progressMap[hash];
      }
      // Fallback to download data
      const download = downloads.find((d) => d.hash === hash);
      return download?.progress ?? 0;
    },
    [progressMap, downloads]
  );

  // Filter downloads by status
  const activeDownloads = downloads.filter((d) => d.status === 'downloading');
  const pausedDownloads = downloads.filter((d) => d.status === 'paused');
  const completedDownloads = downloads.filter((d) => d.status === 'completed' || d.status === 'seeding');

  return {
    // Data
    downloads,
    activeDownloads,
    pausedDownloads,
    completedDownloads,
    isLoading,

    // Actions
    start,
    pause,
    remove,
    refresh,

    // Utilities
    getProgress,

    // Mutation states
    isStarting: startMutation.isPending,
    isPausing: pauseMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

/**
 * Hook for single download detail
 */
export function useDownloadDetail(hash: string) {
  const {
    data: download,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['download', hash],
    queryFn: () => getDownload(hash),
    enabled: !!hash,
    staleTime: 10000, // 10 seconds
  });

  const progress = useDownloadProgress(hash);

  return {
    download,
    progress,
    isLoading,
    refresh: refetch,
  };
}

/**
 * Hook for download progress via SSE
 */
export function useDownloadProgress(hash: string): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleProgress = (data: unknown) => {
      if (typeof data === 'object' && data !== null) {
        const progressData = data as { hash: string; progress: number };
        if (progressData.hash === hash && typeof progressData.progress === 'number') {
          setProgress(progressData.progress);
        }
      }
    };

    sseService.on('download-progress', handleProgress);

    return () => {
      sseService.off('download-progress', handleProgress);
    };
  }, [hash]);

  return progress;
}
