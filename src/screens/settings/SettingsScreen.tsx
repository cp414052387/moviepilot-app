/**
 * Settings Screen
 *
 * App settings and configuration:
 * - User profile info
 * - Server configuration
 * - Theme toggle (dark/light)
 * - Notification preferences with WebPush subscription
 * - About/Version info
 * - Logout button
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Divider,
  Switch,
  List,
  IconButton,
  useTheme,
  Dialog,
  Portal,
  Button,
  TextInput,
} from 'react-native-paper';
import { useAuthStore } from '@/stores/authStore';
import { setServerUrl, getServerUrl } from '@/api/client';
import { useNotifications } from '@/hooks/useNotifications';

type SettingsItem = {
  title: string;
  description?: string;
  icon: string;
  type: 'toggle' | 'navigation' | 'action' | 'info';
  value?: boolean;
  onPress?: () => void;
  loading?: boolean;
};

export function SettingsScreen({ navigation }: any) {
  const theme = useTheme();
  const { user, logout } = useAuthStore();

  const handleNavigateToHistory = () => navigation.navigate('History');
  const handleNavigateToMediaServer = () => navigation.navigate('MediaServer');
  const handleNavigateToPlugins = () => navigation.navigate('Plugins');
  const handleNavigateToSites = () => navigation.navigate('Sites');

  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [serverDialogVisible, setServerDialogVisible] = useState(false);
  const [serverUrl, setServerUrlInput] = useState('');
  const [aboutDialogVisible, setAboutDialogVisible] = useState(false);

  // Use notifications hook
  const {
    isSupported: pushSupported,
    permissionStatus: pushPermissionStatus,
    isSubscribed: pushSubscribed,
    isLoading: pushLoading,
    error: pushError,
    requestPermissions,
    subscribe: subscribePush,
    unsubscribe: unsubscribePush,
  } = useNotifications();

  // Handle push notification toggle
  const handlePushNotificationToggle = async () => {
    if (!pushSupported) {
      Alert.alert(
        'Not Supported',
        'Push notifications are not supported on this device.'
      );
      return;
    }

    if (pushSubscribed) {
      // Unsubscribe
      await unsubscribePush();
      Alert.alert('Success', 'Push notifications disabled');
    } else {
      // Subscribe
      if (pushPermissionStatus !== 'granted') {
        const granted = await requestPermissions();
        if (!granted) {
          Alert.alert(
            'Permission Required',
            'Please enable notification permissions in system settings.'
          );
          return;
        }
      }

      await subscribePush();

      if (pushError) {
        Alert.alert('Error', pushError);
      } else {
        Alert.alert('Success', 'Push notifications enabled');
      }
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const handleServerConfig = async () => {
    const currentUrl = await getServerUrl();
    setServerUrlInput(currentUrl || 'https://api.movie-pilot.org');
    setServerDialogVisible(true);
  };

  const handleSaveServer = async () => {
    try {
      await setServerUrl(serverUrl);
      setServerDialogVisible(false);
      Alert.alert('Success', 'Server URL updated. Please restart the app.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update server URL');
    }
  };

  const getPushNotificationDescription = () => {
    if (!pushSupported) {
      return 'Not supported on this device';
    }
    if (pushPermissionStatus === 'granted') {
      return pushSubscribed ? 'Enabled' : 'Disabled';
    }
    return 'Permission required';
  };

  const settingsSections: Array<{ title: string; items: SettingsItem[] }> = [
    {
      title: 'Account',
      items: [
        {
          title: 'Profile',
          description: user?.name || user?.username || 'User',
          icon: 'account',
          type: 'info',
        },
        {
          title: 'Server Configuration',
          description: 'Change MoviePilot server URL',
          icon: 'server',
          type: 'navigation',
          onPress: handleServerConfig,
        },
      ],
    },
    {
      title: 'Features',
      items: [
        {
          title: 'History',
          description: 'View activity history',
          icon: 'history',
          type: 'navigation',
          onPress: handleNavigateToHistory,
        },
        {
          title: 'Media Servers',
          description: 'Manage connected media servers',
          icon: 'server-network',
          type: 'navigation',
          onPress: handleNavigateToMediaServer,
        },
        {
          title: 'Plugins',
          description: 'Manage installed plugins',
          icon: 'puzzle',
          type: 'navigation',
          onPress: handleNavigateToPlugins,
        },
        {
          title: 'Sites',
          description: 'Manage download sites',
          icon: 'web',
          type: 'navigation',
          onPress: handleNavigateToSites,
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          title: 'Push Notifications',
          description: getPushNotificationDescription(),
          icon: 'bell',
          type: 'toggle',
          value: pushSubscribed,
          onPress: handlePushNotificationToggle,
          loading: pushLoading,
        },
        {
          title: 'Auto Refresh',
          description: 'Automatically refresh subscriptions',
          icon: 'refresh',
          type: 'toggle',
          value: autoRefreshEnabled,
          onPress: () => setAutoRefreshEnabled(!autoRefreshEnabled),
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          title: 'Version',
          description: 'MoviePilot Mobile v0.1.0',
          icon: 'information',
          type: 'info',
        },
        {
          title: 'About MoviePilot',
          description: 'Learn more about the project',
          icon: 'heart',
          type: 'navigation',
          onPress: () => setAboutDialogVisible(true),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          title: 'Help & Documentation',
          description: 'Get help with the app',
          icon: 'help-circle',
          type: 'navigation',
          onPress: () => Alert.alert('Coming Soon', 'Documentation will be available soon'),
        },
        {
          title: 'Report a Bug',
          description: 'Submit a bug report',
          icon: 'bug',
          type: 'navigation',
          onPress: () => Alert.alert('Coming Soon', 'Bug reporting will be available soon'),
        },
      ],
    },
  ];

  const renderSettingsItem = (item: SettingsItem) => {
    const isLast = item === settingsSections[settingsSections.length - 1].items[
      settingsSections[settingsSections.length - 1].items.length - 1
    ];

    if (item.type === 'toggle') {
      return (
        <List.Item
          key={item.title}
          title={item.title}
          description={item.description}
          left={(props) => <List.Icon {...props} icon={item.icon} />}
          right={() =>
            item.loading ? (
              <List.Icon {...({} as any)} icon="loading" />
            ) : (
              <Switch
                value={item.value}
                onValueChange={item.onPress}
                color={theme.colors.primary}
              />
            )
          }
          onPress={item.onPress}
        />
      );
    }

    return (
      <List.Item
        key={item.title}
        title={item.title}
        description={item.description}
        left={(props) => <List.Icon {...props} icon={item.icon} />}
        right={item.type === 'navigation' ? (props) => <List.Icon {...props} icon="chevron-right" /> : undefined}
        onPress={item.onPress}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text variant="titleLarge">Settings</Text>
        {user && (
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {user.name || user.username}
          </Text>
        )}
      </View>

      <ScrollView>
        {settingsSections.map((section, sectionIndex) => (
          <View key={section.title}>
            <List.Section>
              {section.items.map((item) => renderSettingsItem(item))}
            </List.Section>
            {sectionIndex < settingsSections.length - 1 && <Divider />}
          </View>
        ))}

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <Button
            mode="outlined"
            onPress={handleLogout}
            icon="logout"
            style={styles.logoutButton}
            textColor={theme.colors.error}
          >
            Sign Out
          </Button>
        </View>
      </ScrollView>

      {/* Server URL Dialog */}
      <Portal>
        <Dialog visible={serverDialogVisible} onDismiss={() => setServerDialogVisible(false)}>
          <Dialog.Title>Server Configuration</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 12 }}>
              Enter your MoviePilot server URL:
            </Text>
            <TextInput
              value={serverUrl}
              onChangeText={setServerUrlInput}
              mode="outlined"
              dense
              style={styles.dialogInput}
              placeholder="https://api.movie-pilot.org"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setServerDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleSaveServer}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* About Dialog */}
      <Portal>
        <Dialog visible={aboutDialogVisible} onDismiss={() => setAboutDialogVisible(false)}>
          <Dialog.Title>About MoviePilot</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
              MoviePilot is a powerful media management system that helps you organize and enjoy your movie and TV show collection.
            </Text>
            <Text variant="bodyMedium" style={{ marginBottom: 8 }}>
              Features:
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 16 }}>
              • Automatic media scraping and organization
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 16 }}>
              • Subscription management for TV shows
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 16 }}>
              • Download management with real-time progress
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginLeft: 16 }}>
              • Smart notifications and chat interface
            </Text>
            <Divider style={{ marginVertical: 16 }} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              GitHub: github.com/jxxghp/MoviePilot
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Version: 0.1.0
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAboutDialogVisible(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  logoutSection: {
    padding: 16,
    marginTop: 8,
  },
  logoutButton: {
    borderColor: '#EF5350',
  },
  dialogInput: {
    backgroundColor: 'transparent',
  },
});
