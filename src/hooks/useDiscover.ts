/**
 * Discover Hook
 *
 * Manages discovery/explore data and state:
 * - Trending media
 * - Popular media
 * - Top rated media
 * - Upcoming releases
 * - Genre filtering
 * - Discover by filters
 */

import { useState, useCallback, useEffect } from 'react';
import {
  discoverMedia,
  getTrendingMedia,
  getPopularMedia,
  getTopRatedMedia,
  getUpcomingMedia,
  getMediaGenres,
  type DiscoverOptions,
  type TrendingResponse,
  type MediaGenre,
} from '@/api/media';
import type { MediaItem } from '@/types';

export function useDiscover() {
  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [popular, setPopular] = useState<MediaItem[]>([]);
  const [topRated, setTopRated] = useState<MediaItem[]>([]);
  const [upcoming, setUpcoming] = useState<MediaItem[]>([]);
  const [genres, setGenres] = useState<MediaGenre[]>([]);
  const [discoverResults, setDiscoverResults] = useState<MediaItem[]>([]);
  const [discoverTotal, setDiscoverTotal] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  /**
   * Fetch trending media
   */
  const fetchTrending = useCallback(async (type: 'movie' | 'tv' | 'all' = 'all') => {
    try {
      const response = await getTrendingMedia(type);
      setTrending(response.items);
      return response.items;
    } catch (err) {
      console.error('Trending fetch error:', err);
      return [];
    }
  }, []);

  /**
   * Fetch popular media
   */
  const fetchPopular = useCallback(async (type: 'movie' | 'tv' = 'movie') => {
    try {
      const response = await getPopularMedia(type);
      setPopular(response.items);
      return response.items;
    } catch (err) {
      console.error('Popular fetch error:', err);
      return [];
    }
  }, []);

  /**
   * Fetch top rated media
   */
  const fetchTopRated = useCallback(async (type: 'movie' | 'tv' = 'movie') => {
    try {
      const response = await getTopRatedMedia(type);
      setTopRated(response.items);
      return response.items;
    } catch (err) {
      console.error('Top rated fetch error:', err);
      return [];
    }
  }, []);

  /**
   * Fetch upcoming releases
   */
  const fetchUpcoming = useCallback(async (type: 'movie' | 'tv' = 'movie') => {
    try {
      const response = await getUpcomingMedia(type);
      setUpcoming(response.items);
      return response.items;
    } catch (err) {
      console.error('Upcoming fetch error:', err);
      return [];
    }
  }, []);

  /**
   * Fetch genres
   */
  const fetchGenres = useCallback(async (type: 'movie' | 'tv' = 'movie') => {
    try {
      const data = await getMediaGenres(type);
      setGenres(data);
      return data;
    } catch (err) {
      console.error('Genres fetch error:', err);
      return [];
    }
  }, []);

  /**
   * Discover media by filters
   */
  const discover = useCallback(async (options: DiscoverOptions = {}, append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
        setCurrentPage(1);
      }
      setError(null);

      const response = await discoverMedia({
        ...options,
        page: append ? currentPage + 1 : 1,
      });

      if (append) {
        setDiscoverResults((prev) => [...prev, ...response.items]);
        setCurrentPage((prev) => prev + 1);
      } else {
        setDiscoverResults(response.items);
        setCurrentPage(1);
      }
      setDiscoverTotal(response.total);

      return response.items;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to discover media';
      setError(errorMessage);
      console.error('Discover error:', err);
      return [];
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [currentPage]);

  /**
   * Refresh all discover data
   */
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);

    try {
      await Promise.all([
        fetchTrending(),
        fetchPopular(),
        fetchTopRated(),
        fetchUpcoming(),
        fetchGenres(),
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh';
      setError(errorMessage);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchTrending, fetchPopular, fetchTopRated, fetchUpcoming, fetchGenres]);

  /**
   * Load more discover results
   */
  const loadMore = useCallback(() => {
    if (!isLoadingMore && discoverResults.length < discoverTotal) {
      // Need to track current discover options for this to work properly
      // For now, just a placeholder
      setIsLoadingMore(true);
    }
  }, [discoverResults.length, discoverTotal, isLoadingMore]);

  /**
   * Reset discover state
   */
  const resetDiscover = useCallback(() => {
    setDiscoverResults([]);
    setDiscoverTotal(0);
    setCurrentPage(1);
    setError(null);
  }, []);

  return {
    // Data
    trending,
    popular,
    topRated,
    upcoming,
    genres,
    discoverResults,
    discoverTotal,
    hasMore: discoverResults.length < discoverTotal,

    // Loading states
    isLoading,
    isRefreshing,
    isLoadingMore,

    // Error
    error,

    // Actions
    fetchTrending,
    fetchPopular,
    fetchTopRated,
    fetchUpcoming,
    fetchGenres,
    discover,
    refresh,
    loadMore,
    resetDiscover,

    // Current page
    currentPage,
  };
}
