/**
 * Discover/Explore Screen
 *
 * Discovery screen with:
 * - Trending media carousel
 * - Popular media section
 * - Top rated section
 * - Upcoming releases
 * - Genre filtering
 * - Search functionality
 */

import React, { useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Text, useTheme, Chip, Searchbar, IconButton } from 'react-native-paper';
import { MediaCard } from '@/components/media';
import { useDiscover } from '@/hooks/useDiscover';
import { useNavigation } from '@/hooks/useNavigation';
import type { MediaGenre } from '@/api/media';

interface SectionProps {
  title: string;
  items: any[];
  onViewAll?: () => void;
  onPress: (mediaId: string) => void;
}

function MediaSection({ title, items, onViewAll, onPress }: SectionProps) {
  const theme = useTheme();

  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          {title}
        </Text>
        {onViewAll && (
          <TouchableOpacity onPress={onViewAll}>
            <Text variant="labelMedium" style={{ color: theme.colors.primary }}>
              View All
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      >
        {items.map((item) => (
          <MediaCard
            key={item.id}
            media={item}
            size="medium"
            onPress={() => onPress(item.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

export function DiscoverScreen() {
  const theme = useTheme();
  const { goToMediaDetail, goToSearch } = useNavigation();
  const {
    trending,
    popular,
    topRated,
    upcoming,
    genres,
    isLoading,
    isRefreshing,
    refresh,
  } = useDiscover();

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedGenre, setSelectedGenre] = React.useState<string | null>(null);
  const [mediaType, setMediaType] = React.useState<'all' | 'movie' | 'tv'>('all');

  // Fetch data on mount
  useEffect(() => {
    refresh();
  }, []);

  // Handle search
  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      goToSearch();
    }
  }, [searchQuery, goToSearch]);

  const handleMediaPress = useCallback((mediaId: string) => {
    goToMediaDetail(mediaId);
  }, [goToMediaDetail]);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search movies & TV shows..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchBar}
          iconColor={theme.colors.onSurface}
          placeholderTextColor={theme.colors.onSurfaceVariant}
          right={() => (
            <IconButton
              icon="tune"
              size={20}
              iconColor={theme.colors.onSurface}
              onPress={() => {}}
            />
          )}
        />
      </View>

      {/* Media Type Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <Chip
          selected={mediaType === 'all'}
          onPress={() => setMediaType('all')}
          style={styles.chip}
          textStyle={styles.chipText}
        >
          All
        </Chip>
        <Chip
          selected={mediaType === 'movie'}
          onPress={() => setMediaType('movie')}
          style={styles.chip}
          textStyle={styles.chipText}
        >
          Movies
        </Chip>
        <Chip
          selected={mediaType === 'tv'}
          onPress={() => setMediaType('tv')}
          style={styles.chip}
          textStyle={styles.chipText}
        >
          TV Shows
        </Chip>
      </ScrollView>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
        }
      >
        {/* Trending Section */}
        {trending.length > 0 && (
          <MediaSection
            title="Trending Now"
            items={trending.slice(0, 10)}
            onPress={handleMediaPress}
          />
        )}

        {/* Popular Section */}
        {popular.length > 0 && (
          <MediaSection
            title="Popular"
            items={popular.slice(0, 10)}
            onPress={handleMediaPress}
          />
        )}

        {/* Top Rated Section */}
        {topRated.length > 0 && (
          <MediaSection
            title="Top Rated"
            items={topRated.slice(0, 10)}
            onPress={handleMediaPress}
          />
        )}

        {/* Upcoming Section */}
        {upcoming.length > 0 && (
          <MediaSection
            title="Coming Soon"
            items={upcoming.slice(0, 10)}
            onPress={handleMediaPress}
          />
        )}

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Loading...
            </Text>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && trending.length === 0 && popular.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              No content available
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    backgroundColor: '#2A2A2A',
  },
  chipText: {
    color: '#E0E0E0',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  horizontalList: {
    paddingHorizontal: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 64,
  },
});
