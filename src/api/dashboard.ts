/**
 * Dashboard API Module
 *
 * Handles fetching system statistics and dashboard data:
 * - System status (server health, storage, downloads)
 * - Statistics counts
 * - Recent activity
 * - Quick metrics
 */

import { apiClient } from './client';

/**
 * System status information
 */
export interface SystemStatus {
  server: {
    status: 'online' | 'offline' | 'degraded';
    version: string;
    uptime: number;
    lastUpdate: string;
  };
  storage: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
    path: string;
  };
  downloads: {
    active: number;
    paused: number;
    completed: number;
    failed: number;
    total: number;
    speed: number; // bytes per second
  };
}

/**
 * Quick statistics for dashboard
 */
export interface DashboardStats {
  media: {
    total: number;
    movies: number;
    tvShows: number;
    addedThisWeek: number;
  };
  subscriptions: {
    total: number;
    active: number;
    completed: number;
    failed: number;
  };
  downloads: {
    total: number;
    active: number;
    completed: number;
    totalSize: number;
  };
  messages: {
    unread: number;
    total: number;
  };
}

/**
 * Recent activity item
 */
export interface ActivityItem {
  id: string;
  type: 'download' | 'subscription' | 'media' | 'system';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'error' | 'pending' | 'info';
}

/**
 * Dashboard data response
 */
export interface DashboardData {
  status: SystemStatus;
  stats: DashboardStats;
  recentActivity: ActivityItem[];
}

/**
 * Fetch system status
 */
export async function getSystemStatus(): Promise<SystemStatus> {
  const response = await apiClient.get('/system/status');
  return response.data;
}

/**
 * Fetch dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await apiClient.get('/system/stats');
  return response.data;
}

/**
 * Fetch recent activity
 */
export async function getRecentActivity(limit = 10): Promise<ActivityItem[]> {
  const response = await apiClient.get('/system/activity', {
    params: { limit },
  });
  return response.data;
}

/**
 * Fetch complete dashboard data
 */
export async function getDashboardData(): Promise<DashboardData> {
  const [status, stats, recentActivity] = await Promise.all([
    getSystemStatus(),
    getDashboardStats(),
    getRecentActivity(10),
  ]);

  return {
    status,
    stats,
    recentActivity,
  };
}

/**
 * Format bytes to human readable size
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format download speed
 */
export function formatSpeed(bytesPerSecond: number): string {
  return formatBytes(bytesPerSecond) + '/s';
}

/**
 * Format uptime
 */
export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}
