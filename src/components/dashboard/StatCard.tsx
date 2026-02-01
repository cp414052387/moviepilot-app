/**
 * Stat Card Component
 *
 * Displays a statistic with:
 * - Icon
 * - Label
 * - Value
 * - Optional subtext/progress
 * - Trend indicator
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, useTheme, IconButton, ProgressBar } from 'react-native-paper';
import { GlassPanel } from '@/components/common';

export interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  subtext?: string;
  progress?: number; // 0-100
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
  onPress?: () => void;
  glassmorphism?: boolean;
}

export function StatCard({
  icon,
  label,
  value,
  subtext,
  progress,
  trend,
  trendValue,
  color,
  onPress,
  glassmorphism = false,
}: StatCardProps) {
  const theme = useTheme();

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      case 'neutral':
      default:
        return 'trending-neutral';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return '#4CAF50';
      case 'down':
        return '#F44336';
      case 'neutral':
      default:
        return theme.colors.onSurfaceVariant;
    }
  };

  const CardWrapper = glassmorphism ? GlassPanel : Card;

  return (
    <CardWrapper
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: color ? `${color}20` : theme.colors.primaryContainer }]}>
            <IconButton
              icon={icon}
              size={20}
              iconColor={color || theme.colors.primary}
              style={styles.icon}
            />
          </View>
          {trend && trendValue && (
            <View style={styles.trendContainer}>
              <IconButton
                icon={getTrendIcon()}
                size={16}
                iconColor={getTrendColor()}
                style={styles.trendIcon}
              />
              <Text variant="labelSmall" style={{ color: getTrendColor() }}>
                {trendValue}
              </Text>
            </View>
          )}
        </View>

        <Text variant="headlineSmall" style={styles.value}>
          {value}
        </Text>

        <Text variant="bodySmall" style={[styles.label, { color: theme.colors.onSurfaceVariant }]}>
          {label}
        </Text>

        {subtext && (
          <Text variant="labelSmall" style={[styles.subtext, { color: theme.colors.onSurfaceVariant }]}>
            {subtext}
          </Text>
        )}

        {progress !== undefined && (
          <ProgressBar
            progress={progress / 100}
            color={color || theme.colors.primary}
            style={styles.progressBar}
          />
        )}
      </View>
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  icon: {
    margin: 0,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    margin: 0,
    marginRight: -4,
  },
  value: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  label: {
    marginBottom: 2,
  },
  subtext: {
    marginTop: 4,
  },
  progressBar: {
    marginTop: 12,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

/**
 * Storage Stat Card Component
 *
 * Specialized card for storage statistics
 */
export interface StorageStatCardProps {
  total: number;
  used: number;
  free: number;
  path: string;
  glassmorphism?: boolean;
}

export function StorageStatCard({
  total,
  used,
  free,
  path,
  glassmorphism = false,
}: StorageStatCardProps) {
  const usagePercent = (used / total) * 100;

  return (
    <StatCard
      icon="harddisk"
      label="Storage"
      value={`${usagePercent.toFixed(1)}%`}
      subtext={path}
      progress={usagePercent}
      color={usagePercent > 90 ? '#F44336' : usagePercent > 70 ? '#FF9800' : '#4CAF50'}
      glassmorphism={glassmorphism}
    />
  );
}

/**
 * Download Stat Card Component
 *
 * Specialized card for download statistics
 */
export interface DownloadStatCardProps {
  active: number;
  completed: number;
  speed: number;
  glassmorphism?: boolean;
}

export function DownloadStatCard({
  active,
  completed,
  speed,
  glassmorphism = false,
}: DownloadStatCardProps) {
  return (
    <StatCard
      icon="download"
      label="Downloads"
      value={active.toString()}
      subtext={`${completed} completed`}
      trend="neutral"
      trendValue={speed > 0 ? `${(speed / 1024 / 1024).toFixed(1)} MB/s` : 'Idle'}
      glassmorphism={glassmorphism}
    />
  );
}
