/**
 * SubscribeListScreen
 *
 * Displays all user subscriptions:
 * - Status filter tabs (All, Pending, Downloading, Completed, Failed)
 * - Subscription cards with poster
 * - Status indicator
 * - Pull to refresh
 * - Swipe actions (edit/delete)
 * - Empty state
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import {
  Text,
  Card,
  IconButton,
  Chip,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { getSubscriptions, deleteSubscription, refreshSubscription } from '@/api/subscribe';
import { MediaCard } from '@/components/media/MediaCard';
import type { Subscription, SubscriptionStatus } from '@/types';

type StatusFilter = 'all' | SubscriptionStatus;

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'downloading', label: 'Downloading' },
  { key: 'completed', label: 'Completed' },
  { key: 'failed', label: 'Failed' },
];

const STATUS_COLORS: Record<SubscriptionStatus, string> = {
  pending: '#FFA726',
  downloading: '#42A5F5',
  completed: '#66BB6A',
  failed: '#EF5350',
};

export function SubscribeListScreen({ navigation }: any) {
  const theme = useTheme();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load subscriptions
  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const response = await getSubscriptions({ size: 100 });
      setSubscriptions(response.results);
      applyFilter(response.results, statusFilter);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
      Alert.alert('Error', 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  // Apply status filter
  const applyFilter = (items: Subscription[], filter: StatusFilter) => {
    if (filter === 'all') {
      setFilteredSubscriptions(items);
    } else {
      setFilteredSubscriptions(items.filter((item) => item.status === filter));
    }
  };

  // Handle filter change
  const handleFilterChange = (filter: StatusFilter) => {
    setStatusFilter(filter);
    applyFilter(subscriptions, filter);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSubscriptions();
    setRefreshing(false);
  };

  // Handle subscription press
  const handleSubscriptionPress = (subscription: Subscription) => {
    navigation.navigate('SubscribeDetail', { subscriptionId: subscription.id });
  };

  // Handle delete
  const handleDelete = async (subscribeId: string) => {
    setDeletingId(subscribeId);
    try {
      await deleteSubscription(subscribeId);
      // Remove from list
      const updated = subscriptions.filter((s) => s.id !== subscribeId);
      setSubscriptions(updated);
      applyFilter(updated, statusFilter);
    } catch (error) {
      console.error('Failed to delete subscription:', error);
      Alert.alert('Error', 'Failed to delete subscription');
    } finally {
      setDeletingId(null);
    }
  };

  // Handle manual refresh subscription
  const handleRefreshSubscription = async (subscribeId: string) => {
    try {
      await refreshSubscription(subscribeId);
      // Reload list
      await loadSubscriptions();
    } catch (error) {
      console.error('Failed to refresh subscription:', error);
      Alert.alert('Error', 'Failed to refresh subscription');
    }
  };

  // Render subscription card
  const renderSubscriptionCard = ({ item }: { item: Subscription }) => {
    const swipeableRef = React.useRef<Swipeable>(null);

    const renderRightActions = () => (
      <View style={styles.swipeActions}>
        <IconButton
          icon="refresh"
          size={24}
          iconColor="#42A5F5"
          style={styles.swipeButton}
          onPress={() => {
            swipeableRef.current?.close();
            handleRefreshSubscription(item.id);
          }}
        />
        <IconButton
          icon="delete"
          size={24}
          iconColor="#EF5350"
          style={styles.swipeButton}
          onPress={() => {
            swipeableRef.current?.close();
            Alert.alert(
              'Delete Subscription',
              `Are you sure you want to delete "${item.name}"?`,
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => handleDelete(item.id),
                },
              ]
            );
          }}
        />
      </View>
    );

    const posterUrl = item.poster_path
      ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
      : 'https://via.placeholder.com/300x450?text=No+Image';

    return (
      <Swipeable ref={swipeableRef} renderRightActions={renderRightActions}>
        <Card
          style={[styles.subscriptionCard, { backgroundColor: theme.colors.surfaceVariant }]}
          onPress={() => handleSubscriptionPress(item)}
        >
          <Card.Content style={styles.cardContent}>
            {/* Poster */}
            <Card.Cover
              source={{ uri: posterUrl }}
              style={styles.poster}
              resizeMode="cover"
            />

            {/* Info */}
            <View style={styles.info}>
              <View style={styles.headerRow}>
                <Text variant="titleMedium" style={styles.title}>
                  {item.name}
                </Text>
                <Chip
                  mode="flat"
                  textStyle={{ fontSize: 12, fontWeight: '600' }}
                  style={[styles.statusChip, { backgroundColor: STATUS_COLORS[item.status] }]}
                >
                  {item.status}
                </Chip>
              </View>

              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {item.year} • {item.type === 'movie' ? 'Movie' : 'TV Show'}
              </Text>

              {item.type === 'tv' && item.seasons && item.seasons.length > 0 && (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Seasons: {item.seasons.join(', ')}
                </Text>
              )}

              {item.current_episode && item.total_episodes && (
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  S{item.current_season}:E{item.current_episode} / {item.total_episodes} episodes
                </Text>
              )}

              <View style={styles.footerRow}>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Added: {new Date(item.date_added).toLocaleDateString()}
                </Text>
                {deletingId === item.id && <ActivityIndicator size="small" />}
              </View>
            </View>
          </Card.Content>
        </Card>
      </Swipeable>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View style={styles.emptyState}>
        <IconButton
          icon="subscription"
          size={64}
          iconColor={theme.colors.outline}
        />
        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          {statusFilter === 'all'
            ? 'No subscriptions yet'
            : `No ${statusFilter} subscriptions`}
        </Text>
        <Text
          variant="bodyMedium"
          style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}
        >
          Search for movies and TV shows to subscribe
        </Text>
      </View>
    );
  };

  React.useEffect(() => {
    loadSubscriptions();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Filter Tabs */}
      <View style={[styles.filterContainer, { backgroundColor: theme.colors.surface }]}>
        {STATUS_FILTERS.map((filter) => (
          <Chip
            key={filter.key}
            mode={statusFilter === filter.key ? 'flat' : 'outlined'}
            selected={statusFilter === filter.key}
            onPress={() => handleFilterChange(filter.key)}
            style={styles.filterChip}
            selectedColor="#E50914"
            showSelectedCheck={false}
          >
            {filter.label}
          </Chip>
        ))}
      </View>

      {/* Subscription List */}
      <FlatList
        data={filteredSubscriptions}
        renderItem={renderSubscriptionCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          filteredSubscriptions.length === 0 && styles.listContentEmpty,
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
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
  subscriptionCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  poster: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  headerRow: {
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  swipeActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: 140,
  },
  swipeButton: {
    width: 70,
    height: '100%',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
});
