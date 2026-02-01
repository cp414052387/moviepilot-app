/**
 * DownloadListScreen
 *
 * Displays all download tasks:
 * - Active downloads with progress bars
 * - Paused downloads
 * - Completed downloads
 * - Task controls (start/pause/delete)
 * - Real-time progress updates via SSE
 * - Pull to refresh
 */

import React, { useState } from 'react';
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
  ProgressBar,
  SegmentedButtons,
  ActivityIndicator,
} from 'react-native-paper';
import { useDownload } from '@/hooks/useDownload';
import type { DownloadStatusFilter } from '@/hooks/useDownload';

const STATUS_FILTERS: Array<{ value: DownloadStatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'downloading', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Done' },
];

const STATUS_COLORS: Record<string, string> = {
  downloading: '#42A5F5',
  paused: '#FFA726',
  seeding: '#66BB6A',
  completed: '#66BB6A',
  error: '#EF5350',
};

export function DownloadListScreen({ navigation }: any) {
  const theme = useTheme();
  const [statusFilter, setStatusFilter] = useState<DownloadStatusFilter>('all');

  const {
    downloads,
    activeDownloads,
    pausedDownloads,
    completedDownloads,
    isLoading,
    start,
    pause,
    remove,
    refresh,
    getProgress,
    isStarting,
    isPausing,
    isDeleting,
  } = useDownload(statusFilter);

  // Get display data based on filter
  const getDisplayData = () => {
    switch (statusFilter) {
      case 'downloading':
        return { count: activeDownloads.length, label: 'Active Downloads' };
      case 'paused':
        return { count: pausedDownloads.length, label: 'Paused Downloads' };
      case 'completed':
        return { count: completedDownloads.length, label: 'Completed Downloads' };
      default:
        return { count: downloads.length, label: 'All Downloads' };
    }
  };

  const displayData = getDisplayData();

  // Handle start action
  const handleStart = async (hash: string) => {
    try {
      await start(hash);
    } catch (error) {
      Alert.alert('Error', 'Failed to start download');
    }
  };

  // Handle pause action
  const handlePause = async (hash: string) => {
    try {
      await pause(hash);
    } catch (error) {
      Alert.alert('Error', 'Failed to pause download');
    }
  };

  // Handle delete action
  const handleDelete = (hash: string, name: string) => {
    Alert.alert(
      'Delete Download',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await remove(hash);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete download');
            }
          },
        },
      ]
    );
  };

  // Render download item
  const renderDownloadItem = ({ item }: { item: any }) => {
    const progress = getProgress(item.hash);
    const statusColor = STATUS_COLORS[item.status] || theme.colors.outline;

    const isDownloading = item.status === 'downloading';
    const isPaused = item.status === 'paused';
    const isCompleted = item.status === 'completed' || item.status === 'seeding';

    return (
      <Card
        style={[styles.downloadCard, { backgroundColor: theme.colors.surfaceVariant }]}
        elevation={1}
      >
        <Card.Content>
          {/* Header: Name and Status */}
          <View style={styles.cardHeader}>
            <View style={styles.titleSection}>
              <Text variant="titleMedium" numberOfLines={1} style={styles.title}>
                {item.name}
              </Text>
              <Chip
                mode="flat"
                style={[styles.statusChip, { backgroundColor: statusColor }]}
                textStyle={{ fontSize: 11, fontWeight: '600' }}
              >
                {item.status}
              </Chip>
            </View>
          </View>

          {/* Progress Section */}
          {!isCompleted && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {progress.toFixed(1)}%
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {item.downloaded ? `${formatBytes(item.downloaded)} / ` : ''}
                  {item.size ? formatBytes(item.size) : 'Unknown size'}
                </Text>
              </View>
              <ProgressBar
                progress={progress / 100}
                color={statusColor}
                style={styles.progressBar}
              />
              {item.speed > 0 && (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {formatSpeed(item.speed)} {item.eta > 0 ? `• ${formatTime(item.eta)}` : ''}
                </Text>
              )}
            </View>
          )}

          {/* Metadata */}
          {isCompleted && (
            <View style={styles.metadataSection}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Size: {item.size ? formatBytes(item.size) : 'Unknown'}
              </Text>
              {item.save_path && (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  {item.save_path}
                </Text>
              )}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            {isDownloading && (
              <>
                <IconButton
                  icon="pause"
                  size={20}
                  onPress={() => handlePause(item.hash)}
                  disabled={isPausing || isDeleting}
                  style={styles.actionIcon}
                />
                <IconButton
                  icon="delete"
                  size={20}
                  iconColor="#EF5350"
                  onPress={() => handleDelete(item.hash, item.name)}
                  disabled={isPausing || isDeleting}
                  style={styles.actionIcon}
                />
              </>
            )}
            {isPaused && (
              <>
                <IconButton
                  icon="play"
                  size={20}
                  iconColor="#42A5F5"
                  onPress={() => handleStart(item.hash)}
                  disabled={isStarting || isDeleting}
                  style={styles.actionIcon}
                />
                <IconButton
                  icon="delete"
                  size={20}
                  iconColor="#EF5350"
                  onPress={() => handleDelete(item.hash, item.name)}
                  disabled={isStarting || isDeleting}
                  style={styles.actionIcon}
                />
              </>
            )}
            {isCompleted && (
              <>
                <IconButton
                  icon="folder-open"
                  size={20}
                  onPress={() => {/* TODO: Open folder */}}
                  style={styles.actionIcon}
                />
                <IconButton
                  icon="delete"
                  size={20}
                  iconColor="#EF5350"
                  onPress={() => handleDelete(item.hash, item.name)}
                  disabled={isDeleting}
                  style={styles.actionIcon}
                />
              </>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyState}>
        <IconButton
          icon={statusFilter === 'all' ? 'download-off' : 'filter-off'}
          size={64}
          iconColor={theme.colors.outline}
        />
        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {statusFilter === 'all' ? 'No downloads' : `No ${statusFilter} downloads`}
        </Text>
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}
        >
          {statusFilter === 'all'
            ? 'Add torrents or magnets to start downloading'
            : 'Try a different filter'}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header with Stats */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.statsRow}>
          <Text variant="titleLarge">{displayData.count}</Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {displayData.label}
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterContainer, { backgroundColor: theme.colors.surface }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_FILTERS}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <Chip
              mode={statusFilter === item.value ? 'flat' : 'outlined'}
              selected={statusFilter === item.value}
              onPress={() => setStatusFilter(item.value)}
              style={styles.filterChip}
              selectedColor="#E50914"
              showSelectedCheck={false}
            >
              {item.label}
            </Chip>
          )}
        />
      </View>

      {/* Download List */}
      <FlatList
        data={downloads}
        renderItem={renderDownloadItem}
        keyExtractor={(item) => item.hash}
        contentContainerStyle={[
          styles.listContent,
          downloads.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={theme.colors.primary}
          />
        }
      />
    </View>
  );
}

// Utility functions
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatSpeed(bytesPerSecond: number): string {
  return formatBytes(bytesPerSecond) + '/s';
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
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
  statsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  filterContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  filterList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterChip: {
    marginRight: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  downloadCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  cardHeader: {
    marginBottom: 12,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    height: 24,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2A2A2A',
  },
  metadataSection: {
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionIcon: {
    margin: 0,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
});
