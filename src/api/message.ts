/**
 * Message API
 *
 * Handles messaging and chat functionality:
 * - Send chat messages
 * - Get message history
 * - WebPush subscription management
 */

import { apiClient } from './client';
import type {
  ChatMessage,
  ChatMessageResponse,
  SystemMessage,
  CommandRequest,
} from '@/types';

/**
 * Send chat message
 * POST /message/
 */
export async function sendMessage(content: string): Promise<ChatMessage> {
  const response = await apiClient.post<ChatMessage>('/message/', {
    content,
  });
  return response.data;
}

/**
 * Get chat message history
 * GET /message/web
 */
export async function getChatHistory(params?: {
  page?: number;
}): Promise<ChatMessageResponse> {
  const response = await apiClient.get<ChatMessageResponse>('/message/web', {
    params: {
      page: params?.page || 1,
    },
  });
  return response.data;
}

/**
 * Subscribe to WebPush notifications
 * POST /message/webpush/subscribe
 */
export async function subscribeWebPush(params: {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    '/message/webpush/subscribe',
    {
      subscription: params,
    }
  );
  return response.data;
}

/**
 * Unsubscribe from WebPush notifications
 * POST /message/webpush/unsubscribe
 */
export async function unsubscribeWebPush(): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    '/message/webpush/unsubscribe'
  );
  return response.data;
}

/**
 * Get system messages (non-SSE fallback)
 */
export async function getSystemMessages(): Promise<SystemMessage[]> {
  // This might not be a real endpoint - using as fallback
  const response = await apiClient.get<SystemMessage[]>('/message/system');
  return response.data;
}
