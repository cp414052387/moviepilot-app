/**
 * Media Server Type Definitions
 */

import type { MediaItem } from './index';

export type MediaServerStatus = 'online' | 'offline' | 'degraded';
export type MediaServerType = 'plex' | 'emby' | 'jellyfin' | 'local';
export type LibraryType = 'movie' | 'tv' | 'music' | 'photo' | 'mixed';
export type ScanStatus = 'idle' | 'scanning' | 'completed' | 'error';

export interface MediaServer {
  id: string;
  name: string;
  type: MediaServerType;
  status: MediaServerStatus;
  address: string;
  port?: number;
  version?: string;
  uptime?: number;
  last_seen: string;
}

export interface Library {
  id: string;
  server_id: string;
  name: string;
  type: LibraryType;
  path: string;
  size: number;
  media_count: number;
  last_scanned?: string;
  poster_path?: string;
  art_path?: string;
}

export interface MediaFile {
  id: string;
  library_id: string;
  path: string;
  name: string;
  size: number;
  modified: string;
  type: 'video' | 'subtitle' | 'audio' | 'image';
  duration?: number;
  resolution?: string;
  codec?: string;
  thumbnail_path?: string;
}

export interface MediaFolder {
  path: string;
  name: string;
  type: 'folder';
  size: number;
  item_count: number;
  modified: string;
}

export interface FileSystemItem {
  id?: string;
  library_id?: string;
  path: string;
  name: string;
  size: number;
  modified: string;
  is_folder: boolean;
  // File-specific properties
  type?: 'video' | 'subtitle' | 'audio' | 'image' | 'folder';
  duration?: number;
  resolution?: string;
  codec?: string;
  thumbnail_path?: string;
  // Folder-specific properties
  item_count?: number;
}

export interface ScanProgress {
  server_id: string;
  library_id?: string;
  status: ScanStatus;
  progress: number;
  current_item?: string;
  total_items?: number;
  scanned_items?: number;
  started_at?: string;
  completed_at?: string;
  error?: string;
}

export interface MediaServerStats {
  total_libraries: number;
  total_media: number;
  total_size: number;
  active_scans: number;
  last_scan?: string;
  recent_added: MediaItem[];
}
