/**
 * History Hook
 *
 * Manages activity history and logs
 */

import { useState, useCallback, useEffect } from 'react';
import {
  getHistory,
  getHistoryStats,
  deleteHistoryItem,
  clearHistory,
} from '@/api/history';
import type { HistoryItem, HistoryFilter, HistoryStats, HistoryType, HistoryStatus } from '@/types/history';

export function useHistory() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [filter, setFilter] = useState<HistoryFilter>({});
  const [selectedTypes, setSelectedTypes] = useState<HistoryType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<HistoryStatus[]>([]);

  /**
   * Fetch history items
   */
  const fetchHistory = useCallback(async (
    page: number = 1,
    append: boolean = false
  ) => {
    try {
      if (append) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      const params: Record<string, string | number | undefined> = {
        page,
        size: 50,
      };

      if (selectedTypes.length > 0) {
        params.type = selectedTypes[0];
      }
      if (selectedStatuses.length > 0) {
        params.status = selectedStatuses[0];
      }
      if (filter.search) {
        params.search = filter.search;
      }
      if (filter.date_from) {
        params.date_from = filter.date_from;
      }
      if (filter.date_to) {
        params.date_to = filter.date_to;
      }

      const response = await getHistory(params);

      if (append) {
        setHistoryItems((prev) => [...prev, ...response.items]);
      } else {
        setHistoryItems(response.items);
      }

      setCurrentPage(response.page);
      setTotalItems(response.total);
      setHasMore(response.items.length < response.total);

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch history';
      setError(errorMessage);
      console.error('Fetch history error:', err);
      return { items: [], total: 0, page: 1, pageSize: 50 };
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedTypes, selectedStatuses, filter]);

  /**
   * Fetch history stats
   */
  const fetchStats = useCallback(async () => {
    try {
      const data = await getHistoryStats();
      setStats(data);
      return data;
    } catch (err) {
      console.error('Fetch history stats error:', err);
      return null;
    }
  }, []);

  /**
   * Delete history item
   */
  const deleteItem = useCallback(async (itemId: string) => {
    try {
      await deleteHistoryItem(itemId);
      setHistoryItems((prev) => prev.filter((item) => item.id !== itemId));
      setTotalItems((prev) => Math.max(0, prev - 1));
      return true;
    } catch (err) {
      console.error('Delete history item error:', err);
      return false;
    }
  }, []);

  /**
   * Clear all history
   */
  const clear = useCallback(async () => {
    try {
      await clearHistory();
      setHistoryItems([]);
      setTotalItems(0);
      return true;
    } catch (err) {
      console.error('Clear history error:', err);
      return false;
    }
  }, []);

  /**
   * Load more items
   */
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchHistory(currentPage + 1, true);
    }
  }, [isLoading, hasMore, currentPage, fetchHistory]);

  /**
   * Refresh history
   */
  const refresh = useCallback(() => {
    return fetchHistory(1, false);
  }, [fetchHistory]);

  /**
   * Update filter
   */
  const updateFilter = useCallback((newFilter: Partial<HistoryFilter>) => {
    setFilter((prev) => ({ ...prev, ...newFilter }));
    setCurrentPage(1);
  }, []);

  /**
   * Toggle type filter
   */
  const toggleTypeFilter = useCallback((type: HistoryType) => {
    setSelectedTypes((prev) => {
      const newTypes = prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type];
      setCurrentPage(1);
      return newTypes;
    });
  }, []);

  /**
   * Toggle status filter
   */
  const toggleStatusFilter = useCallback((status: HistoryStatus) => {
    setSelectedStatuses((prev) => {
      const newStatuses = prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status];
      setCurrentPage(1);
      return newStatuses;
    });
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setSelectedTypes([]);
    setSelectedStatuses([]);
    setFilter({});
    setCurrentPage(1);
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchHistory();
    fetchStats();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (currentPage === 1) {
      fetchHistory(1);
    }
  }, [selectedTypes, selectedStatuses, filter]);

  return {
    // Data
    historyItems,
    stats,
    totalItems,
    hasMore,

    // Loading states
    isLoading,
    isRefreshing,
    error,

    // Pagination
    currentPage,
    loadMore,
    refresh,

    // Filters
    filter,
    selectedTypes,
    selectedStatuses,
    updateFilter,
    toggleTypeFilter,
    toggleStatusFilter,
    clearFilters,

    // Actions
    deleteItem,
    clear,
  };
}
