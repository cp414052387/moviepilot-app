/**
 * AddSubscribeScreen
 *
 * Screen for adding new subscriptions:
 * - Auto-filled from media search results
 * - Season selector for TV shows
 * - Manual TMDB ID input option
 * - Username option (for multi-user support)
 * - Confirm and cancel buttons
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Checkbox,
  useTheme,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { getTmdbDetails } from '@/api/media';
import { createSubscription as createSubscribeApi } from '@/api/subscribe';
import type { MediaDetail } from '@/types';

interface AddSubscribeScreenProps {
  route: {
    params: {
      tmdbId?: number;
      mediaTitle?: string;
      mediaPoster?: string;
      mediaType?: 'movie' | 'tv';
    };
  };
  navigation: any;
}

export function AddSubscribeScreen({ route, navigation }: AddSubscribeScreenProps) {
  const theme = useTheme();
  const { tmdbId, mediaTitle, mediaPoster, mediaType = 'movie' } = route.params;

  const [media, setMedia] = useState<MediaDetail | null>(null);
  const [loading, setLoading] = useState(!!tmdbId);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedSeasons, setSelectedSeasons] = useState<number[]>([]);
  const [username, setUsername] = useState('');

  // Load media details if tmdbId provided
  useEffect(() => {
    if (tmdbId) {
      loadMediaDetails();
    }
  }, [tmdbId, mediaType]);

  const loadMediaDetails = async () => {
    setLoading(true);
    try {
      const data = await getTmdbDetails({ tmdbId: tmdbId!, type: mediaType });
      setMedia(data);
      // Auto-select all seasons for TV shows
      if (data.type === 'tv' && data.seasons) {
        setSelectedSeasons(Array.from({ length: data.seasons }, (_, i) => i + 1));
      }
    } catch (error) {
      console.error('Failed to load media details:', error);
      Alert.alert('Error', 'Failed to load media details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Toggle season selection
  const toggleSeason = (season: number) => {
    if (selectedSeasons.includes(season)) {
      setSelectedSeasons(selectedSeasons.filter((s) => s !== season));
    } else {
      setSelectedSeasons([...selectedSeasons, season]);
    }
  };

  // Select all seasons
  const selectAllSeasons = () => {
    if (!media) return;
    const totalSeasons = media.seasons || 1;
    setSelectedSeasons(Array.from({ length: totalSeasons }, (_, i) => i + 1));
  };

  // Clear all seasons
  const clearAllSeasons = () => {
    setSelectedSeasons([]);
  };

  // Validate and submit
  const handleSubmit = async () => {
    if (!tmdbId) {
      Alert.alert('Error', 'Missing TMDB ID');
      return;
    }

    if (mediaType === 'tv' && selectedSeasons.length === 0) {
      Alert.alert('Error', 'Please select at least one season');
      return;
    }

    setSubmitting(true);
    try {
      await createSubscribeApi({
        tmdb_id: tmdbId,
        type: mediaType,
        seasons: mediaType === 'tv' ? selectedSeasons : undefined,
        username: username.trim() || undefined,
      });

      Alert.alert(
        'Success',
        `Subscription created for "${media?.title || mediaTitle}"`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Failed to create subscription:', error);
      Alert.alert('Error', 'Failed to create subscription');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 16 }}>
          Loading media details...
        </Text>
      </View>
    );
  }

  const posterUrl = media?.poster_path
    ? `https://image.tmdb.org/t/p/w342${media.poster_path}`
    : mediaPoster;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Media Preview Card */}
        <Card style={styles.previewCard} elevation={2}>
          <Card.Content style={styles.previewContent}>
            {posterUrl && (
              <Card.Cover source={{ uri: posterUrl }} style={styles.poster} />
            )}
            <View style={styles.previewInfo}>
              <Text variant="titleLarge">{media?.title || mediaTitle}</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {mediaType === 'movie' ? 'Movie' : 'TV Show'}
                {media?.year && ` • ${media.year}`}
              </Text>
              {media?.overview && (
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}
                  numberOfLines={3}
                >
                  {media.overview}
                </Text>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* TV Show Season Selector */}
        {mediaType === 'tv' && media && (
          <Card style={styles.seasonCard} elevation={1}>
            <Card.Content>
              <View style={styles.seasonHeader}>
                <Text variant="titleMedium">Select Seasons</Text>
                <View style={styles.seasonActions}>
                  <Chip
                    mode="outlined"
                    onPress={selectAllSeasons}
                    style={styles.seasonActionChip}
                    compact
                  >
                    All
                  </Chip>
                  <Chip
                    mode="outlined"
                    onPress={clearAllSeasons}
                    style={styles.seasonActionChip}
                    compact
                  >
                    Clear
                  </Chip>
                </View>
              </View>

              <View style={styles.seasonsGrid}>
                {Array.from({ length: media.seasons || 1 }, (_, i) => i + 1).map((season) => (
                  <Chip
                    key={season}
                    mode={selectedSeasons.includes(season) ? 'flat' : 'outlined'}
                    selected={selectedSeasons.includes(season)}
                    onPress={() => toggleSeason(season)}
                    style={styles.seasonChip}
                    selectedColor="#E50914"
                    showSelectedCheck={false}
                  >
                    S{season}
                  </Chip>
                ))}
              </View>

              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
                {selectedSeasons.length} season{selectedSeasons.length !== 1 ? 's' : ''} selected
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Optional Username */}
        <Card style={styles.optionCard} elevation={1}>
          <Card.Content>
            <Text variant="titleMedium">Username (Optional)</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username for multi-user setup"
              mode="outlined"
              style={styles.usernameInput}
            />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Leave empty for default user
            </Text>
          </Card.Content>
        </Card>

        {/* Summary */}
        <Card style={styles.summaryCard} elevation={1}>
          <Card.Content>
            <Text variant="titleMedium">Subscription Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>Title:</Text>
              <Text style={styles.summaryValue}>{media?.title || mediaTitle}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>Type:</Text>
              <Text style={styles.summaryValue}>
                {mediaType === 'movie' ? 'Movie' : 'TV Show'}
              </Text>
            </View>
            {mediaType === 'tv' && (
              <View style={styles.summaryRow}>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>Seasons:</Text>
                <Text style={styles.summaryValue}>
                  {selectedSeasons.length > 0 ? selectedSeasons.join(', ') : 'None'}
                </Text>
              </View>
            )}
            {username.trim() && (
              <View style={styles.summaryRow}>
                <Text style={{ color: theme.colors.onSurfaceVariant }}>Username:</Text>
                <Text style={styles.summaryValue}>{username.trim()}</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionBar, { backgroundColor: theme.colors.surface }]}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          disabled={submitting}
          style={styles.actionButton}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting}
          style={styles.actionButton}
          buttonColor="#E50914"
        >
          Subscribe
        </Button>
      </View>
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  previewCard: {
    marginBottom: 16,
  },
  previewContent: {
    flexDirection: 'row',
  },
  poster: {
    width: 100,
    height: 150,
    borderRadius: 8,
  },
  previewInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  seasonCard: {
    marginBottom: 16,
  },
  seasonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seasonActions: {
    flexDirection: 'row',
  },
  seasonActionChip: {
    height: 28,
    marginLeft: 8,
  },
  seasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  seasonChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  optionCard: {
    marginBottom: 16,
  },
  usernameInput: {
    marginTop: 12,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryValue: {
    fontWeight: '500',
  },
  actionBar: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});
