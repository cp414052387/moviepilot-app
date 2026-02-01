/**
 * Dashboard Hook
 *
 * Manages dashboard data and state:
 * - System status
 * - Statistics
 * - Recent activity
 * - Refresh functionality
 */

import { useState, useCallback } from 'react';
import {
  getDashboardData,
  getSystemStatus,
  getDashboardStats,
  getRecentActivity,
  formatBytes,
  formatSpeed,
  formatUptime,
} from '@/api/dashboard';
import type {
  SystemStatus,
  DashboardStats,
  ActivityItem,
  DashboardData,
} from '@/api/dashboard';

export function useDashboard() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all dashboard data
   */
  const fetchDashboard = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);

      const data = await getDashboardData();

      setStatus(data.status);
      setStats(data.stats);
      setRecentActivity(data.recentActivity);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data';
      setError(errorMessage);
      console.error('Dashboard fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  /**
   * Refresh dashboard data
   */
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchDashboard(false);
  }, [fetchDashboard]);

  /**
   * Fetch system status only
   */
  const fetchStatus = useCallback(async () => {
    try {
      const data = await getSystemStatus();
      setStatus(data);
    } catch (err) {
      console.error('Status fetch error:', err);
    }
  }, []);

  /**
   * Fetch statistics only
   */
  const fetchStats = useCallback(async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  }, []);

  /**
   * Fetch recent activity only
   */
  const fetchActivity = useCallback(async () => {
    try {
      const data = await getRecentActivity();
      setRecentActivity(data);
    } catch (err) {
      console.error('Activity fetch error:', err);
    }
  }, []);

  return {
    // Data
    status,
    stats,
    recentActivity,

    // Loading states
    isLoading,
    isRefreshing,

    // Error
    error,

    // Actions
    fetchDashboard,
    refresh,
    fetchStatus,
    fetchStats,
    fetchActivity,

    // Utility functions
    formatBytes,
    formatSpeed,
    formatUptime,
  };
}
