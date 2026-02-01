/**
 * SubscribeDetailScreen
 *
 * Detailed view of a subscription:
 * - Full poster and backdrop
 * - Subscription status with color indicator
 * - Progress tracking for TV shows
 * - Edit/Delete/Refresh actions
 * - Episode list for TV shows
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  IconButton,
  Chip,
  useTheme,
  ProgressBar,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { getSubscription, updateSubscription, deleteSubscription, refreshSubscription } from '@/api/subscribe';
import type { Subscription } from '@/types';

interface SubscribeDetailScreenProps {
  route: {
    params: {
      subscriptionId: string;
    };
  };
  navigation: any;
}

const STATUS_COLORS: Record<Subscription['status'], string> = {
  pending: '#FFA726',
  downloading: '#42A5F5',
  completed: '#66BB6A',
  failed: '#EF5350',
};

const STATUS_LABELS: Record<Subscription['status'], string> = {
  pending: 'Pending',
  downloading: 'Downloading',
  completed: 'Completed',
  failed: 'Failed',
};

export function SubscribeDetailScreen({ route, navigation }: SubscribeDetailScreenProps) {
  const theme = useTheme();
  const { subscriptionId } = route.params;

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, [subscriptionId]);

  const loadSubscription = async () => {
    setLoading(true);
    try {
      const data = await getSubscription(subscriptionId);
      setSubscription(data);
    } catch (error) {
      console.error('Failed to load subscription:', error);
      Alert.alert('Error', 'Failed to load subscription details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshSubscription(subscriptionId);
      await loadSubscription();
    } catch (error) {
      console.error('Failed to refresh subscription:', error);
      Alert.alert('Error', 'Failed to refresh subscription');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Subscription',
      `Are you sure you want to delete "${subscription?.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await deleteSubscription(subscriptionId);
              navigation.goBack();
            } catch (error) {
              console.error('Failed to delete subscription:', error);
              Alert.alert('Error', 'Failed to delete subscription');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    // Navigate to edit screen
    Alert.alert('Edit', 'Edit functionality coming soon');
  };

  // Calculate progress for TV shows
  const calculateProgress = () => {
    if (!subscription || subscription.type === 'movie') return 0;
    if (subscription.total_episodes && subscription.current_episode) {
      return subscription.current_episode / subscription.total_episodes;
    }
    return 0;
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!subscription) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <IconButton icon="alert-circle" size={64} iconColor={theme.colors.error} />
        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Subscription not found
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.errorButton}>
          Go Back
        </Button>
      </View>
    );
  }

  const posterUrl = subscription.poster_path
    ? `https://image.tmdb.org/t/p/w342${subscription.poster_path}`
    : null;
  const backdropUrl = subscription.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${subscription.backdrop_path}`
    : null;

  const statusColor = STATUS_COLORS[subscription.status];
  const statusLabel = STATUS_LABELS[subscription.status];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Backdrop with gradient */}
        {backdropUrl && (
          <View style={styles.backdropContainer}>
            <Card.Cover source={{ uri: backdropUrl }} style={styles.backdrop} />
            <LinearGradient
              colors={['transparent', theme.colors.background]}
              style={styles.backdropGradient}
            />
          </View>
        )}

        {/* Header Card */}
        <Card style={styles.headerCard} elevation={2}>
          <Card.Content style={styles.headerContent}>
            {posterUrl && (
              <Card.Cover source={{ uri: posterUrl }} style={styles.poster} />
            )}
            <View style={styles.headerInfo}>
              <Text variant="headlineMedium">{subscription.name}</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {subscription.year} • {subscription.type === 'movie' ? 'Movie' : 'TV Show'}
              </Text>

              {/* Status */}
              <View style={styles.statusRow}>
                <Chip
                  mode="flat"
                  style={[styles.statusChip, { backgroundColor: statusColor }]}
                  textStyle={{ color: '#FFFFFF', fontWeight: '600' }}
                >
                  {statusLabel}
                </Chip>
                <Button
                  mode="outlined"
                  onPress={handleRefresh}
                  disabled={refreshing}
                  style={styles.refreshButton}
                  compact
                  icon="refresh"
                >
                  Refresh
                </Button>
              </View>

              {/* TV Show Progress */}
              {subscription.type === 'tv' && (subscription.total_episodes ?? 0) > 0 && (
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      Download Progress
                    </Text>
                    <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                      {subscription.current_episode} / {subscription.total_episodes} episodes
                    </Text>
                  </View>
                  <ProgressBar
                    progress={calculateProgress()}
                    color={statusColor}
                    style={styles.progressBar}
                  />
                  {subscription.current_season && (
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      Currently: Season {subscription.current_season}, Episode {subscription.current_episode}
                    </Text>
                  )}
                </View>
              )}

              {/* Seasons info */}
              {subscription.type === 'tv' && subscription.seasons && subscription.seasons.length > 0 && (
                <View style={styles.seasonsInfo}>
                  <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                    Subscribed Seasons: {subscription.seasons.join(', ')}
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Overview Card */}
        {subscription.overview && (
          <Card style={styles.infoCard} elevation={1}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Overview
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {subscription.overview}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Details Card */}
        <Card style={styles.infoCard} elevation={1}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Details
            </Text>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                Type:
              </Text>
              <Text style={styles.detailValue}>
                {subscription.type === 'movie' ? 'Movie' : 'TV Show'}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                Year:
              </Text>
              <Text style={styles.detailValue}>{subscription.year}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                TMDB ID:
              </Text>
              <Text style={styles.detailValue}>{subscription.tmdb_id}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                Added:
              </Text>
              <Text style={styles.detailValue}>
                {new Date(subscription.date_added).toLocaleDateString()}
              </Text>
            </View>

            {subscription.date_completed && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>
                  Completed:
                </Text>
                <Text style={styles.detailValue}>
                  {new Date(subscription.date_completed).toLocaleDateString()}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Actions Card */}
        <Card style={styles.actionsCard} elevation={1}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Actions
            </Text>

            <View style={styles.actionsGrid}>
              <Button
                mode="contained-tonal"
                icon="refresh"
                onPress={handleRefresh}
                disabled={refreshing || actionLoading}
                style={styles.actionButton}
              >
                Refresh Status
              </Button>
              <Button
                mode="contained-tonal"
                icon="pencil"
                onPress={handleEdit}
                disabled={actionLoading}
                style={styles.actionButton}
              >
                Edit
              </Button>
              <Button
                mode="contained-tonal"
                icon="delete"
                onPress={handleDelete}
                disabled={actionLoading}
                style={styles.actionButton}
              >
                Delete
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Spacer for scrolling */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorButton: {
    marginTop: 16,
  },
  scrollView: {
    flex: 1,
  },
  backdropContainer: {
    height: 200,
    position: 'relative',
  },
  backdrop: {
    width: '100%',
    height: '100%',
  },
  backdropGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  headerCard: {
    margin: 16,
    marginTop: -60,
  },
  headerContent: {
    flexDirection: 'row',
  },
  poster: {
    width: 100,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  statusChip: {
    height: 28,
  },
  refreshButton: {
    marginLeft: 12,
  },
  progressSection: {
    marginTop: 16,
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
  seasonsInfo: {
    marginTop: 12,
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontWeight: '500',
  },
  detailValue: {
    fontWeight: '400',
  },
  actionsCard: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  actionButton: {
    flex: 1,
    margin: 6,
  },
  bottomSpacer: {
    height: 24,
  },
});
