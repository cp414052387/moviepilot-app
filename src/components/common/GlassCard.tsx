/**
 * GlassCard Component
 *
 * A glassmorphism-style card component with:
 * - Semi-transparent background with blur effect
 * - Subtle border and shadow
 * - Configurable blur intensity and opacity
 * - Perfect for overlay cards and modern UI
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-paper';

export interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  blurIntensity?: number; // 0-100, default 10
  opacity?: number; // 0-1, default 0.6
  tint?: 'light' | 'dark' | 'primary';
  borderRadius?: number;
  borderWidth?: number;
  onPress?: () => void;
}

export function GlassCard({
  children,
  style,
  blurIntensity = 10,
  opacity = 0.6,
  tint = 'dark',
  borderRadius = 12,
  borderWidth = 1,
  onPress,
}: GlassCardProps) {
  const theme = useTheme();

  // Determine background color based on tint
  const getBackgroundColor = () => {
    const baseOpacity = opacity;
    switch (tint) {
      case 'light':
        return `rgba(255, 255, 255, ${baseOpacity * 0.1})`;
      case 'primary':
        return `rgba(229, 9, 20, ${baseOpacity * 0.15})`;
      case 'dark':
      default:
        return `rgba(30, 30, 30, ${baseOpacity * 0.8})`;
    }
  };

  // Determine border color
  const getBorderColor = () => {
    switch (tint) {
      case 'light':
        return 'rgba(255, 255, 255, 0.2)';
      case 'primary':
        return 'rgba(229, 9, 20, 0.3)';
      case 'dark':
      default:
        return 'rgba(255, 255, 255, 0.1)';
    }
  };

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <>
      {onPress ? (
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.7}
          style={[
            styles.glassCard,
            {
              backgroundColor: getBackgroundColor(),
              borderColor: getBorderColor(),
              borderRadius,
              borderWidth,
            },
            style,
          ]}
        >
          {children}
        </TouchableOpacity>
      ) : (
        <View
          style={[
            styles.glassCard,
            {
              backgroundColor: getBackgroundColor(),
              borderColor: getBorderColor(),
              borderRadius,
              borderWidth,
            },
            style,
          ]}
        >
          {children}
        </View>
      )}
    </>
  );
}

/**
 * GlassBadge Component
 *
 * Small glassmorphism badge for labels and indicators
 */
export interface GlassBadgeProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
}

export function GlassBadge({
  children,
  style,
  variant = 'primary',
  size = 'medium',
}: GlassBadgeProps) {
  const theme = useTheme();

  const variantColors = {
    primary: 'rgba(229, 9, 20, 0.25)',
    secondary: 'rgba(3, 218, 198, 0.25)',
    success: 'rgba(76, 175, 80, 0.25)',
    warning: 'rgba(255, 152, 0, 0.25)',
    error: 'rgba(207, 102, 121, 0.25)',
  };

  const borderColors = {
    primary: 'rgba(229, 9, 20, 0.4)',
    secondary: 'rgba(3, 218, 198, 0.4)',
    success: 'rgba(76, 175, 80, 0.4)',
    warning: 'rgba(255, 152, 0, 0.4)',
    error: 'rgba(207, 102, 121, 0.4)',
  };

  const sizes = {
    small: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    medium: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    large: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  };

  return (
    <View
      style={[
        styles.glassBadge,
        {
          backgroundColor: variantColors[variant],
          borderColor: borderColors[variant],
          ...sizes[size],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/**
 * GlassPanel Component
 *
 * Larger glassmorphism panel for sections and containers
 */
export interface GlassPanelProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: 'low' | 'medium' | 'high';
}

export function GlassPanel({
  children,
  style,
  elevation = 'medium',
}: GlassPanelProps) {
  const shadowStyles: Record<string, ViewStyle> = {
    low: styles.shadowLow,
    medium: styles.shadowMedium,
    high: styles.shadowHigh,
  };

  return (
    <GlassCard
      style={StyleSheet.flatten([
        styles.glassPanel,
        shadowStyles[elevation],
        style,
      ])}
      blurIntensity={15}
      opacity={0.7}
      borderRadius={16}
    >
      {children}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  glassCard: {
    // Glassmorphism effect relies on:
    // - Semi-transparent background
    // - Subtle border
    // - Shadow (applied via elevation prop or separate shadow styles)
    overflow: 'hidden',
  },
  glassBadge: {
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  glassPanel: {
    padding: 16,
    borderWidth: 1,
  },
  // Shadow effects for different elevation levels
  shadowLow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  shadowMedium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  shadowHigh: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
});
