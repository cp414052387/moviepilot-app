/**
 * Loading Skeleton Components
 *
 * Reusable skeleton loading components for showing placeholders
 * while content is loading. Follows Material Design 3 guidelines.
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

/**
 * Media Card Skeleton
 * Shimmering placeholder for media cards during loading
 */
export function MediaCardSkeleton() {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View style={[styles.poster, { backgroundColor: theme.colors.surface }]} />
      <View style={styles.info}>
        <View style={[styles.title, { backgroundColor: theme.colors.surface }]} />
        <View style={[styles.subtitle, { backgroundColor: theme.colors.surface }]} />
        <View style={[styles.rating, { backgroundColor: theme.colors.surface }]} />
      </View>
    </View>
  );
}

/**
 * Subscription Card Skeleton
 */
export function SubscriptionCardSkeleton() {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View style={styles.contentRow}>
        <View style={[styles.posterSmall, { backgroundColor: theme.colors.surface }]} />
        <View style={styles.info}>
          <View style={[styles.title, { backgroundColor: theme.colors.surface }]} />
          <View style={[styles.subtitle, { backgroundColor: theme.colors.surface }]} />
          <View style={[styles.chip, { backgroundColor: theme.colors.surface }]} />
        </View>
      </View>
    </View>
  );
}

/**
 * Download Card Skeleton
 */
export function DownloadCardSkeleton() {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View style={styles.padding}>
        <View style={[styles.title, { backgroundColor: theme.colors.surface }]} />
        <View style={[styles.progressBar, { backgroundColor: theme.colors.surface }]} />
        <View style={[styles.subtitle, { backgroundColor: theme.colors.surface }]} />
        <View style={styles.actionsRow}>
          <View style={[styles.actionButton, { backgroundColor: theme.colors.surface }]} />
          <View style={[styles.actionButton, { backgroundColor: theme.colors.surface }]} />
        </View>
      </View>
    </View>
  );
}

/**
 * List Item Skeleton
 * Generic list item placeholder
 */
export function ListItemSkeleton() {
  const theme = useTheme();

  return (
    <View style={[styles.listItem, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View style={[styles.avatar, { backgroundColor: theme.colors.surface }]} />
      <View style={styles.listInfo}>
        <View style={[styles.listTitle, { backgroundColor: theme.colors.surface }]} />
        <View style={[styles.listSubtitle, { backgroundColor: theme.colors.surface }]} />
      </View>
    </View>
  );
}

/**
 * Text Skeleton
 * Simple text line placeholder
 */
export function TextSkeleton({
  width = '100%',
  height = 16,
  style,
}: {
  width?: string | number;
  height?: number;
  style?: ViewStyle;
}) {
  const theme = useTheme();
  const widthValue = typeof width === 'number' ? width : undefined;

  return (
    <View
      style={[
        styles.textLine,
        {
          backgroundColor: theme.colors.surface,
          width: widthValue,
          height,
        },
        style,
      ]}
    />
  );
}

/**
 * Card Skeleton
 * Generic card placeholder with header and content
 */
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View style={styles.padding}>
        <View style={[styles.cardHeader, { backgroundColor: theme.colors.surface }]} />
        {Array.from({ length: lines }).map((_, index) => (
          <TextSkeleton key={index} width="100%" style={styles.textSpacing} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 8,
  },
  posterSmall: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  info: {
    padding: 12,
  },
  padding: {
    padding: 16,
  },
  title: {
    height: 20,
    borderRadius: 4,
    marginBottom: 8,
    width: '80%',
  },
  subtitle: {
    height: 14,
    borderRadius: 4,
    marginBottom: 6,
    width: '60%',
  },
  rating: {
    height: 16,
    borderRadius: 4,
    width: 40,
    marginTop: 4,
  },
  chip: {
    height: 24,
    width: 80,
    borderRadius: 12,
    marginTop: 8,
  },
  contentRow: {
    flexDirection: 'row',
    padding: 12,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginTop: 12,
    marginBottom: 8,
    width: '100%',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    height: 16,
    borderRadius: 4,
    marginBottom: 6,
    width: '70%',
  },
  listSubtitle: {
    height: 14,
    borderRadius: 4,
    width: '50%',
  },
  textLine: {
    borderRadius: 4,
  },
  textSpacing: {
    marginTop: 8,
  },
  cardHeader: {
    height: 24,
    borderRadius: 4,
    marginBottom: 16,
    width: '50%',
  },
});
