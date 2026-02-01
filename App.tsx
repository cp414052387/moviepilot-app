/**
 * MoviePilot Mobile App
 *
 * Main entry point for the MoviePilot mobile application.
 * A React Native app for remote media management.
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { AppNavigator } from './src/navigation/AppNavigator';

/**
 * Netflix-inspired Dark Theme (default)
 */
const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#E50914',           // Netflix red
    primaryContainer: '#B71C1C',
    secondary: '#03DAC6',
    secondaryContainer: '#018786',
    tertiary: '#03A9F4',
    tertiaryContainer: '#0277BD',
    error: '#CF6679',
    errorContainer: '#B71C1C',
    background: '#141414',        // Deep black background
    surface: '#1F1F1F',           // Card background
    surfaceVariant: '#2A2A2A',
    outline: '#404040',
    outlineVariant: '#2A2A2A',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#FFFFFF',
    onSecondary: '#000000',
    onSecondaryContainer: '#000000',
    onTertiary: '#FFFFFF',
    onTertiaryContainer: '#FFFFFF',
    onError: '#000000',
    onErrorContainer: '#FFFFFF',
    onBackground: '#FFFFFF',      // White text on dark
    onSurface: '#E0E0E0',         // Light grey text on surface
    onSurfaceVariant: '#B3B3B3',  // Medium grey for secondary text
    inverseSurface: '#E0E0E0',
    inverseOnSurface: '#141414',
    inversePrimary: '#E50914',
    elevation: {
      level0: 'transparent',
      level1: 'rgba(255, 255, 255, 0.05)',
      level2: 'rgba(255, 255, 255, 0.08)',
      level3: 'rgba(255, 255, 255, 0.11)',
      level4: 'rgba(255, 255, 255, 0.12)',
      level5: 'rgba(255, 255, 255, 0.14)',
    },
    surfaceTintColor: '#E50914',
  },
};

export default function App() {
  return (
    <PaperProvider theme={darkTheme}>
      <StatusBar style="light" />
      <AppNavigator />
    </PaperProvider>
  );
}
