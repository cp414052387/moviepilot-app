/**
 * Media API
 *
 * Handles media search, details, discovery, and TMDB integration
 */

import { apiClient } from './client';
import type {
  MediaItem,
  MediaDetail,
  MediaSearchResponse,
  CastMember,
  CrewMember,
} from '@/types';

/**
 * Search for media by keyword
 * GET /media/search
 */
export async function searchMedia(params: {
  keyword: string;
  page?: number;
  size?: number;
}): Promise<MediaSearchResponse> {
  const response = await apiClient.get<MediaSearchResponse>('/media/search', {
    params: {
      keyword: params.keyword,
      page: params.page || 1,
      size: params.size || 20,
    },
  });
  return response.data;
}

/**
 * Get media details by media ID
 * GET /media/{mediaid}
 */
export async function getMediaDetails(mediaId: string): Promise<MediaDetail> {
  const response = await apiClient.get<MediaDetail>(`/media/${mediaId}`);
  return response.data;
}

/**
 * Get TMDB details by TMDB ID
 * GET /tmdb/detail/{tmdbid}
 */
export async function getTmdbDetails(params: {
  tmdbId: number;
  type?: 'movie' | 'tv';
}): Promise<MediaDetail> {
  const response = await apiClient.get<MediaDetail>(
    `/tmdb/detail/${params.tmdbId}`,
    {
      params: {
        type: params.type || 'movie',
      },
    }
  );
  return response.data;
}

/**
 * Get proxied image URL
 * Use this for loading images through the MoviePilot proxy
 */
export function getImageUrl(proxyPath: string, size: 'original' | 'w500' | 'w300' = 'w300'): string {
  const baseUrl = apiClient.defaults.baseURL as string;
  // Remove /api/v1 suffix and append image endpoint
  const apiBase = baseUrl.replace('/api/v1', '');
  return `${apiBase}/system/img/${proxyPath}`;
}

/**
 * Get direct TMDB image URL (fallback)
 */
export function getTmdbImageUrl(path: string | undefined, size: 'original' | 'w500' | 'w300' = 'w300'): string {
  if (!path) return 'https://via.placeholder.com/300x450?text=No+Image';
  const baseUrl = 'https://image.tmdb.org/t/p/';
  return `${baseUrl}${size}${path}`;
}

/**
 * Recognize/scrape media by filename
 * POST /media/recognize
 */
export async function recognizeMedia(params: {
  name: string;
  type?: 'movie' | 'tv';
}): Promise<MediaItem[]> {
  const response = await apiClient.post<MediaItem[]>('/media/recognize', params);
  return response.data;
}

/**
 * Discovery/Explore API types
 */
export interface DiscoverOptions {
  type?: 'movie' | 'tv' | 'all';
  genre?: string;
  year?: number;
  sortBy?: 'popularity' | 'rating' | 'release_date' | 'title';
  page?: number;
  size?: number;
}

export interface DiscoverResponse {
  items: MediaItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TrendingResponse {
  items: MediaItem[];
  total: number;
}

export interface MediaGenre {
  id: number;
  name: string;
  tmdbId?: number;
}

/**
 * Discover media by filters
 * GET /media/discover
 */
export async function discoverMedia(options: DiscoverOptions = {}): Promise<DiscoverResponse> {
  const response = await apiClient.get<DiscoverResponse>('/media/discover', {
    params: {
      type: options.type || 'all',
      genre: options.genre,
      year: options.year,
      sort_by: options.sortBy || 'popularity',
      page: options.page || 1,
      size: options.size || 20,
    },
  });
  return response.data;
}

/**
 * Get trending media
 * GET /media/trending
 */
export async function getTrendingMedia(type: 'movie' | 'tv' | 'all' = 'all'): Promise<TrendingResponse> {
  const response = await apiClient.get<TrendingResponse>('/media/trending', {
    params: { type },
  });
  return response.data;
}

/**
 * Get popular media
 * GET /media/popular
 */
export async function getPopularMedia(type: 'movie' | 'tv' = 'movie'): Promise<TrendingResponse> {
  const response = await apiClient.get<TrendingResponse>('/media/popular', {
    params: { type },
  });
  return response.data;
}

/**
 * Get top rated media
 * GET /media/top-rated
 */
export async function getTopRatedMedia(type: 'movie' | 'tv' = 'movie'): Promise<TrendingResponse> {
  const response = await apiClient.get<TrendingResponse>('/media/top-rated', {
    params: { type },
  });
  return response.data;
}

/**
 * Get upcoming/new releases
 * GET /media/upcoming
 */
export async function getUpcomingMedia(type: 'movie' | 'tv' = 'movie'): Promise<TrendingResponse> {
  const response = await apiClient.get<TrendingResponse>('/media/upcoming', {
    params: { type },
  });
  return response.data;
}

/**
 * Get media genres
 * GET /media/genres
 */
export async function getMediaGenres(type: 'movie' | 'tv' = 'movie'): Promise<MediaGenre[]> {
  const response = await apiClient.get<MediaGenre[]>('/media/genres', {
    params: { type },
  });
  return response.data;
}

/**
 * Get recommended media based on media ID
 * GET /media/{mediaid}/recommendations
 */
export async function getRecommendedMedia(mediaId: string): Promise<TrendingResponse> {
  const response = await apiClient.get<TrendingResponse>(`/media/${mediaId}/recommendations`);
  return response.data;
}

/**
 * Get similar media based on media ID
 * GET /media/{mediaid}/similar
 */
export async function getSimilarMedia(mediaId: string): Promise<TrendingResponse> {
  const response = await apiClient.get<TrendingResponse>(`/media/${mediaId}/similar`);
  return response.data;
}
