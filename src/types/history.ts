/**
 * History Type Definitions
 */

import type { MediaItem } from './index';

export type HistoryType = 'download' | 'subscribe' | 'scan' | 'notification' | 'system';
export type HistoryStatus = 'success' | 'failed' | 'pending' | 'cancelled';

export interface HistoryItem {
  id: string;
  type: HistoryType;
  status: HistoryStatus;
  title: string;
  description?: string;
  media_item?: MediaItem;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface HistoryFilter {
  type?: HistoryType;
  status?: HistoryStatus;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface HistoryStats {
  total_items: number;
  by_type: Record<HistoryType, number>;
  by_status: Record<HistoryStatus, number>;
  today_count: number;
  week_count: number;
  month_count: number;
}
