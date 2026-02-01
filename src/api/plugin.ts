/**
 * Plugin API
 *
 * Handles plugin management, installation, configuration, and marketplace operations
 */

import { apiClient } from './client';
import type {
  Plugin,
  PluginMarketplaceItem,
  PluginLog,
  PluginStats,
  PluginSetting,
} from '@/types/plugin';

/**
 * Get all installed plugins
 * GET /plugin/
 */
export async function getPlugins(): Promise<Plugin[]> {
  const response = await apiClient.get<Plugin[]>('/plugin/');
  return response.data;
}

/**
 * Get plugin details
 * GET /plugin/{pluginId}
 */
export async function getPluginDetails(pluginId: string): Promise<Plugin> {
  const response = await apiClient.get<Plugin>(`/plugin/${pluginId}`);
  return response.data;
}

/**
 * Install plugin from marketplace
 * POST /plugin/install
 */
export async function installPlugin(pluginId: string): Promise<void> {
  await apiClient.post('/plugin/install', { plugin_id: pluginId });
}

/**
 * Uninstall plugin
 * DELETE /plugin/{pluginId}
 */
export async function uninstallPlugin(pluginId: string): Promise<void> {
  await apiClient.delete(`/plugin/${pluginId}`);
}

/**
 * Update plugin
 * POST /plugin/{pluginId}/update
 */
export async function updatePlugin(pluginId: string): Promise<void> {
  await apiClient.post(`/plugin/${pluginId}/update`);
}

/**
 * Enable plugin
 * POST /plugin/{pluginId}/enable
 */
export async function enablePlugin(pluginId: string): Promise<void> {
  await apiClient.post(`/plugin/${pluginId}/enable`);
}

/**
 * Disable plugin
 * POST /plugin/{pluginId}/disable
 */
export async function disablePlugin(pluginId: string): Promise<void> {
  await apiClient.post(`/plugin/${pluginId}/disable`);
}

/**
 * Get plugin settings
 * GET /plugin/{pluginId}/settings
 */
export async function getPluginSettings(pluginId: string): Promise<PluginSetting[]> {
  const response = await apiClient.get<PluginSetting[]>(`/plugin/${pluginId}/settings`);
  return response.data;
}

/**
 * Update plugin settings
 * PUT /plugin/{pluginId}/settings
 */
export async function updatePluginSettings(
  pluginId: string,
  settings: Record<string, unknown>
): Promise<void> {
  await apiClient.put(`/plugin/${pluginId}/settings`, settings);
}

/**
 * Execute plugin command
 * POST /plugin/{pluginId}/command
 */
export async function executePluginCommand(
  pluginId: string,
  commandId: string,
  data?: Record<string, unknown>
): Promise<{ success: boolean; message?: string; result?: unknown }> {
  const response = await apiClient.post(`/plugin/${pluginId}/command`, {
    command_id: commandId,
    data,
  });
  return response.data;
}

/**
 * Get plugin logs
 * GET /plugin/{pluginId}/logs
 */
export async function getPluginLogs(
  pluginId: string,
  limit: number = 100
): Promise<PluginLog[]> {
  const response = await apiClient.get<PluginLog[]>(`/plugin/${pluginId}/logs`, {
    params: { limit },
  });
  return response.data;
}

/**
 * Get plugin statistics
 * GET /plugin/stats
 */
export async function getPluginStats(): Promise<PluginStats> {
  const response = await apiClient.get<PluginStats>('/plugin/stats');
  return response.data;
}

/**
 * Get marketplace plugins
 * GET /plugin/marketplace
 */
export async function getMarketplacePlugins(params?: {
  type?: string;
  tag?: string;
  search?: string;
  page?: number;
  size?: number;
}): Promise<{ items: PluginMarketplaceItem[]; total: number; page: number }> {
  const response = await apiClient.get<{ items: PluginMarketplaceItem[]; total: number; page: number }>(
    '/plugin/marketplace',
    { params }
  );
  return response.data;
}

/**
 * Search marketplace plugins
 * GET /plugin/marketplace/search
 */
export async function searchMarketplacePlugins(query: string): Promise<PluginMarketplaceItem[]> {
  const response = await apiClient.get<PluginMarketplaceItem[]>('/plugin/marketplace/search', {
    params: { q: query },
  });
  return response.data;
}

/**
 * Get plugin marketplace details
 * GET /plugin/marketplace/{pluginId}
 */
export async function getMarketplacePluginDetails(pluginId: string): Promise<PluginMarketplaceItem> {
  const response = await apiClient.get<PluginMarketplaceItem>(`/plugin/marketplace/${pluginId}`);
  return response.data;
}

/**
 * Get plugin tags/categories
 * GET /plugin/marketplace/tags
 */
export async function getMarketplaceTags(): Promise<string[]> {
  const response = await apiClient.get<string[]>('/plugin/marketplace/tags');
  return response.data;
}
