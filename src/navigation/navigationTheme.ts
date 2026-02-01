/**
 * Navigation Theme
 *
 * Centralized navigation configuration with smooth transitions,
 * consistent styling, and platform-specific adjustments.
 */

import type { Theme } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import { Platform } from 'react-native';

/**
 * Screen options for native stack navigators
 * Provides consistent styling across all stacks with smooth transitions
 */
export const defaultScreenOptions = {
  headerShown: false,
  contentStyle: {
    backgroundColor: '#141414',
  },
  // Native stack transitions
  gestureEnabled: true,
  gestureDirection: 'horizontal' as const,
  animation: 'default' as const,
  // Smooth animation settings
  presentation: 'card' as const,
  animationTypeForReplace: 'push' as const,
};

/**
 * Screen options for modal presentations
 * Uses slide from bottom animation for modals
 */
export const modalScreenOptions = {
  headerShown: false,
  contentStyle: {
    backgroundColor: '#141414',
  },
  gestureEnabled: true,
  gestureDirection: 'vertical' as const,
  presentation: 'modal' as const,
  animation: 'slide_from_bottom' as const,
};

/**
 * Screen options for form screens
 * Uses fade transition for a smoother experience
 */
export const formScreenOptions = {
  headerShown: false,
  contentStyle: {
    backgroundColor: '#141414',
  },
  gestureEnabled: true,
  presentation: 'card' as const,
  animation: 'fade' as const,
};

/**
 * Navigation Container Theme
 * Integrates with app theme
 */
export function useNavigationTheme(): Theme {
  const theme = useTheme();

  return {
    dark: true,
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.onSurface,
      border: theme.colors.outline,
      notification: theme.colors.primary,
    },
  };
}

/**
 * Platform-specific transition configurations
 * Customizes transitions based on platform for best UX
 */
export const platformConfig = {
  // iOS specific configurations
  ios: {
    stackAnimation: 'default' as const,
    modalAnimation: 'slide_from_bottom' as const,
    // iOS prefers smooth slide transitions
    transitionSpec: {
      open: { animation: 'timing', config: { duration: 350 } },
      close: { animation: 'timing', config: { duration: 300 } },
    },
  },
  // Android specific configurations
  android: {
    stackAnimation: 'fade_from_bottom' as const,
    modalAnimation: 'slide_from_bottom' as const,
    // Android uses faster fade transitions
    transitionSpec: {
      open: { animation: 'timing', config: { duration: 300 } },
      close: { animation: 'timing', config: { duration: 250 } },
    },
  },
};

/**
 * Get platform-specific screen options
 */
export function getPlatformScreenOptions(modal = false) {
  const platform = Platform.OS;
  const config = platform === 'ios' ? platformConfig.ios : platformConfig.android;

  return {
    ...defaultScreenOptions,
    animation: modal ? config.modalAnimation : config.stackAnimation,
  };
}

/**
 * Transition type options for different screen patterns
 */
export const transitionTypes = {
  // Standard screen-to-screen navigation
  default: 'default',

  // Modal presentation (forms, dialogs)
  modal: 'slide_from_bottom',

  // For replacing screens (no back button)
  replace: 'fade',

  // For detail screens (pushes new screen)
  push: 'default',

  // For tab switching
  tabSwitch: 'fade',
} as const;

/**
 * Custom transition configuration object
 * Can be used to apply custom transitions to specific screens
 */
export const customTransitionConfig = {
  // Duration in milliseconds
  duration: 300,

  // Easing function (React Native Reanimated)
  easing: 'easeInOut',

  // Whether to use native driver
  useNativeDriver: true,
};

/**
 * Screen transition presets for common patterns
 */
export const screenTransitionPresets = {
  /**
   * Default slide transition for most screens
   * Use for: MediaDetail, SubscribeDetail, etc.
   */
  slide: {
    ...defaultScreenOptions,
    animation: 'default' as const,
  },

  /**
   * Fade transition for forms and overlays
   * Use for: AddSubscribe, AddDownload, etc.
   */
  fade: {
    ...defaultScreenOptions,
    animation: 'fade' as const,
  },

  /**
   * Modal transition for bottom sheets and modals
   * Use for: Settings, Filters, etc.
   */
  modal: {
    ...modalScreenOptions,
    animation: 'slide_from_bottom' as const,
  },

  /**
   * No animation for instant transitions
   * Use for: Tab switching, instant screen loads
   */
  none: {
    ...defaultScreenOptions,
    animation: 'none' as const,
  },
};
