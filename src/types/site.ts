/**
 * Site (Download Site) Type Definitions
 */

export type SiteType = 'private' | 'public';
export type SiteStatus = 'active' | 'inactive' | 'banned' | 'error';
export type SitePriority = 'low' | 'normal' | 'high';

export interface Site {
  id: string;
  name: string;
  domain: string;
  type: SiteType;
  status: SiteStatus;
  priority: SitePriority;
  rss_enabled: boolean;
  search_enabled: boolean;
  cookie?: string;
  headers?: Record<string, string>;
  limit?: number;
  interval?: number;
  last_check?: string;
  download_count: number;
  upload_count: number;
  ratio?: number;
  seed_time?: number;
  created_at: string;
  updated_at: string;
}

export interface SiteStats {
  total_sites: number;
  active_sites: number;
  private_sites: number;
  public_sites: number;
  total_downloads: number;
  total_uploads: number;
  avg_ratio: number;
}

export interface SiteTestResult {
  success: boolean;
  message?: string;
  response_time?: number;
  error?: string;
}

export interface SiteRule {
  id: string;
  site_id: string;
  name: string;
  enabled: boolean;
  priority: number;
  conditions: RuleCondition[];
  actions: RuleAction[];
}

export interface RuleCondition {
  field: string;
  operator: 'contains' | 'equals' | 'regex' | 'greater_than' | 'less_than';
  value: string | number;
}

export interface RuleAction {
  type: 'download' | 'notify' | 'subscribe' | 'skip';
  params?: Record<string, unknown>;
}
