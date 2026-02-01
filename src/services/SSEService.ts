/**
 * SSE (Server-Sent Events) Service
 *
 * Manages real-time updates from MoviePilot backend:
 * - System messages
 * - Download progress updates
 * - Subscription status changes
 * - Auto-reconnect on disconnect
 */

import { EventEmitter } from 'events';
import { getAuthToken } from '@/api/client';

// SSE Event types
export type SSEEventType =
  | 'system-message'
  | 'download-progress'
  | 'subscription-update'
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'message';

// SSE Event data structure
export interface SSEMessage {
  type: string;
  data: unknown;
  timestamp?: number;
}

// Connection state
type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * SSE Service Class
 * Singleton service for managing SSE connection
 */
class SSEService extends EventEmitter {
  private eventSource: EventSource | null = null;
  private connectionState: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private maxReconnectDelay = 30000; // Max 30 seconds
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.setMaxListeners(50); // Allow many listeners
  }

  /**
   * Get current connection state
   */
  getState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connectionState === 'connected';
  }

  /**
   * Connect to SSE endpoint
   */
  async connect(): Promise<void> {
    if (this.connectionState === 'connected' || this.connectionState === 'connecting') {
      return;
    }

    this.connectionState = 'connecting';
    this.emit('connecting');

    try {
      const token = await getAuthToken();

      if (!token) {
        throw new Error('No auth token available');
      }

      // Build SSE URL with token
      const baseUrl = 'https://api.movie-pilot.org';
      const sseUrl = `${baseUrl}/api/v1/system/message?token=${encodeURIComponent(token)}`;

      // Create EventSource
      this.eventSource = new EventSource(sseUrl);

      // Connection opened
      this.eventSource.onopen = () => {
        this.connectionState = 'connected';
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.emit('connected');
        console.log('[SSE] Connected');
      };

      // Message received
      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('[SSE] Failed to parse message:', error);
        }
      };

      // Connection error
      this.eventSource.onerror = (error) => {
        console.error('[SSE] Connection error:', error);
        this.handleDisconnect();
      };

    } catch (error) {
      console.error('[SSE] Failed to connect:', error);
      this.handleDisconnect();
    }
  }

  /**
   * Disconnect from SSE endpoint
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.connectionState = 'disconnected';
    this.reconnectAttempts = 0;
    this.emit('disconnected');
    console.log('[SSE] Disconnected');
  }

  /**
   * Handle incoming SSE message
   */
  private handleMessage(data: unknown): void {
    // Determine message type and emit appropriate event
    if (typeof data === 'object' && data !== null) {
      const message = data as Record<string, unknown>;

      // Check for type field
      if (message.type) {
        this.emit(message.type as string, data);
      }

      // Check for download progress
      if (message.hash && typeof message.progress === 'number') {
        this.emit('download-progress', data);
      }

      // Emit generic message event
      this.emit('message', data);
    }
  }

  /**
   * Handle disconnection with auto-reconnect
   */
  private handleDisconnect(): void {
    const wasConnected = this.connectionState === 'connected';
    this.connectionState = 'error';
    this.emit('error');

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    // Auto-reconnect with exponential backoff
    if (wasConnected && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
        this.maxReconnectDelay
      );

      console.log(`[SSE] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      this.reconnectTimeout = setTimeout(() => {
        this.connect().catch((error) => {
          console.error('[SSE] Reconnect failed:', error);
        });
      }, delay);
    } else if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[SSE] Max reconnect attempts reached');
      this.emit('disconnected');
    }
  }

  /**
   * Subscribe to specific event type
   */
  on(event: SSEEventType, listener: (...args: unknown[]) => void): this {
    return super.on(event, listener);
  }

  /**
   * Unsubscribe from event
   */
  off(event: SSEEventType, listener: (...args: unknown[]) => void): this {
    return super.off(event, listener);
  }
}

// Export singleton instance
export const sseService = new SSEService();

/**
 * Hook to use SSE service in components
 */
export function connectSSE(): SSEService {
  // Auto-connect on first use
  if (!sseService.isConnected() && sseService.getState() === 'disconnected') {
    sseService.connect().catch((error) => {
      console.error('Failed to connect SSE:', error);
    });
  }
  return sseService;
}

/**
 * Disconnect SSE when app is backgrounded/closed
 */
export function disconnectSSE(): void {
  sseService.disconnect();
}
