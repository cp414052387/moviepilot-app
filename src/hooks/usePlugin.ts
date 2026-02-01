/**
 * Plugin Hook
 *
 * Manages plugin data and state:
 * - Plugin list and details
 * - Installation/uninstallation
 * - Enable/disable plugins
 * - Plugin settings
 * - Marketplace browsing
 * - Plugin logs
 */

import { useState, useCallback, useEffect } from 'react';
import {
  getPlugins,
  getPluginDetails,
  installPlugin,
  uninstallPlugin,
  updatePlugin,
  enablePlugin,
  disablePlugin,
  getPluginSettings,
  updatePluginSettings,
  executePluginCommand,
  getPluginLogs,
  getPluginStats,
  getMarketplacePlugins,
  searchMarketplacePlugins,
  getMarketplaceTags,
} from '@/api/plugin';
import type {
  Plugin,
  PluginMarketplaceItem,
  PluginLog,
  PluginStats,
  PluginSetting,
} from '@/types/plugin';

export function usePlugin() {
  // Plugins state
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [isLoadingPlugins, setIsLoadingPlugins] = useState(false);
  const [pluginError, setPluginError] = useState<string | null>(null);

  // Marketplace state
  const [marketplacePlugins, setMarketplacePlugins] = useState<PluginMarketplaceItem[]>([]);
  const [marketplaceTotal, setMarketplaceTotal] = useState(0);
  const [marketplacePage, setMarketplacePage] = useState(1);
  const [isLoadingMarketplace, setIsLoadingMarketplace] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Settings state
  const [pluginSettings, setPluginSettings] = useState<PluginSetting[]>([]);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // Logs state
  const [pluginLogs, setPluginLogs] = useState<PluginLog[]>([]);

  // Stats state
  const [stats, setStats] = useState<PluginStats | null>(null);

  // Tags state
  const [tags, setTags] = useState<string[]>([]);

  // Actions state
  const [installingPluginId, setInstallingPluginId] = useState<string | null>(null);
  const [uninstallingPluginId, setUninstallingPluginId] = useState<string | null>(null);

  /**
   * Fetch all installed plugins
   */
  const fetchPlugins = useCallback(async () => {
    try {
      setIsLoadingPlugins(true);
      setPluginError(null);
      const data = await getPlugins();
      setPlugins(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch plugins';
      setPluginError(errorMessage);
      console.error('Fetch plugins error:', err);
      return [];
    } finally {
      setIsLoadingPlugins(false);
    }
  }, []);

  /**
   * Fetch plugin details
   */
  const fetchPluginDetails = useCallback(async (pluginId: string) => {
    try {
      const data = await getPluginDetails(pluginId);
      setSelectedPlugin(data);
      return data;
    } catch (err) {
      console.error('Fetch plugin details error:', err);
      return null;
    }
  }, []);

  /**
   * Install plugin
   */
  const install = useCallback(async (pluginId: string) => {
    try {
      setInstallingPluginId(pluginId);
      await installPlugin(pluginId);
      await fetchPlugins(); // Refresh plugin list
      return true;
    } catch (err) {
      console.error('Install plugin error:', err);
      return false;
    } finally {
      setInstallingPluginId(null);
    }
  }, [fetchPlugins]);

  /**
   * Uninstall plugin
   */
  const uninstall = useCallback(async (pluginId: string) => {
    try {
      setUninstallingPluginId(pluginId);
      await uninstallPlugin(pluginId);
      await fetchPlugins(); // Refresh plugin list
      return true;
    } catch (err) {
      console.error('Uninstall plugin error:', err);
      return false;
    } finally {
      setUninstallingPluginId(null);
    }
  }, [fetchPlugins]);

  /**
   * Update plugin
   */
  const update = useCallback(async (pluginId: string) => {
    try {
      await updatePlugin(pluginId);
      await fetchPlugins(); // Refresh plugin list
      return true;
    } catch (err) {
      console.error('Update plugin error:', err);
      return false;
    }
  }, [fetchPlugins]);

  /**
   * Enable plugin
   */
  const enable = useCallback(async (pluginId: string) => {
    try {
      await enablePlugin(pluginId);
      await fetchPlugins(); // Refresh plugin list
      return true;
    } catch (err) {
      console.error('Enable plugin error:', err);
      return false;
    }
  }, [fetchPlugins]);

  /**
   * Disable plugin
   */
  const disable = useCallback(async (pluginId: string) => {
    try {
      await disablePlugin(pluginId);
      await fetchPlugins(); // Refresh plugin list
      return true;
    } catch (err) {
      console.error('Disable plugin error:', err);
      return false;
    }
  }, [fetchPlugins]);

  /**
   * Fetch plugin settings
   */
  const fetchSettings = useCallback(async (pluginId: string) => {
    try {
      const data = await getPluginSettings(pluginId);
      setPluginSettings(data);
      return data;
    } catch (err) {
      console.error('Fetch plugin settings error:', err);
      return [];
    }
  }, []);

  /**
   * Update plugin settings
   */
  const saveSettings = useCallback(async (pluginId: string, settings: Record<string, unknown>) => {
    try {
      setIsUpdatingSettings(true);
      await updatePluginSettings(pluginId, settings);
      await fetchSettings(pluginId); // Refresh settings
      return true;
    } catch (err) {
      console.error('Update plugin settings error:', err);
      return false;
    } finally {
      setIsUpdatingSettings(false);
    }
  }, [fetchSettings]);

  /**
   * Execute plugin command
   */
  const executeCommand = useCallback(async (
    pluginId: string,
    commandId: string,
    data?: Record<string, unknown>
  ) => {
    try {
      const result = await executePluginCommand(pluginId, commandId, data);
      return result;
    } catch (err) {
      console.error('Execute plugin command error:', err);
      return { success: false, message: 'Command execution failed' };
    }
  }, []);

  /**
   * Fetch plugin logs
   */
  const fetchLogs = useCallback(async (pluginId: string, limit: number = 100) => {
    try {
      const data = await getPluginLogs(pluginId, limit);
      setPluginLogs(data);
      return data;
    } catch (err) {
      console.error('Fetch plugin logs error:', err);
      return [];
    }
  }, []);

  /**
   * Fetch plugin stats
   */
  const fetchStats = useCallback(async () => {
    try {
      const data = await getPluginStats();
      setStats(data);
      return data;
    } catch (err) {
      console.error('Fetch plugin stats error:', err);
      return null;
    }
  }, []);

  /**
   * Fetch marketplace plugins
   */
  const fetchMarketplacePlugins = useCallback(async (params?: {
    type?: string;
    tag?: string;
    search?: string;
    page?: number;
  }) => {
    try {
      setIsLoadingMarketplace(true);
      const data = await getMarketplacePlugins({
        ...params,
        size: 20,
      });
      setMarketplacePlugins(data.items);
      setMarketplaceTotal(data.total);
      setMarketplacePage(data.page);
      return data;
    } catch (err) {
      console.error('Fetch marketplace plugins error:', err);
      return { items: [], total: 0, page: 1 };
    } finally {
      setIsLoadingMarketplace(false);
    }
  }, []);

  /**
   * Search marketplace
   */
  const searchMarketplace = useCallback(async (query: string) => {
    try {
      setSearchQuery(query);
      if (!query.trim()) {
        return await fetchMarketplacePlugins();
      }
      const data = await searchMarketplacePlugins(query);
      setMarketplacePlugins(data);
      return data;
    } catch (err) {
      console.error('Search marketplace error:', err);
      return [];
    }
  }, [fetchMarketplacePlugins]);

  /**
   * Filter by tag
   */
  const filterByTag = useCallback(async (tag: string | null) => {
    try {
      setSelectedTag(tag);
      await fetchMarketplacePlugins({ tag: tag || undefined, search: searchQuery || undefined });
    } catch (err) {
      console.error('Filter by tag error:', err);
    }
  }, [fetchMarketplacePlugins, searchQuery]);

  /**
   * Fetch marketplace tags
   */
  const fetchTags = useCallback(async () => {
    try {
      const data = await getMarketplaceTags();
      setTags(data);
      return data;
    } catch (err) {
      console.error('Fetch marketplace tags error:', err);
      return [];
    }
  }, []);

  /**
   * Refresh all plugin data
   */
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchPlugins(),
      fetchStats(),
      fetchMarketplacePlugins(),
      fetchTags(),
    ]);
  }, [fetchPlugins, fetchStats, fetchMarketplacePlugins, fetchTags]);

  // Initial data fetch
  useEffect(() => {
    refreshAll();
  }, []);

  return {
    // Plugins
    plugins,
    selectedPlugin,
    isLoadingPlugins,
    pluginError,
    fetchPlugins,
    fetchPluginDetails,
    install,
    uninstall,
    update,
    enable,
    disable,
    selectPlugin: setSelectedPlugin,

    // Settings
    pluginSettings,
    isUpdatingSettings,
    fetchSettings,
    saveSettings,

    // Commands
    executeCommand,

    // Logs
    pluginLogs,
    fetchLogs,

    // Stats
    stats,
    fetchStats,

    // Marketplace
    marketplacePlugins,
    marketplaceTotal,
    marketplacePage,
    isLoadingMarketplace,
    searchQuery,
    selectedTag,
    tags,
    installingPluginId,
    uninstallingPluginId,
    fetchMarketplacePlugins,
    searchMarketplace,
    filterByTag,
    fetchTags,

    // General
    refreshAll,
  };
}
