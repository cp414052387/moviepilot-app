/**
 * SearchScreen
 *
 * Media search functionality:
 * - Search input with auto-focus
 * - Filter chips (Movie/TV, Year, Genre)
 * - Results grid (2 columns)
 * - Infinite scroll pagination
 * - Empty state with illustration
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Keyboard,
  RefreshControl,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Chip,
  Searchbar,
  useTheme,
  IconButton,
} from 'react-native-paper';
import { searchMedia } from '@/api/media';
import { MediaCard } from '@/components/media/MediaCard';
import type { MediaItem } from '@/types';

type MediaType = 'all' | 'movie' | 'tv';
type SortBy = 'relevance' | 'year' | 'rating';

export function SearchScreen({ navigation }: any) {
  const theme = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [mediaType, setMediaType] = useState<MediaType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('relevance');
  const [hasSearched, setHasSearched] = useState(false);

  // Perform search
  const performSearch = async (pageNum: number = 1, reset: boolean = false) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    try {
      const response = await searchMedia({
        keyword: searchQuery.trim(),
        page: pageNum,
        size: 20,
      });

      let filteredResults = response.results;

      // Filter by media type
      if (mediaType !== 'all') {
        filteredResults = filteredResults.filter(
          (item) => item.type === mediaType
        );
      }

      // Sort results
      if (sortBy === 'year') {
        filteredResults.sort((a, b) => b.year - a.year);
      } else if (sortBy === 'rating') {
        filteredResults.sort((a, b) => b.vote_average - a.vote_average);
      }

      if (reset) {
        setResults(filteredResults);
      } else {
        setResults((prev) => [...prev, ...filteredResults]);
      }

      setHasMore(pageNum < response.total_pages);
      setHasSearched(true);
      setPage(pageNum);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search submit
  const handleSearchSubmit = () => {
    Keyboard.dismiss();
    performSearch(1, true);
  };

  // Load more results
  const loadMore = () => {
    if (!loading && hasMore && hasSearched) {
      performSearch(page + 1, false);
    }
  };

  // Handle media card press
  const handleMediaPress = (media: MediaItem) => {
    navigation.navigate('MediaDetail', { mediaId: media.id, tmdbId: media.tmdb_id });
  };

  // Clear search
  const handleClear = () => {
    setSearchQuery('');
    setResults([]);
    setHasSearched(false);
    setPage(1);
    setHasMore(true);
  };

  // Render media item
  const renderMediaItem = ({ item }: { item: MediaItem }) => (
    <MediaCard media={item} onPress={() => handleMediaPress(item)} size="medium" />
  );

  // Render empty state
  const renderEmptyState = () => {
    if (loading) return null;

    if (!hasSearched) {
      return (
        <View style={styles.emptyState}>
          <IconButton icon="movie-search" size={64} iconColor={theme.colors.outline} />
          <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Search for movies and TV shows
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}
          >
            Enter a title to start searching
          </Text>
        </View>
      );
    }

    if (results.length === 0) {
      return (
        <View style={styles.emptyState}>
          <IconButton icon="movie-off" size={64} iconColor={theme.colors.outline} />
          <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            No results found
          </Text>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}
          >
            Try different keywords or filters
          </Text>
        </View>
      );
    }

    return null;
  };

  // Render list footer
  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <Text style={{ color: theme.colors.onSurfaceVariant }}>Loading...</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search movies, TV shows..."
          onChangeText={(text) => {
            setSearchQuery(text);
            if (text.length === 0) {
              handleClear();
            }
          }}
          value={searchQuery}
          onSubmitEditing={handleSearchSubmit}
          onIconPress={handleSearchSubmit}
          style={styles.searchbar}
          loading={loading}
        />
      </View>

      {/* Filter Chips */}
      <View style={styles.filtersContainer}>
        <Chip
          selected={mediaType === 'all'}
          onPress={() => {
            setMediaType('all');
            if (hasSearched) performSearch(1, true);
          }}
          style={styles.chip}
          selectedColor="#E50914"
          showSelectedCheck={false}
        >
          All
        </Chip>
        <Chip
          selected={mediaType === 'movie'}
          onPress={() => {
            setMediaType('movie');
            if (hasSearched) performSearch(1, true);
          }}
          style={styles.chip}
          selectedColor="#E50914"
          showSelectedCheck={false}
        >
          Movies
        </Chip>
        <Chip
          selected={mediaType === 'tv'}
          onPress={() => {
            setMediaType('tv');
            if (hasSearched) performSearch(1, true);
          }}
          style={styles.chip}
          selectedColor="#E50914"
          showSelectedCheck={false}
        >
          TV Shows
        </Chip>
        <Chip
          icon="sort"
          onPress={() => {
            if (sortBy === 'relevance') setSortBy('year');
            else if (sortBy === 'year') setSortBy('rating');
            else setSortBy('relevance');
            if (hasSearched) performSearch(1, true);
          }}
          style={styles.chip}
          selectedColor="#E50914"
        >
          {sortBy === 'relevance' ? 'Sort: Relevance' : sortBy === 'year' ? 'Sort: Year' : 'Sort: Rating'}
        </Chip>
      </View>

      {/* Results Grid */}
      <FlatList
        data={results}
        renderItem={renderMediaItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={[
          styles.listContent,
          results.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={loading && hasSearched}
            onRefresh={() => performSearch(1, true)}
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
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchbar: {
    elevation: 2,
    borderRadius: 24,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  listContent: {
    padding: 8,
    paddingBottom: 24,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
});
