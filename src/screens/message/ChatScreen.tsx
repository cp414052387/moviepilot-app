/**
 * ChatScreen
 *
 * Chat interface for interacting with MoviePilot:
 * - Message bubbles (sent/received)
 * - Interactive button support in messages
 * - Quick commands
 * - Message input
 * - Typing indicator
 * - Auto-scroll to latest message
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  IconButton,
  useTheme,
  ActivityIndicator,
  Button,
  Chip,
  TextInput,
} from 'react-native-paper';
import { chatService, QUICK_COMMANDS } from '@/services/ChatService';
import type { ChatMessage } from '@/types';

export function ChatScreen({ navigation }: any) {
  const theme = useTheme();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickCommands, setShowQuickCommands] = useState(false);

  // Load message history
  useEffect(() => {
    const loadHistory = async () => {
      await chatService.loadHistory();
      setMessages(chatService.getMessages());
    };
    loadHistory();
  }, []);

  // Listen for new messages
  useEffect(() => {
    const handleNewMessage = (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    };

    const handleHistoryLoaded = (history: ChatMessage[]) => {
      setMessages(history);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    };

    const handleLoadingChange = (loading: boolean) => {
      setIsLoading(loading);
    };

    const handleQuickCommand = ({ command, params }: { command: string; params: string[] }) => {
      // Handle quick command
      handleCommandExecution(command, params);
    };

    chatService.on('newMessage', handleNewMessage);
    chatService.on('historyLoaded', handleHistoryLoaded);
    chatService.on('loadingChange', handleLoadingChange);
    chatService.on('quickCommand', handleQuickCommand);

    return () => {
      chatService.off('newMessage', handleNewMessage);
      chatService.off('historyLoaded', handleHistoryLoaded);
      chatService.off('loadingChange', handleLoadingChange);
      chatService.off('quickCommand', handleQuickCommand);
    };
  }, []);

  // Handle command execution
  const handleCommandExecution = (command: string, params: string[]) => {
    switch (command) {
      case '/search':
        navigation.navigate('Media', {
          screen: 'Search',
          params: { initialQuery: params.join(' ') },
        });
        break;
      case '/subscribe':
        navigation.navigate('Media', {
          screen: 'Search',
          params: { initialQuery: params.join(' ') },
        });
        break;
      case '/download':
        Alert.alert('Download', 'Download functionality - add magnet/torrent link');
        break;
      case '/status':
        Alert.alert('Status', 'System status: All systems operational');
        break;
      default:
        break;
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const text = inputText.trim();
    setInputText('');

    try {
      await chatService.sendMessage(text);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  // Handle quick command selection
  const handleQuickCommandSelect = (command: string, params?: string[]) => {
    const fullCommand = params ? `${command} ${params.join(' ')}` : command;
    setInputText(fullCommand);
    setShowQuickCommands(false);
  };

  // Handle button press in message
  const handleButtonPress = async (message: ChatMessage, button: { text: string; action: string; data?: unknown }) => {
    try {
      await chatService.handleButtonPress(message.id, button.action, button.data);

      // Handle specific actions
      switch (button.action) {
        case 'subscribe':
          if (button.data && typeof button.data === 'object') {
            const data = button.data as { tmdbId?: number; type?: string };
            if (data.tmdbId) {
              navigation.navigate('Media', {
                screen: 'AddSubscribe',
                params: {
                  tmdbId: data.tmdbId,
                  mediaType: data.type === 'tv' ? 'tv' : 'movie',
                },
              });
            }
          }
          break;
        case 'search':
          if (button.data && typeof button.data === 'object') {
            const data = button.data as { query?: string };
            if (data.query) {
              navigation.navigate('Media', {
                screen: 'Search',
                params: { initialQuery: data.query },
              });
            }
          }
          break;
        case 'dismiss':
          // Just dismiss the action
          break;
        default:
          Alert.alert('Action', button.action);
      }
    } catch (error) {
      console.error('Failed to handle button press:', error);
    }
  };

  // Render message bubble
  const renderMessageBubble = ({ item }: { item: ChatMessage }) => {
    const isFromUser = item.is_from_user;

    return (
      <View
        style={[
          styles.messageRow,
          isFromUser ? styles.messageRowUser : styles.messageRowBot,
        ]}
      >
        {!isFromUser && (
          <View style={[styles.avatar, { backgroundColor: '#E50914' }]}>
            <Text style={styles.avatarText}>MP</Text>
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isFromUser ? styles.messageBubbleUser : styles.messageBubbleBot,
            isFromUser
              ? { backgroundColor: '#E50914' }
              : { backgroundColor: theme.colors.surfaceVariant },
          ]}
        >
          <Text
            variant="bodyMedium"
            style={[
              styles.messageText,
              isFromUser ? { color: '#FFFFFF' } : { color: theme.colors.onSurface },
            ]}
          >
            {item.content}
          </Text>

          {/* Attachments */}
          {item.attachments && item.attachments.length > 0 && (
            <View style={styles.attachmentsContainer}>
              {item.attachments.map((attachment, index) => (
                <Chip
                  key={index}
                  mode="outlined"
                  icon={attachment.type === 'image' ? 'image' : 'link'}
                  style={styles.attachmentChip}
                  onPress={() => {
                    if (attachment.type === 'link') {
                      Alert.alert('Link', attachment.url);
                    }
                  }}
                >
                  {attachment.title || attachment.type}
                </Chip>
              ))}
            </View>
          )}

          {/* Interactive Buttons */}
          {item.buttons && item.buttons.length > 0 && (
            <View style={styles.buttonsContainer}>
              {item.buttons.map((button, index) => (
                <Button
                  key={index}
                  mode={isFromUser ? 'contained' : 'outlined'}
                  compact
                  onPress={() => handleButtonPress(item, button)}
                  style={styles.messageButton}
                  buttonColor={isFromUser ? undefined : '#E50914'}
                  textColor={isFromUser ? '#FFFFFF' : '#E50914'}
                >
                  {button.text}
                </Button>
              ))}
            </View>
          )}

          {/* Timestamp */}
          <Text
            variant="labelSmall"
            style={[
              styles.timestamp,
              isFromUser ? { color: 'rgba(255,255,255,0.7)' } : { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {new Date(item.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  // Render quick command chip
  const renderQuickCommand = (command: { command: string; label: string; description: string }) => (
    <Chip
      key={command.command}
      mode="outlined"
      onPress={() => handleQuickCommandSelect(command.command)}
      style={styles.quickCommandChip}
      icon="chevron-right"
    >
      {command.label}
    </Chip>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text variant="titleLarge">Chat</Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          Ask MoviePilot anything
        </Text>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessageBubble}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <IconButton
              icon="robot"
              size={64}
              iconColor={theme.colors.outline}
            />
            <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Start a conversation
            </Text>
            <Text
              variant="bodyMedium"
              style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}
            >
              Try quick commands like /search, /subscribe, /status
            </Text>
          </View>
        }
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Typing Indicator */}
      {isLoading && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 8 }}>
            MoviePilot is typing...
          </Text>
        </View>
      )}

      {/* Quick Commands */}
      {showQuickCommands && (
        <View style={[styles.quickCommandsContainer, { backgroundColor: theme.colors.surface }]}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
            Quick Commands
          </Text>
          <View style={styles.quickCommandsList}>
            {QUICK_COMMANDS.map(renderQuickCommand)}
          </View>
        </View>
      )}

      {/* Input Area */}
      <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
        <IconButton
          icon="plus"
          size={24}
          onPress={() => setShowQuickCommands(!showQuickCommands)}
          style={styles.inputIcon}
        />

        <TextInput
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          mode="flat"
          style={styles.input}
          dense
          onSubmitEditing={handleSendMessage}
          blurOnSubmit={false}
        />

        <IconButton
          icon="send"
          size={24}
          onPress={handleSendMessage}
          disabled={!inputText.trim()}
          iconColor={inputText.trim() ? '#E50914' : theme.colors.outline}
          style={styles.inputIcon}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowBot: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
  },
  messageBubbleUser: {
    borderBottomRightRadius: 4,
  },
  messageBubbleBot: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    lineHeight: 20,
  },
  attachmentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginHorizontal: -4,
  },
  attachmentChip: {
    marginHorizontal: 4,
    marginVertical: 4,
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginHorizontal: -4,
  },
  messageButton: {
    marginHorizontal: 4,
    marginVertical: 4,
    minHeight: 32,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  quickCommandsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  quickCommandsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  quickCommandChip: {
    marginHorizontal: 4,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
  },
  inputIcon: {
    margin: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginTop: 80,
  },
});
