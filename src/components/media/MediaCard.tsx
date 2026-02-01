/**
 * MediaCard Component
 *
 * Displays media item in a card format with:
 * - Poster image (2:3 aspect ratio)
 * - Title (truncated)
 * - Year badge
 * - Rating star with score
 * - Pressable with ripple effect
 * - Optional glassmorphism effect
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text, Card, useTheme, IconButton } from 'react-native-paper';
import type { MediaItem } from '@/types';

interface MediaCardProps {
  media: MediaItem;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  showRating?: boolean;
  glassmorphism?: boolean; // Enable glassmorphism effect
}

export function MediaCard({
  media,
  onPress,
  size = 'medium',
  showRating = true,
  glassmorphism = false,
}: MediaCardProps) {
  const theme = useTheme();

  const dimensions = {
    small: { width: 100, height: 150 },
    medium: { width: 120, height: 180 },
    large: { width: 140, height: 210 },
  };

  const { width, height } = dimensions[size];
  const posterUrl = media.poster_path
    ? `https://image.tmdb.org/t/p/w300${media.poster_path}`
    : 'https://via.placeholder.com/300x450?text=No+Image';

  // Glassmorphism style
  const glassStyle = glassmorphism
    ? {
        backgroundColor: 'rgba(42, 42, 42, 0.6)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
      }
    : {};

  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      <Card
        style={[
          styles.card,
          { width, backgroundColor: theme.colors.surfaceVariant },
          glassStyle,
        ]}
        elevation={glassmorphism ? 0 : 2}
      >
        <View style={[styles.posterContainer, { height }]}>
          {/* Poster Image */}
          <Card.Cover
            source={{ uri: posterUrl }}
            style={[styles.poster, { width, height }]}
            resizeMode="cover"
          />

          {/* Rating Badge with glassmorphism */}
          {showRating && media.vote_average > 0 && (
            <View
              style={[
                styles.ratingBadge,
                glassmorphism
                  ? styles.glassBadge
                  : { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
              ]}
            >
              <IconButton
                icon="star"
                size={12}
                iconColor="#FFD700"
                style={styles.starIcon}
              />
              <Text variant="labelSmall" style={styles.ratingText}>
                {media.vote_average.toFixed(1)}
              </Text>
            </View>
          )}

          {/* Year Badge with glassmorphism */}
          {media.year > 0 && (
            <View
              style={[
                styles.yearBadge,
                glassmorphism
                  ? { ...styles.glassBadge, backgroundColor: 'rgba(229, 9, 20, 0.25)', borderColor: 'rgba(229, 9, 20, 0.4)' }
                  : { backgroundColor: '#E50914' },
              ]}
            >
              <Text variant="labelSmall" style={styles.yearText}>
                {media.year}
              </Text>
            </View>
          )}

          {/* Type Badge with glassmorphism */}
          <View
            style={[
              styles.typeBadge,
              glassmorphism
                ? styles.glassBadge
                : { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text variant="labelSmall" style={styles.typeText}>
              {media.type === 'movie' ? 'Movie' : 'TV'}
            </Text>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text
            variant="labelMedium"
            numberOfLines={2}
            style={{ color: theme.colors.onSurface }}
          >
            {media.title}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    marginHorizontal: 6,
    marginVertical: 8,
  },
  card: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  posterContainer: {
    position: 'relative',
  },
  poster: {
    backgroundColor: '#2A2A2A',
  },
  ratingBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  starIcon: {
    margin: 0,
    marginRight: -4,
  },
  ratingText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  yearBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  yearText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  typeBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  titleContainer: {
    padding: 8,
    minHeight: 40,
  },
  // Glassmorphism badge style
  glassBadge: {
    backgroundColor: 'rgba(30, 30, 30, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});
