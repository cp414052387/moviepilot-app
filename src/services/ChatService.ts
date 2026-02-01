/**
 * Chat Service
 *
 * Manages chat functionality:
 * - Send/receive messages
 * - Quick commands
 * - Interactive button handling
 * - Message history
 */

import { EventEmitter } from 'events';
import { sendMessage, getChatHistory } from '@/api/message';
import { sseService } from './SSEService';
import type { ChatMessage, QuickCommand } from '@/types';

// Quick command definitions
export const QUICK_COMMANDS: Array<{ command: QuickCommand; label: string; description: string }> = [
  { command: '/search', label: 'Search', description: 'Search for movies or TV shows' },
  { command: '/download', label: 'Download', description: 'Add a download link' },
  { command: '/subscribe', label: 'Subscribe', description: 'Create a new subscription' },
  { command: '/status', label: 'Status', description: 'Get system status' },
];

/**
 * Chat Service Class
 */
class ChatService extends EventEmitter {
  private messages: ChatMessage[] = [];
  private isLoading = false;

  constructor() {
    super();
    this.setMaxListeners(50);

    // Listen for incoming chat messages from SSE
    this.setupSSEListener();
  }

  /**
   * Setup SSE listener for chat messages
   */
  private setupSSEListener(): void {
    sseService.on('message', (data: unknown) => {
      if (typeof data === 'object' && data !== null) {
        const message = data as ChatMessage;
        // Check if this is a chat message
        if (message.content && !message.is_from_user) {
          this.addMessage(message);
        }
      }
    });
  }

  /**
   * Get all messages
   */
  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  /**
   * Add message to history
   */
  private addMessage(message: ChatMessage): void {
    this.messages.push({
      ...message,
      id: message.id || Date.now().toString(),
      created_at: message.created_at || new Date().toISOString(),
    });
    this.emit('newMessage', message);
  }

  /**
   * Send a message
   */
  async sendMessage(content: string): Promise<ChatMessage> {
    this.isLoading = true;
    this.emit('loadingChange', true);

    try {
      // Add user message immediately
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content,
        is_from_user: true,
        created_at: new Date().toISOString(),
      };
      this.addMessage(userMessage);

      // Check if it's a quick command
      if (content.startsWith('/')) {
        return await this.handleQuickCommand(content);
      }

      // Send to server
      const response = await sendMessage(content);

      // Add response message
      this.addMessage(response);

      this.isLoading = false;
      this.emit('loadingChange', false);

      return response;
    } catch (error) {
      console.error('[ChatService] Failed to send message:', error);
      this.isLoading = false;
      this.emit('loadingChange', false);
      throw error;
    }
  }

  /**
   * Handle quick commands
   */
  private async handleQuickCommand(content: string): Promise<ChatMessage> {
    const parts = content.split(' ');
    const command = parts[0] as QuickCommand;
    const params = parts.slice(1);

    // Emit command event for UI to handle
    this.emit('quickCommand', { command, params });

    // Return a placeholder response
    const response: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: `Processing command: ${command}`,
      is_from_user: false,
      created_at: new Date().toISOString(),
      buttons: [
        { text: 'OK', action: 'dismiss' },
      ],
    };

    this.addMessage(response);
    return response;
  }

  /**
   * Load message history
   */
  async loadHistory(): Promise<void> {
    try {
      const response = await getChatHistory();
      this.messages = response.results || [];
      this.emit('historyLoaded', this.messages);
    } catch (error) {
      console.error('[ChatService] Failed to load history:', error);
    }
  }

  /**
   * Clear all messages
   */
  clearMessages(): void {
    this.messages = [];
    this.emit('messagesCleared');
  }

  /**
   * Handle interactive button press
   */
  async handleButtonPress(messageId: string, action: string, data?: unknown): Promise<void> {
    // Emit button press event for UI to handle
    this.emit('buttonPress', { messageId, action, data });

    // Add a system message to show the action was taken
    const response: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: `Action "${action}" executed`,
      is_from_user: false,
      created_at: new Date().toISOString(),
    };

    this.addMessage(response);
  }

  /**
   * Get loading state
   */
  getLoadingState(): boolean {
    return this.isLoading;
  }

  /**
   * Parse quick command from input
   */
  static parseCommand(input: string): { command: QuickCommand | null; params: string[] } {
    if (!input.startsWith('/')) {
      return { command: null, params: [] };
    }

    const parts = input.split(' ');
    const command = parts[0] as QuickCommand;
    const params = parts.slice(1);

    // Validate command
    const validCommands = QUICK_COMMANDS.map((c) => c.command);
    if (!validCommands.includes(command)) {
      return { command: null, params: [] };
    }

    return { command, params };
  }

  /**
   * Format quick command with parameters
   */
  static formatCommand(command: QuickCommand, params: string[]): string {
    return `${command} ${params.join(' ')}`;
  }
}

// Export singleton instance
export const chatService = new ChatService();

/**
 * Hook to use chat service
 */
export function useChat() {
  return chatService;
}
