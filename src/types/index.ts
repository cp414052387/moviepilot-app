/**
 * Shared TypeScript type definitions
 */

// ============ Authentication Types ============

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface UserInfo {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  level: number;
  is_admin: boolean;
}

// ============ Media Types ============

export interface MediaItem {
  id: string;
  tmdb_id: number;
  title: string;
  original_title: string;
  year: number;
  type: 'movie' | 'tv';
  poster_path?: string;
  backdrop_path?: string;
  overview: string;
  vote_average: number;
  release_date: string;
  genres: string[];
  runtime?: number;
  seasons?: number;
}

export interface MediaSearchResponse {
  results: MediaItem[];
  page: number;
  total_pages: number;
  total_results: number;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path?: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
}

export interface MediaDetail extends MediaItem {
  credits: {
    cast: CastMember[];
    crew: CrewMember[];
  };
  videos: Video[];
  similar: MediaItem[];
  recommendations: MediaItem[];
}

// ============ Subscription Types ============

export type SubscriptionStatus = 'pending' | 'downloading' | 'completed' | 'failed';

export interface Subscription {
  id: string;
  name: string;
  year: string;
  type: 'movie' | 'tv';
  tmdb_id: number;
  poster_path?: string;
  backdrop_path?: string;
  overview: string;
  status: SubscriptionStatus;
  date_added: string;
  date_completed?: string;
  seasons?: number[];
  current_season?: number;
  current_episode?: number;
  total_episodes?: number;
}

export interface SubscriptionRequest {
  tmdb_id: number;
  type: 'movie' | 'tv';
  seasons?: number[];
  username?: string;
}

export interface SubscriptionResponse {
  results: Subscription[];
  page: number;
  total_pages: number;
  total_results: number;
}

// ============ Download Types ============

export type DownloadStatus = 'downloading' | 'paused' | 'seeding' | 'completed' | 'error';

export interface DownloadFile {
  name: string;
  size: number;
  progress: number;
}

export interface DownloadTask {
  hash: string;
  name: string;
  size: number;
  downloaded: number;
  progress: number;
  status: DownloadStatus;
  speed: number;
  eta: number;
  files: DownloadFile[];
  save_path: string;
  added_date: string;
}

export interface DownloadProgress {
  hash: string;
  progress: number;
  downloaded: number;
  speed: number;
  eta: number;
  status: string;
}

export interface DownloadResponse {
  results: DownloadTask[];
  page: number;
  total: number;
}

// ============ Message Types ============

export type MessageType = 'info' | 'warning' | 'error' | 'success';

export interface MessageAction {
  label: string;
  action: string;
  data?: Record<string, unknown>;
}

export interface SystemMessage {
  id: string;
  title: string;
  content: string;
  type: MessageType;
  created_at: string;
  actions?: MessageAction[];
}

export interface ChatButton {
  text: string;
  action: string;
  data?: unknown;
}

export interface MessageAttachment {
  type: 'image' | 'link';
  url: string;
  thumbnail?: string;
  title?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  is_from_user: boolean;
  created_at: string;
  buttons?: ChatButton[];
  attachments?: MessageAttachment[];
}

export type QuickCommand = '/search' | '/download' | '/subscribe' | '/status';

export interface CommandRequest {
  command: QuickCommand;
  params: string[];
}

export interface ChatMessageResponse {
  results: ChatMessage[];
  page: number;
}

// ============ Dashboard Types ============

export interface DashboardStats {
  media_count: number;
  download_count: number;
  subscribe_count: number;
  storage_used: number;
  storage_total: number;
}

// ============ API Error Types ============

export interface ApiError {
  detail: string;
  status: number;
  code?: string;
}
