/**
 * Home Screen
 *
 * Main dashboard screen showing:
 * - Welcome message with username
 * - Quick action buttons
 * - System statistics dashboard
 * - Recent activity
 * - Side drawer navigation
 */

import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { Text, Card, Button, useTheme, IconButton } from 'react-native-paper';
import { useAuthStore } from '@/stores/authStore';
import { DrawerButton, SideDrawer, DrawerSection } from '@/components/navigation';
import { useNavigation } from '@/hooks/useNavigation';
import { useDashboard } from '@/hooks/useDashboard';
import { StatCard, StorageStatCard, DownloadStatCard, ActivityList } from '@/components/dashboard';

interface QuickAction {
  icon: string;
  label: string;
  action: () => void;
}

export function HomeScreen() {
  const theme = useTheme();
  const { user, logout } = useAuthStore();
  const { drawer, goToMedia, goToSearch, goToAddSubscribe, goToAddDownload, goToMessages, goToSettings } = useNavigation();
  const {
    status,
    stats,
    recentActivity,
    isLoading,
    isRefreshing,
    error,
    fetchDashboard,
    refresh,
    formatBytes,
    formatSpeed,
    formatUptime,
  } = useDashboard();

  // Fetch dashboard data on mount
  useEffect(() => {
    fetchDashboard();
  }, []);

  // Define drawer sections with navigation actions
  const drawerSections: DrawerSection[] = [
    {
      title: 'Browse',
      items: [
        {
          id: 'media',
          label: 'Media Library',
          icon: 'movie',
          onPress: goToMedia,
        },
        {
          id: 'search',
          label: 'Search',
          icon: 'magnify',
          onPress: goToSearch,
        },
      ],
    },
    {
      title: 'Actions',
      items: [
        {
          id: 'add-subscribe',
          label: 'Add Subscription',
          icon: 'plus',
          onPress: goToAddSubscribe,
        },
        {
          id: 'add-download',
          label: 'Add Download',
          icon: 'download',
          onPress: goToAddDownload,
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'messages',
          label: 'Messages',
          icon: 'message',
          onPress: goToMessages,
          badge: stats?.messages.unread || 0,
        },
        {
          id: 'settings',
          label: 'Settings',
          icon: 'cog',
          onPress: goToSettings,
        },
      ],
    },
  ];

  const quickActions: QuickAction[] = [
    { icon: 'plus', label: 'Subscribe', action: goToAddSubscribe },
    { icon: 'download', label: 'Download', action: goToAddDownload },
    { icon: 'magnify', label: 'Search', action: goToSearch },
    { icon: 'refresh', label: 'Refresh', action: refresh },
  ];

  const getServerStatusColor = () => {
    if (!status) return theme.colors.onSurfaceDisabled;
    switch (status.server.status) {
      case 'online':
        return '#4CAF50';
      case 'degraded':
        return '#FF9800';
      case 'offline':
        return '#F44336';
      default:
        return theme.colors.onSurfaceDisabled;
    }
  };

  const getServerStatusText = () => {
    if (!status) return 'Loading...';
    switch (status.server.status) {
      case 'online':
        return 'Online';
      case 'degraded':
        return 'Degraded';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  return (
    <>
      {/* Header with Drawer Button */}
      <View style={styles.header}>
        <DrawerButton onPress={drawer.open} />
        <Text variant="titleLarge" style={styles.headerTitle}>
          MoviePilot
        </Text>
        <IconButton
          icon="bell"
          size={20}
          iconColor={theme.colors.onSurface}
          style={styles.notificationButton}
          onPress={goToMessages}
        />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} />}
      >
        {/* Welcome Header */}
        <Card style={styles.welcomeCard} elevation={1}>
          <Card.Content>
            <Text variant="headlineSmall" style={{ color: '#E50914', fontWeight: 'bold' }}>
              Welcome back, {user?.name || user?.username || 'User'}!
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              Here's what's happening with your media library
            </Text>
          </Card.Content>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text variant="bodyMedium" style={styles.loadingText}>
              Loading dashboard...
            </Text>
          </View>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card style={styles.errorCard} elevation={1}>
            <Card.Content>
              <Text variant="bodyMedium" style={{ color: theme.colors.error }}>
                Error: {error}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Dashboard Stats */}
        {!isLoading && stats && (
          <>
            {/* Quick Stats Grid */}
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Overview
            </Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <StatCard
                  icon="movie"
                  label="Media"
                  value={stats.media.total.toString()}
                  subtext={`${stats.media.movies} movies, ${stats.media.tvShows} shows`}
                  glassmorphism
                />
              </View>
              <View style={styles.statItem}>
                <StatCard
                  icon="subscription"
                  label="Subscriptions"
                  value={stats.subscriptions.active.toString()}
                  subtext={`${stats.subscriptions.completed} completed`}
                  trend="up"
                  trendValue={`+${(stats.subscriptions as any).addedThisWeek || 0} this week`}
                  glassmorphism
                />
              </View>
            </View>

            {/* Storage & Downloads */}
            <Text variant="titleMedium" style={styles.sectionTitle}>
              System
            </Text>
            <View style={styles.statsGrid}>
              {status && (
                <View style={styles.statItem}>
                  <StorageStatCard
                    total={status.storage.total}
                    used={status.storage.used}
                    free={status.storage.free}
                    path={status.storage.path}
                    glassmorphism
                  />
                </View>
              )}
              {status && (
                <View style={styles.statItem}>
                  <DownloadStatCard
                    active={status.downloads.active}
                    completed={status.downloads.completed}
                    speed={status.downloads.speed}
                    glassmorphism
                  />
                </View>
              )}
            </View>

            {/* Server Status */}
            {status && (
              <>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Server Status
                </Text>
                <Card style={styles.statusCard} elevation={1}>
                  <Card.Content>
                    <View style={styles.statusRow}>
                      <IconButton icon="server" size={24} />
                      <View style={styles.statusText}>
                        <Text variant="bodyLarge">Server</Text>
                        <Text variant="bodySmall" style={{ color: getServerStatusColor() }}>
                          {getServerStatusText()}
                        </Text>
                      </View>
                      <View style={styles.statusMeta}>
                        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          v{status.server.version}
                        </Text>
                        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                          {formatUptime(status.server.uptime)}
                        </Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              </>
            )}
          </>
        )}

        {/* Quick Actions */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Quick Actions
        </Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <Button
              key={action.label}
              mode="contained-tonal"
              onPress={action.action}
              style={styles.actionButton}
              contentStyle={styles.actionButtonContent}
              icon={action.icon}
            >
              {action.label}
            </Button>
          ))}
        </View>

        {/* Recent Activity */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Recent Activity
        </Text>
        <ActivityList activities={recentActivity} glassmorphism />
      </ScrollView>

      {/* Side Drawer */}
      <SideDrawer
        visible={drawer.isOpen}
        onClose={drawer.close}
        sections={drawerSections}
        userName={user?.name || user?.username || 'User'}
        onLogout={logout}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#141414',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  notificationButton: {
    margin: 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },
  content: {
    padding: 16,
  },
  welcomeCard: {
    marginBottom: 24,
    borderRadius: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  errorCard: {
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    marginHorizontal: -6,
  },
  statItem: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  statusCard: {
    marginBottom: 24,
    borderRadius: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    flex: 1,
    marginLeft: 8,
  },
  statusMeta: {
    alignItems: 'flex-end',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    width: '48%',
    marginBottom: 12,
  },
  actionButtonContent: {
    paddingVertical: 8,
  },
});
