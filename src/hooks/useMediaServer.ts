/**
 * Media Server Hook
 *
 * Manages media server data and state:
 * - Server list and details
 * - Library browsing
 * - File system navigation
 * - Scan progress monitoring
 */

import { useState, useCallback, useEffect } from 'react';
import {
  getMediaServers,
  getMediaServerDetails,
  getLibraries,
  getLibraryDetails,
  browseFileSystem,
  startScan,
  getActiveScans,
  cancelScan,
  getMediaServerStats,
  getRecentAdditions,
  refreshMediaServer,
  testMediaServerConnection,
} from '@/api/mediaServer';
import type {
  MediaServer,
  Library,
  FileSystemItem,
  ScanProgress,
  MediaServerStats,
} from '@/types/mediaServer';

export function useMediaServer() {
  // Server state
  const [servers, setServers] = useState<MediaServer[]>([]);
  const [selectedServer, setSelectedServer] = useState<MediaServer | null>(null);
  const [isLoadingServers, setIsLoadingServers] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Library state
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null);
  const [isLoadingLibraries, setIsLoadingLibraries] = useState(false);

  // File system state
  const [currentPath, setCurrentPath] = useState('/');
  const [fileSystemItems, setFileSystemItems] = useState<FileSystemItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [pathHistory, setPathHistory] = useState<string[]>([]);

  // Scan state
  const [activeScans, setActiveScans] = useState<ScanProgress[]>([]);
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Stats state
  const [stats, setStats] = useState<MediaServerStats | null>(null);

  // Recent additions
  const [recentAdditions, setRecentAdditions] = useState<any[]>([]);

  /**
   * Fetch all media servers
   */
  const fetchServers = useCallback(async () => {
    try {
      setIsLoadingServers(true);
      setServerError(null);
      const data = await getMediaServers();
      setServers(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch servers';
      setServerError(errorMessage);
      console.error('Fetch servers error:', err);
      return [];
    } finally {
      setIsLoadingServers(false);
    }
  }, []);

  /**
   * Fetch server details
   */
  const fetchServerDetails = useCallback(async (serverId: string) => {
    try {
      const data = await getMediaServerDetails(serverId);
      setSelectedServer(data);
      return data;
    } catch (err) {
      console.error('Fetch server details error:', err);
      return null;
    }
  }, []);

  /**
   * Test server connection
   */
  const testConnection = useCallback(async (serverId: string) => {
    try {
      const result = await testMediaServerConnection(serverId);
      return result;
    } catch (err) {
      console.error('Test connection error:', err);
      return { success: false, message: 'Connection failed' };
    }
  }, []);

  /**
   * Refresh server
   */
  const refreshServer = useCallback(async (serverId: string) => {
    try {
      await refreshMediaServer(serverId);
      await fetchServers(); // Refresh server list
    } catch (err) {
      console.error('Refresh server error:', err);
    }
  }, [fetchServers]);

  /**
   * Fetch libraries
   */
  const fetchLibraries = useCallback(async (serverId?: string) => {
    try {
      setIsLoadingLibraries(true);
      const data = await getLibraries(serverId);
      setLibraries(data);
      return data;
    } catch (err) {
      console.error('Fetch libraries error:', err);
      return [];
    } finally {
      setIsLoadingLibraries(false);
    }
  }, []);

  /**
   * Fetch library details
   */
  const fetchLibraryDetails = useCallback(async (libraryId: string) => {
    try {
      const data = await getLibraryDetails(libraryId);
      setSelectedLibrary(data);
      return data;
    } catch (err) {
      console.error('Fetch library details error:', err);
      return null;
    }
  }, []);

  /**
   * Browse file system
   */
  const browsePath = useCallback(async (
    path: string,
    serverId?: string,
    libraryId?: string,
    addToHistory = true
  ) => {
    try {
      setIsLoadingFiles(true);
      const data = await browseFileSystem({ path, serverId, libraryId });
      setFileSystemItems(data);
      setCurrentPath(path);

      if (addToHistory && path !== currentPath) {
        setPathHistory((prev) => {
          const newHistory = [...prev];
          // Remove any future history if we're navigating from a middle point
          const currentIndex = newHistory.indexOf(currentPath);
          if (currentIndex >= 0) {
            return [...newHistory.slice(0, currentIndex + 1), path];
          }
          return [...newHistory, path];
        });
      }

      return data;
    } catch (err) {
      console.error('Browse path error:', err);
      return [];
    } finally {
      setIsLoadingFiles(false);
    }
  }, [currentPath]);

  /**
   * Navigate to parent directory
   */
  const navigateUp = useCallback(() => {
    if (pathHistory.length > 1) {
      const newPath = pathHistory[pathHistory.length - 2];
      setPathHistory((prev) => prev.slice(0, -1));
      return newPath;
    }
    return currentPath;
  }, [currentPath, pathHistory]);

  /**
   * Navigate to specific path in history
   */
  const navigateToPath = useCallback((index: number) => {
    if (index >= 0 && index < pathHistory.length) {
      const newPath = pathHistory[index];
      setPathHistory((prev) => prev.slice(0, index + 1));
      return newPath;
    }
    return currentPath;
  }, [currentPath, pathHistory]);

  /**
   * Start scan
   */
  const startLibraryScan = useCallback(async (serverId: string, libraryId?: string) => {
    try {
      setIsScanning(true);
      const progress = await startScan({ serverId, libraryId });
      setScanProgress(progress);
      return progress;
    } catch (err) {
      console.error('Start scan error:', err);
      setIsScanning(false);
      return null;
    }
  }, []);

  /**
   * Fetch active scans
   */
  const fetchActiveScans = useCallback(async () => {
    try {
      const data = await getActiveScans();
      setActiveScans(data);
      if (data.length > 0) {
        setScanProgress(data[0]);
        setIsScanning(true);
      } else {
        setIsScanning(false);
        setScanProgress(null);
      }
      return data;
    } catch (err) {
      console.error('Fetch active scans error:', err);
      return [];
    }
  }, []);

  /**
   * Cancel scan
   */
  const cancelActiveScan = useCallback(async (scanId: string) => {
    try {
      await cancelScan(scanId);
      await fetchActiveScans();
    } catch (err) {
      console.error('Cancel scan error:', err);
    }
  }, [fetchActiveScans]);

  /**
   * Fetch stats
   */
  const fetchStats = useCallback(async () => {
    try {
      const data = await getMediaServerStats();
      setStats(data);
      return data;
    } catch (err) {
      console.error('Fetch stats error:', err);
      return null;
    }
  }, []);

  /**
   * Fetch recent additions
   */
  const fetchRecentAdditions = useCallback(async (options?: { serverId?: string; libraryId?: string; limit?: number }) => {
    try {
      const data = await getRecentAdditions(options || {});
      setRecentAdditions(data.items);
      return data.items;
    } catch (err) {
      console.error('Fetch recent additions error:', err);
      return [];
    }
  }, []);

  /**
   * Refresh all data
   */
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchServers(),
      fetchLibraries(),
      fetchActiveScans(),
      fetchStats(),
      fetchRecentAdditions(),
    ]);
  }, [fetchServers, fetchLibraries, fetchActiveScans, fetchStats, fetchRecentAdditions]);

  // Auto-refresh active scans
  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        fetchActiveScans();
      }, 3000); // Poll every 3 seconds

      return () => clearInterval(interval);
    }
  }, [isScanning, fetchActiveScans]);

  return {
    // Servers
    servers,
    selectedServer,
    isLoadingServers,
    serverError,
    fetchServers,
    fetchServerDetails,
    testConnection,
    refreshServer,
    selectServer: setSelectedServer,

    // Libraries
    libraries,
    selectedLibrary,
    isLoadingLibraries,
    fetchLibraries,
    fetchLibraryDetails,
    selectLibrary: setSelectedLibrary,

    // File system
    currentPath,
    fileSystemItems,
    isLoadingFiles,
    pathHistory,
    browsePath,
    navigateUp,
    navigateToPath,

    // Scans
    activeScans,
    scanProgress,
    isScanning,
    startLibraryScan,
    fetchActiveScans,
    cancelActiveScan,

    // Stats
    stats,
    fetchStats,

    // Recent
    recentAdditions,
    fetchRecentAdditions,

    // General
    refreshAll,
  };
}
