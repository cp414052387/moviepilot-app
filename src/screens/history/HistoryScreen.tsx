/**
 * History Screen
 *
 * Activity history and logs:
 * - Download history
 * - Subscription history
 * - Scan history
 * - Notifications
 * - System events
 * - Filter by type/status
 * - Search functionality
 */

import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Text, useTheme, IconButton, Chip, Searchbar, SegmentedButtons } from 'react-native-paper';
import { GlassCard } from '@/components/common';
import { useHistory } from '@/hooks/useHistory';
import type { HistoryItem, HistoryType, HistoryStatus } from '@/types/history';

interface HistoryItemCardProps {
  item: HistoryItem;
  onPress: () => void;
  onDelete: () => void;
}

function HistoryItemCard({ item, onPress, onDelete }: HistoryItemCardProps) {
  const theme = useTheme();

  const getTypeIcon = () => {
    switch (item.type) {
      case 'download': return 'download';
      case 'subscribe': return 'subscription';
      case 'scan': return 'scanner';
      case 'notification': return 'bell';
      case 'system': return 'cog';
      default: return 'history';
    }
  };

  const getStatusIcon = () => {
    switch (item.status) {
      case 'success': return 'check-circle';
      case 'failed': return 'alert-circle';
      case 'pending': return 'clock-outline';
      case 'cancelled': return 'cancel';
      default: return 'help-circle';
    }
  };

  const getStatusColor = () => {
    switch (item.status) {
      case 'success': return '#4CAF50';
      case 'failed': return '#F44336';
      case 'pending': return '#FF9800';
      case 'cancelled': return '#9E9E9E';
      default: return '#9E9E9E';
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

  return (
    <GlassCard onPress={onPress} style={styles.historyItemCard}>
      <View style={styles.historyItemHeader}>
        <View style={styles.historyItemLeft}>
          <View style={styles.historyItemIconContainer}>
            <IconButton
              icon={getTypeIcon()}
              size={20}
              iconColor={theme.colors.primary}
              style={styles.historyItemIcon}
            />
          </View>
          <View style={styles.historyItemInfo}>
            <Text variant="titleMedium" style={styles.historyItemTitle}>{item.title}</Text>
            {item.description && (
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            <View style={styles.historyItemMeta}>
              <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {formatTimestamp(item.timestamp)}
              </Text>
            </View>
          </View>
        </View>
        <IconButton
          icon="delete-outline"
          size={18}
          onPress={onDelete}
          iconColor={theme.colors.error}
        />
      </View>
    </GlassCard>
  );
}

type FilterPeriod = 'all' | 'today' | 'week' | 'month';

export function HistoryScreen() {
  const theme = useTheme();
  const {
    historyItems,
    stats,
    isLoading,
    isRefreshing,
    selectedTypes,
    selectedStatuses,
    loadMore,
    refresh,
    toggleTypeFilter,
    deleteItem,
    clear,
  } = useHistory();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [periodFilter, setPeriodFilter] = React.useState<FilterPeriod>('all');

  const handleSearch = useCallback(() => {
    // Search functionality
  }, []);

  const handleDeleteItem = useCallback(async (itemId: string) => {
    await deleteItem(itemId);
  }, [deleteItem]);

  const getTypeLabel = (type: HistoryType) => {
    switch (type) {
      case 'download': return 'Downloads';
      case 'subscribe': return 'Subscriptions';
      case 'scan': return 'Scans';
      case 'notification': return 'Notifications';
      case 'system': return 'System';
      default: return type;
    }
  };

  const getTypeIcon = (type: HistoryType) => {
    switch (type) {
      case 'download': return 'download';
      case 'subscribe': return 'subscription';
      case 'scan': return 'scanner';
      case 'notification': return 'bell';
      case 'system': return 'cog';
      default: return 'history';
    }
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text variant="headlineSmall" style={styles.headerTitle}>History</Text>
          {stats && (
            <View style={styles.statsRow}>
              <Chip icon="clock" textStyle={styles.chipText}>{stats.total_items} Total</Chip>
              {stats.today_count > 0 && (
                <Chip icon="calendar-today" textStyle={styles.chipText}>{stats.today_count} Today</Chip>
              )}
            </View>
          )}
        </View>

        {/* Period Filter */}
        <View style={styles.periodFilterContainer}>
          {(['all', 'today', 'week', 'month'] as FilterPeriod[]).map((period) => (
            <Chip
              key={period}
              selected={periodFilter === period}
              onPress={() => setPeriodFilter(period)}
              style={styles.periodChip}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Chip>
          ))}
        </View>

        {/* Type Filter */}
        <View style={styles.typeFilterContainer}>
          <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
            Filter by Type
          </Text>
          <View style={styles.typeChipsRow}>
            {(['download', 'subscribe', 'scan', 'notification', 'system'] as HistoryType[]).map((type) => {
              const count = stats?.by_type[type] || 0;
              if (count === 0) return null;
              return (
                <Chip
                  key={type}
                  selected={selectedTypes.includes(type)}
                  onPress={() => toggleTypeFilter(type)}
                  icon={getTypeIcon(type)}
                  style={styles.typeChip}
                >
                  {getTypeLabel(type)} ({count})
                </Chip>
              );
            })}
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search history..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            onSubmitEditing={handleSearch}
            style={styles.searchBar}
            iconColor={theme.colors.onSurface}
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (historyItems.length === 0 && !isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <IconButton icon="history" size={48} iconColor={theme.colors.onSurfaceVariant} />
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>No history found</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={historyItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HistoryItemCard
            item={item}
            onPress={() => {}}
            onDelete={() => handleDeleteItem(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
        onEndReached={() => loadMore()}
        onEndReachedThreshold={0.5}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  headerTop: { marginBottom: 16 },
  headerTitle: { fontWeight: '600', marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chipText: { fontSize: 12 },
  periodFilterContainer: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  periodChip: { flex: 1 },
  typeFilterContainer: { marginBottom: 12 },
  typeChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {},
  searchContainer: { marginBottom: 8 },
  searchBar: { elevation: 0, backgroundColor: '#2A2A2A', borderRadius: 12 },
  listContent: { padding: 16, gap: 12 },
  historyItemCard: { padding: 12 },
  historyItemHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  historyItemLeft: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  historyItemIconContainer: { backgroundColor: 'rgba(229, 9, 20, 0.1)', borderRadius: 8, marginRight: 12 },
  historyItemIcon: { margin: 0 },
  historyItemInfo: { flex: 1 },
  historyItemTitle: { fontWeight: '500', marginBottom: 4 },
  historyItemMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  statusIndicator: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  emptyContainer: { alignItems: 'center', paddingVertical: 64 },
});
