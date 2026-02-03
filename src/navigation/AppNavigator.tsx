/**
 * App Navigation
 *
 * Handles navigation flow with smooth page transitions:
 * - Authentication flow (login -> app)
 * - Bottom tab navigation (5 tabs)
 * - Stack navigation for screens within tabs
 * - Custom transitions for different screen types
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Icon, Text, useTheme } from 'react-native-paper';
import { useAuthStore } from '@/stores/authStore';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { SearchScreen } from '@/screens/media/SearchScreen';
import { MediaDetailScreen } from '@/screens/media/MediaDetailScreen';
import { DiscoverScreen } from '@/screens/media/DiscoverScreen';
import { SubscribeListScreen } from '@/screens/subscribe/SubscribeListScreen';
import { AddSubscribeScreen } from '@/screens/subscribe/AddSubscribeScreen';
import { SubscribeDetailScreen } from '@/screens/subscribe/SubscribeDetailScreen';
import { DownloadListScreen } from '@/screens/download/DownloadListScreen';
import { AddDownloadScreen } from '@/screens/download/AddDownloadScreen';
import { MessageListScreen } from '@/screens/message/MessageListScreen';
import { ChatScreen } from '@/screens/message/ChatScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { HistoryScreen } from '@/screens/history';
import { MediaServerScreen } from '@/screens/mediaServer';
import { PluginScreen } from '@/screens/plugin';
import { SiteScreen } from '@/screens/site';
import {
  defaultScreenOptions,
  formScreenOptions,
  modalScreenOptions,
  screenTransitionPresets,
} from './navigationTheme';

// Tab Navigator
const Tab = createBottomTabNavigator();

// Stack Navigator
const Stack = createNativeStackNavigator();

/**
 * Media Tab Stack
 * - Discover screen: default slide transition
 * - Search screen: default slide transition
 * - MediaDetail screen: default slide transition
 * - AddSubscribe screen: fade transition (form)
 */
function MediaStack() {
  return (
    <Stack.Navigator
      screenOptions={defaultScreenOptions}
    >
      <Stack.Screen
        name="Discover"
        component={DiscoverScreen}
        options={screenTransitionPresets.slide}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={screenTransitionPresets.slide}
      />
      <Stack.Screen
        name="MediaDetail"
        component={MediaDetailScreen as any}
        options={screenTransitionPresets.slide}
      />
      <Stack.Screen
        name="AddSubscribe"
        component={AddSubscribeScreen as any}
        options={formScreenOptions}
      />
    </Stack.Navigator>
  );
}

/**
 * Subscriptions Tab Stack
 * - SubscribeList screen: default slide transition
 * - SubscribeDetail screen: default slide transition
 * - AddSubscribe screen: fade transition (form)
 */
function SubscriptionStack() {
  return (
    <Stack.Navigator
      screenOptions={defaultScreenOptions}
    >
      <Stack.Screen
        name="SubscribeList"
        component={SubscribeListScreen}
        options={screenTransitionPresets.slide}
      />
      <Stack.Screen
        name="SubscribeDetail"
        component={SubscribeDetailScreen as any}
        options={screenTransitionPresets.slide}
      />
      <Stack.Screen
        name="AddSubscribe"
        component={AddSubscribeScreen as any}
        options={formScreenOptions}
      />
    </Stack.Navigator>
  );
}

/**
 * Downloads Tab Stack
 * - DownloadList screen: default slide transition
 * - AddDownload screen: fade transition (form)
 */
function DownloadsStack() {
  return (
    <Stack.Navigator
      screenOptions={defaultScreenOptions}
    >
      <Stack.Screen
        name="DownloadList"
        component={DownloadListScreen}
        options={screenTransitionPresets.slide}
      />
      <Stack.Screen
        name="AddDownload"
        component={AddDownloadScreen}
        options={formScreenOptions}
      />
    </Stack.Navigator>
  );
}

/**
 * Messages Tab Stack
 * - MessageList screen: default slide transition
 * - Chat screen: modal transition (slides from bottom)
 */
function MessagesStack() {
  return (
    <Stack.Navigator
      screenOptions={defaultScreenOptions}
    >
      <Stack.Screen
        name="MessageList"
        component={MessageListScreen}
        options={screenTransitionPresets.slide}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={modalScreenOptions}
      />
    </Stack.Navigator>
  );
}

/**
 * Settings Tab Stack
 * - Settings screen: default slide transition
 * - Extended feature screens with slide transitions
 */
function SettingsStack() {
  return (
    <Stack.Navigator
      screenOptions={defaultScreenOptions}
    >
      <Stack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={screenTransitionPresets.slide}
      />
      <Stack.Screen
        name="History"
        component={HistoryScreen}
        options={screenTransitionPresets.slide}
      />
      <Stack.Screen
        name="MediaServer"
        component={MediaServerScreen}
        options={screenTransitionPresets.slide}
      />
      <Stack.Screen
        name="Plugins"
        component={PluginScreen}
        options={screenTransitionPresets.slide}
      />
      <Stack.Screen
        name="Sites"
        component={SiteScreen}
        options={screenTransitionPresets.slide}
      />
    </Stack.Navigator>
  );
}

/**
 * Main App Tabs
 * Uses fade transition for smooth tab switching
 */
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#E50914',
        tabBarInactiveTintColor: '#B3B3B3',
        tabBarStyle: {
          backgroundColor: '#1F1F1F',
          borderTopColor: '#2A2A2A',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon source="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Media"
        component={MediaStack}
        options={{
          tabBarLabel: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <Icon source="compass" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Subscriptions"
        component={SubscriptionStack}
        options={{
          tabBarLabel: 'Subscriptions',
          tabBarIcon: ({ color, size }) => (
            <Icon source="subscription" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Downloads"
        component={DownloadsStack}
        options={{
          tabBarLabel: 'Downloads',
          tabBarIcon: ({ color, size }) => (
            <Icon source="download" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Icon source="cog" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Auth Stack - wraps the login screen
 * Uses fade transition for login flow
 */
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={defaultScreenOptions}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={screenTransitionPresets.fade}
      />
    </Stack.Navigator>
  );
}

/**
 * Main Navigation Container
 * Routes between Auth and App based on authentication state
 * Applies theme integration
 */
export function AppNavigator() {
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore();
  const theme = useTheme();

  useEffect(() => {
    // Check auth status on mount
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="Loading application"
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          variant="bodyMedium"
          style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}
        >
          Loading your experience...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    textAlign: 'center',
  },
});
