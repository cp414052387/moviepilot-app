/**
 * Activity List Component
 *
 * Displays recent activity items with:
 * - Icon based on activity type
 * - Title and description
 * - Timestamp
 * - Status indicator
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, IconButton, useTheme, Divider } from 'react-native-paper';
import type { ActivityItem } from '@/api/dashboard';

export interface ActivityListProps {
  activities: ActivityItem[];
  onItemPress?: (activity: ActivityItem) => void;
  glassmorphism?: boolean;
}

export function ActivityList({ activities, onItemPress, glassmorphism = false }: ActivityListProps) {
  const theme = useTheme();

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'download':
        return 'download';
      case 'subscription':
        return 'subscription';
      case 'media':
        return 'movie';
      case 'system':
        return 'cog';
      default:
        return 'information';
    }
  };

  const getStatusColor = (status?: ActivityItem['status']) => {
    switch (status) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'pending':
        return '#FF9800';
      case 'info':
      default:
        return theme.colors.primary;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (activities.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <IconButton icon="calendar-blank" size={48} iconColor={theme.colors.onSurfaceDisabled} />
        <Text variant="bodyMedium" style={styles.emptyText}>
          No recent activity
        </Text>
      </View>
    );
  }

  return (
    <View style={glassmorphism ? styles.glassmorphismContainer : styles.container}>
      {activities.map((activity, index) => (
        <View key={activity.id}>
          <View style={styles.activityItem}>
            <View style={styles.activityIconContainer}>
              <View style={[styles.activityIconBackground, { backgroundColor: `${getStatusColor(activity.status)}20` }]}>
                <IconButton
                  icon={getActivityIcon(activity.type)}
                  size={20}
                  iconColor={getStatusColor(activity.status)}
                  style={styles.activityIcon}
                />
              </View>
            </View>

            <View style={styles.activityContent}>
              <Text variant="bodyMedium" style={styles.activityTitle} numberOfLines={1}>
                {activity.title}
              </Text>
              <Text variant="bodySmall" style={styles.activityDescription} numberOfLines={2}>
                {activity.description}
              </Text>
            </View>

            <View style={styles.activityMeta}>
              <Text variant="labelSmall" style={styles.timestamp}>
                {formatTimestamp(activity.timestamp)}
              </Text>
            </View>
          </View>
          {index < activities.length - 1 && <Divider style={styles.divider} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    overflow: 'hidden',
  },
  glassmorphismContainer: {
    backgroundColor: 'rgba(31, 31, 31, 0.6)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  activityIconContainer: {
    marginRight: 12,
  },
  activityIconBackground: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  activityIcon: {
    margin: 0,
  },
  activityContent: {
    flex: 1,
    marginRight: 8,
  },
  activityTitle: {
    fontWeight: '500',
    marginBottom: 2,
  },
  activityDescription: {
    opacity: 0.7,
  },
  activityMeta: {
    alignItems: 'flex-end',
  },
  timestamp: {
    opacity: 0.5,
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: 60,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 8,
  },
});
