/**
 * Plugin Type Definitions
 */

export type PluginStatus = 'active' | 'inactive' | 'error' | 'installing' | 'uninstalling';
export type PluginType = 'service' | 'notification' | 'security' | 'media' | 'utility';

export interface Plugin {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  homepage_url?: string;
  icon_url?: string;
  status: PluginStatus;
  type: PluginType;
  installed: boolean;
  has_update: boolean;
  settings?: PluginSetting[];
  commands?: PluginCommand[];
  installed_at?: string;
  updated_at?: string;
}

export interface PluginSetting {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
  value: string | number | boolean | string[];
  default?: string | number | boolean | string[];
  options?: { label: string; value: string }[];
  required: boolean;
  description?: string;
}

export interface PluginCommand {
  id: string;
  name: string;
  description: string;
  icon?: string;
  confirm_required: boolean;
}

export interface PluginMarketplaceItem {
  id: string;
  identifier: string;
  name: string;
  description: string;
  author: string;
  version: string;
  homepage_url?: string;
  icon_url?: string;
  type: PluginType;
  downloads: number;
  rating: number;
  installed: boolean;
  has_update: boolean;
  tags: string[];
  screenshots?: string[];
}

export interface PluginLog {
  id: string;
  plugin_id: string;
  plugin_name: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

export interface PluginStats {
  total_plugins: number;
  active_plugins: number;
  inactive_plugins: number;
  available_updates: number;
  total_commands: number;
}
