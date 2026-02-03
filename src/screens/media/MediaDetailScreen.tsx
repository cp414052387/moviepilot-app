/**
 * MediaDetailScreen
 *
 * Full media details display:
 * - Backdrop image with gradient overlay
 * - Poster thumbnail (top-right)
 * - Title, year, rating
 * - Overview (expandable)
 * - Genres chips
 * - Cast list (horizontal scroll)
 * - Quick actions bar (fixed bottom)
 * - Similar recommendations
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Share,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  IconButton,
  useTheme,
  ActivityIndicator,
  Snackbar,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { getTmdbDetails } from '@/api/media';
import type { MediaDetail, CastMember } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MediaDetailScreenProps {
  route: {
    params: {
      mediaId?: string;
      tmdbId?: number;
      type?: 'movie' | 'tv';
    };
  };
  navigation: any;
}

export function MediaDetailScreen({ route, navigation }: MediaDetailScreenProps) {
  const theme = useTheme();
  const { mediaId, tmdbId, type = 'movie' } = route.params;

  const [media, setMedia] = useState<MediaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [overviewExpanded, setOverviewExpanded] = useState(false);
  const [subscribeLoading, setSubscribeLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [favoriteUpdating, setFavoriteUpdating] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarTone, setSnackbarTone] = useState<'info' | 'success' | 'error'>('info');

  useEffect(() => {
    loadMediaDetails();
  }, [tmdbId, type]);

  const loadMediaDetails = async () => {
    if (!tmdbId) return;

    setLoading(true);
    try {
      const data = await getTmdbDetails({ tmdbId, type });
      setMedia(data);
    } catch (error) {
      console.error('Failed to load media details:', error);
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, tone: 'info' | 'success' | 'error' = 'info') => {
    setSnackbarMessage(message);
    setSnackbarTone(tone);
    setSnackbarVisible(true);
  };

  const handleSubscribe = async () => {
    if (!tmdbId || !media) {
      showSnackbar('Missing media details for subscription.', 'error');
      return;
    }

    setSubscribeLoading(true);
    try {
      navigation.navigate('AddSubscribe', {
        tmdbId,
        mediaTitle: media.title,
        mediaPoster: media.poster_path ? `https://image.tmdb.org/t/p/w342${media.poster_path}` : undefined,
        mediaType: media.type,
      });
      showSnackbar('Opening subscription form...', 'info');
    } catch (error) {
      console.error('Failed to open subscribe flow:', error);
      showSnackbar('Unable to open subscription form.', 'error');
    } finally {
      setSubscribeLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!media) {
      showSnackbar('Missing media details for download.', 'error');
      return;
    }

    setDownloadLoading(true);
    try {
      navigation.navigate('Downloads', { screen: 'AddDownload' });
      showSnackbar('Opening download form...', 'info');
    } catch (error) {
      console.error('Failed to open download flow:', error);
      showSnackbar('Unable to open download form.', 'error');
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!media) {
      showSnackbar('Missing media details to favorite.', 'error');
      return;
    }

    setFavoriteUpdating(true);
    try {
      setIsFavorite((prev) => {
        const nextValue = !prev;
        showSnackbar(
          nextValue ? 'Added to favorites.' : 'Removed from favorites.',
          'success'
        );
        return nextValue;
      });
    } catch (error) {
      console.error('Failed to update favorite:', error);
      showSnackbar('Unable to update favorites.', 'error');
    } finally {
      setFavoriteUpdating(false);
    }
  };

  const handleShare = async () => {
    if (!media || !tmdbId) {
      showSnackbar('Missing media details to share.', 'error');
      return;
    }

    setShareLoading(true);
    try {
      const shareUrl = `https://www.themoviedb.org/${media.type}/${tmdbId}`;
      const result = await Share.share({
        title: media.title,
        message: `${media.title} (${media.year || 'N/A'})\n${shareUrl}`,
        url: shareUrl,
      });

      if (result.action === Share.sharedAction) {
        showSnackbar('Share link sent.', 'success');
      } else if (result.action === Share.dismissedAction) {
        showSnackbar('Share dismissed.', 'info');
      }
    } catch (error) {
      console.error('Failed to share media:', error);
      showSnackbar('Unable to share this title.', 'error');
    } finally {
      setShareLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!media) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <IconButton icon="alert-circle" size={64} iconColor={theme.colors.error} />
        <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Failed to load media details
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.errorButton}>
          Go Back
        </Button>
      </View>
    );
  }

  const backdropUrl = media.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${media.backdrop_path}`
    : null;
  const posterUrl = media.poster_path
    ? `https://image.tmdb.org/t/p/w342${media.poster_path}`
    : null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Backdrop with Gradient Overlay */}
        {backdropUrl && (
          <View style={styles.backdropContainer}>
            <Image source={{ uri: backdropUrl }} style={styles.backdrop} />
            <LinearGradient
              colors={['transparent', 'rgba(20, 20, 20, 0.9)', theme.colors.background]}
              style={styles.backdropGradient}
            />
          </View>
        )}

        {/* Header Content */}
        <View style={styles.headerContent}>
          {/* Poster Thumbnail */}
          {posterUrl && (
            <Image source={{ uri: posterUrl }} style={styles.posterThumbnail} />
          )}

          {/* Title and Info */}
          <View style={styles.titleSection}>
            <Text variant="headlineMedium" style={{ color: '#E50914', fontWeight: 'bold' }}>
              {media.title}
            </Text>
            <View style={styles.metadataRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {media.year > 0 && `${media.year} • `}
                {media.type === 'movie' ? 'Movie' : 'TV Show'}
                {media.runtime && media.runtime > 0 && ` • ${Math.floor(media.runtime / 60)}h ${media.runtime % 60}m`}
              </Text>
            </View>
            {media.vote_average > 0 && (
              <View style={styles.ratingRow}>
                <IconButton icon="star" size={20} iconColor="#FFD700" />
                <Text variant="bodyLarge" style={{ color: '#FFD700', fontWeight: '600' }}>
                  {media.vote_average.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Overview */}
        {media.overview && (
          <Card style={styles.sectionCard} elevation={1}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Overview
              </Text>
              <TouchableOpacity onPress={() => setOverviewExpanded(!overviewExpanded)}>
                <Text
                  variant="bodyMedium"
                  style={{ color: theme.colors.onSurfaceVariant }}
                  numberOfLines={overviewExpanded ? undefined : 3}
                >
                  {media.overview}
                </Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>
        )}

        {/* Genres */}
        {media.genres && media.genres.length > 0 && (
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Genres
            </Text>
            <View style={styles.genresContainer}>
              {media.genres.map((genre, index) => (
                <Chip
                  key={index}
                  mode="flat"
                  style={styles.genreChip}
                  textStyle={{ color: theme.colors.onSurfaceVariant }}
                >
                  {genre}
                </Chip>
              ))}
            </View>
          </View>
        )}

        {/* Cast */}
        {media.credits?.cast && media.credits.cast.length > 0 && (
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Cast
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.castList}>
              {media.credits.cast.slice(0, 20).map((person: CastMember) => (
                <View key={person.id} style={styles.castItem}>
                  {person.profile_path ? (
                    <Image
                      source={{ uri: `https://image.tmdb.org/t/p/w185${person.profile_path}` }}
                      style={styles.castImage}
                    />
                  ) : (
                    <View style={[styles.castImage, styles.castImagePlaceholder]}>
                      <IconButton icon="account" size={32} iconColor={theme.colors.outline} />
                    </View>
                  )}
                  <Text variant="labelSmall" style={styles.castName} numberOfLines={1}>
                    {person.name}
                  </Text>
                  <Text
                    variant="labelSmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                    numberOfLines={1}
                  >
                    {person.character}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Similar Media */}
        {media.similar && media.similar.length > 0 && (
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Similar {media.type === 'movie' ? 'Movies' : 'TV Shows'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {media.similar.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() =>
                    navigation.push('MediaDetail', {
                      tmdbId: item.tmdb_id,
                      type: item.type,
                    })
                  }
                >
                  <View style={styles.similarItem}>
                    {item.poster_path ? (
                      <Image
                        source={{ uri: `https://image.tmdb.org/t/p/w300${item.poster_path}` }}
                        style={styles.similarPoster}
                      />
                    ) : (
                      <View style={[styles.similarPoster, styles.similarPosterPlaceholder]}>
                        <IconButton icon="image" size={32} iconColor={theme.colors.outline} />
                      </View>
                    )}
                    <Text variant="labelSmall" style={styles.similarTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Spacer for fixed bottom bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Quick Actions Bar */}
      <View style={[styles.quickActionsBar, { backgroundColor: theme.colors.surface }]}>
        <Button
          mode="contained-tonal"
          onPress={handleSubscribe}
          icon="plus"
          style={styles.actionButton}
          contentStyle={styles.actionButtonContent}
          loading={subscribeLoading}
          disabled={subscribeLoading || !media}
        >
          Subscribe
        </Button>
        <Button
          mode="contained-tonal"
          onPress={handleDownload}
          icon="download"
          style={styles.actionButton}
          contentStyle={styles.actionButtonContent}
          loading={downloadLoading}
          disabled={downloadLoading || !media}
        >
          Download
        </Button>
        <IconButton
          icon={isFavorite ? 'heart' : 'heart-outline'}
          size={24}
          onPress={handleFavorite}
          style={styles.iconButton}
          iconColor={isFavorite ? theme.colors.error : theme.colors.onSurface}
          disabled={favoriteUpdating || !media}
        />
        <IconButton
          icon="share-variant"
          size={24}
          onPress={handleShare}
          style={styles.iconButton}
          disabled={shareLoading || !media}
        />
      </View>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2500}
        style={[
          snackbarTone === 'error' && { backgroundColor: theme.colors.error },
          snackbarTone === 'success' && { backgroundColor: theme.colors.primary },
        ]}
      >
        {snackbarMessage}
      </Snackbar>
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
  scrollContent: {
    paddingBottom: 0,
  },
  backdropContainer: {
    height: 250,
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
    height: '100%',
  },
  headerContent: {
    flexDirection: 'row',
    padding: 16,
    marginTop: -100,
  },
  posterThumbnail: {
    width: 100,
    height: 150,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#1F1F1F',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  titleSection: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'flex-end',
  },
  metadataRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  section: {
    padding: 16,
  },
  sectionCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  genreChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  castList: {
    flexDirection: 'row',
  },
  castItem: {
    marginRight: 16,
    width: 80,
    alignItems: 'center',
  },
  castImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  castImagePlaceholder: {
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  castName: {
    textAlign: 'center',
    fontWeight: '600',
  },
  similarItem: {
    marginRight: 12,
    width: 100,
  },
  similarPoster: {
    width: 100,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  similarPosterPlaceholder: {
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  similarTitle: {
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 80,
  },
  quickActionsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  actionButton: {
    flex: 1,
    marginRight: 8,
  },
  actionButtonContent: {
    paddingVertical: 8,
  },
  iconButton: {
    marginLeft: 8,
  },
});
