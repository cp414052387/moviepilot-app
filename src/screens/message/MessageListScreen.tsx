/**
 * MessageListScreen
 *
 * Displays system messages and notifications:
 * - System message cards with type indicators
 * - Timestamp and title
 * - Interactive action buttons
 * - Pull to refresh
 * - Empty state
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  IconButton,
  Chip,
  useTheme,
  ActivityIndicator,
  Button,
} from 'react-native-paper';
import { sseService } from '@/services/SSEService';
import type { SystemMessage } from '@/types';

const MESSAGE_TYPE_COLORS: Record<SystemMessage['type'], string> = {
  info: '#42A5F5',
  warning: '#FFA726',
  error: '#EF5350',
  success: '#66BB6A',
};

const MESSAGE_TYPE_ICONS: Record<SystemMessage['type'], string> = {
  info: 'information',
  warning: 'alert',
  error: 'alert-circle',
  success: 'check-circle',
};

export function MessageListScreen({ navigation }: any) {
  const theme = useTheme();

  const [messages, setMessages] = useState<SystemMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load messages
  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      // Messages will come from SSE
      // For now, show empty state
      setMessages([]);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  // Setup SSE listener
  useEffect(() => {
    const handleMessage = (data: unknown) => {
      if (typeof data === 'object' && data !== null) {
        const msg = data as SystemMessage;
        if (msg.title && msg.content && msg.type) {
          setMessages((prev) => [msg, ...prev]);
        }
      }
    };

    sseService.on('message', handleMessage);

    // Load initial messages
    loadMessages();

    return () => {
      sseService.off('message', handleMessage);
    };
  }, [loadMessages]);

  // Handle action button press
  const handleActionPress = async (
    message: SystemMessage,
    action: { label: string; action: string; data?: Record<string, unknown> }
  ) => {
    const data = action.data;
    const isRecord = (value: unknown): value is Record<string, unknown> =>
      typeof value === 'object' && value !== null;
    const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : undefined);
    const asNumber = (value: unknown) =>
      typeof value === 'number' && !Number.isNaN(value) ? value : undefined;
    const mediaType = isRecord(data) && data.type === 'tv' ? 'tv' : 'movie';

    try {
      switch (action.action) {
        case 'open_chat': {
          const chatId = isRecord(data) ? asString(data.chatId) : undefined;
          navigation.navigate('Chat', chatId ? { chatId } : undefined);
          break;
        }
        case 'search': {
          const query = isRecord(data) ? asString(data.query) : undefined;
          if (!query) {
            Alert.alert('Action unavailable', 'Missing search query.');
            return;
          }
          navigation.navigate('Media', {
            screen: 'Search',
            params: { initialQuery: query },
          });
          break;
        }
        case 'subscribe': {
          const tmdbId = isRecord(data) ? asNumber(data.tmdbId) : undefined;
          if (!tmdbId) {
            Alert.alert('Action unavailable', 'Missing TMDB ID for subscription.');
            return;
          }
          navigation.navigate('Media', {
            screen: 'AddSubscribe',
            params: { tmdbId, mediaType },
          });
          break;
        }
        case 'media_detail': {
          const tmdbId = isRecord(data) ? asNumber(data.tmdbId) : undefined;
          const mediaId = isRecord(data) ? asString(data.mediaId) : undefined;
          if (!tmdbId && !mediaId) {
            Alert.alert('Action unavailable', 'Missing media identifiers.');
            return;
          }
          navigation.navigate('Media', {
            screen: 'MediaDetail',
            params: { tmdbId, mediaId, type: mediaType },
          });
          break;
        }
        case 'open_downloads':
          navigation.navigate('Downloads');
          break;
        case 'add_download':
          navigation.navigate('Downloads', { screen: 'AddDownload' });
          break;
        case 'open_subscriptions':
          navigation.navigate('Subscriptions');
          break;
        case 'subscription_detail': {
          const subscriptionId = isRecord(data) ? asString(data.subscriptionId) : undefined;
          if (!subscriptionId) {
            Alert.alert('Action unavailable', 'Missing subscription ID.');
            return;
          }
          navigation.navigate('Subscriptions', {
            screen: 'SubscribeDetail',
            params: { subscriptionId },
          });
          break;
        }
        case 'open_settings':
          navigation.navigate('Settings');
          break;
        case 'open_history':
          navigation.navigate('Settings', { screen: 'History' });
          break;
        case 'open_media_server':
          navigation.navigate('Settings', { screen: 'MediaServer' });
          break;
        case 'dismiss':
          handleDeleteMessage(message.id);
          break;
        default:
          Alert.alert('Action not supported', `Unsupported action: ${action.action}`);
      }
    } catch (error) {
      console.error('Failed to handle action:', error);
      Alert.alert('Error', 'Unable to complete this action.');
    }
  };

  // Delete message
  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  // Navigate to chat
  const handleOpenChat = () => {
    navigation.navigate('Chat');
  };

  // Render message item
  const renderMessageItem = ({ item }: { item: SystemMessage }) => {
    const typeColor = MESSAGE_TYPE_COLORS[item.type];
    const typeIcon = MESSAGE_TYPE_ICONS[item.type];

    return (
      <Card
        style={[styles.messageCard, { backgroundColor: theme.colors.surfaceVariant }]}
        elevation={1}
      >
        <Card.Content>
          {/* Header: Icon, Title, Timestamp */}
          <View style={styles.messageHeader}>
            <View style={styles.titleSection}>
              <View style={[styles.iconContainer, { backgroundColor: `${typeColor}20` }]}>
                <IconButton
                  icon={typeIcon}
                  size={20}
                  iconColor={typeColor}
                  style={styles.typeIcon}
                />
              </View>
              <View style={styles.titleText}>
                <Text variant="titleMedium">{item.title}</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {new Date(item.created_at).toLocaleString()}
                </Text>
              </View>
            </View>
            <IconButton
              icon="close"
              size={20}
              onPress={() => handleDeleteMessage(item.id)}
              style={styles.closeButton}
            />
          </View>

          {/* Content */}
          <Text
            variant="bodyMedium"
            style={[styles.messageContent, { color: theme.colors.onSurfaceVariant }]}
          >
            {item.content}
          </Text>

          {/* Action Buttons */}
          {item.actions && item.actions.length > 0 && (
            <View style={styles.actionsContainer}>
              {item.actions.map((action, index) => (
                <Button
                  key={index}
                  mode="outlined"
                  compact
                  onPress={() => handleActionPress(item, action)}
                  style={styles.actionButton}
                >
                  {action.label}
                </Button>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyState}>
        <IconButton
          icon="message-text-outline"
          size={64}
          iconColor={theme.colors.outline}
        />
        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          No messages yet
        </Text>
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}
        >
          Messages from MoviePilot will appear here
        </Text>
        <Button
          mode="contained"
          onPress={handleOpenChat}
          style={styles.chatButton}
          buttonColor="#E50914"
        >
          Open Chat
        </Button>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text variant="titleLarge">Messages</Text>
        <Button
          mode="text"
          icon="chat"
          onPress={handleOpenChat}
          textColor={theme.colors.primary}
        >
          Open Chat
        </Button>
      </View>

      {/* Message List */}
      <FlatList
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          messages.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  messageCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  typeIcon: {
    margin: 0,
  },
  titleText: {
    flex: 1,
  },
  closeButton: {
    margin: 0,
  },
  messageContent: {
    marginBottom: 12,
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  actionButton: {
    marginHorizontal: 4,
    marginVertical: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  chatButton: {
    marginTop: 16,
  },
});
