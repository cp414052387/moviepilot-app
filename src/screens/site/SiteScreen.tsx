/**
 * Site Management Screen
 *
 * Download site management:
 * - Site list with status indicators
 * - Enable/disable sites
 * - Test site connections
 * - Site configuration
 * - Site statistics
 * - Site rules management
 */

import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Text, useTheme, IconButton, Chip, Switch, Divider } from 'react-native-paper';
import { GlassCard } from '@/components/common';
import { useSite } from '@/hooks/useSite';
import type { Site } from '@/types/site';

interface SiteCardProps {
  site: Site;
  isTesting: boolean;
  onPress: () => void;
  onToggle: () => void;
  onTest: () => void;
  onDelete: () => void;
}

function SiteCard({ site, isTesting, onPress, onToggle, onTest, onDelete }: SiteCardProps) {
  const theme = useTheme();

  const getStatusColor = () => {
    switch (site.status) {
      case 'active': return '#4CAF50';
      case 'inactive': return '#9E9E9E';
      case 'banned': return '#F44336';
      case 'error': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getTypeLabel = () => {
    return site.type === 'private' ? 'Private' : 'Public';
  };

  const formatRatio = (ratio?: number) => {
    if (ratio === undefined) return 'N/A';
    return ratio.toFixed(2);
  };

  return (
    <GlassCard onPress={onPress} style={styles.siteCard}>
      <View style={styles.siteHeader}>
        <View style={styles.siteLeft}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
          <View style={styles.siteInfo}>
            <View style={styles.siteTitleRow}>
              <Text variant="titleMedium" style={styles.siteName}>{site.name}</Text>
              <Chip mode="outlined" compact style={styles.typeChip}>{getTypeLabel()}</Chip>
            </View>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {site.domain}
            </Text>
            <View style={styles.siteStats}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                ↓{site.download_count} ↑{site.upload_count}
              </Text>
              {site.ratio !== undefined && (
                <Text variant="bodySmall" style={{ color: site.ratio >= 1 ? '#4CAF50' : '#F44336' }}>
                  {' '}Ratio: {formatRatio(site.ratio)}
                </Text>
              )}
            </View>
          </View>
        </View>
        <View style={styles.siteActions}>
          <Switch
            value={site.status === 'active'}
            onValueChange={onToggle}
            color={theme.colors.primary}
          />
        </View>
      </View>
      <Divider style={styles.siteDivider} />
      <View style={styles.siteFooter}>
        <View style={styles.siteFeatures}>
          {site.rss_enabled && (
            <Chip icon="rss" mode="flat" compact style={styles.featureChip}>RSS</Chip>
          )}
          {site.search_enabled && (
            <Chip icon="magnify" mode="flat" compact style={styles.featureChip}>Search</Chip>
          )}
          {site.priority !== 'normal' && (
            <Chip icon={site.priority === 'high' ? 'arrow-up' : 'arrow-down'} mode="flat" compact style={styles.featureChip}>
              {site.priority}
            </Chip>
          )}
        </View>
        <View style={styles.siteButtons}>
          <IconButton
            icon={isTesting ? 'loading' : 'lan-connect'}
            size={18}
            onPress={onTest}
            disabled={isTesting}
          />
          <IconButton icon="delete-outline" size={18} onPress={onDelete} iconColor={theme.colors.error} />
        </View>
      </View>
    </GlassCard>
  );
}

export function SiteScreen() {
  const theme = useTheme();
  const {
    sites,
    isLoadingSites,
    stats,
    testingSiteId,
    enable,
    disable,
    test,
    remove,
    refreshAll,
  } = useSite();

  const [filterType, setFilterType] = React.useState<'all' | 'private' | 'public'>('all');

  const handleToggleSite = useCallback(async (site: Site) => {
    if (site.status === 'active') {
      await disable(site.id);
    } else {
      await enable(site.id);
    }
  }, [enable, disable]);

  const handleTestSite = useCallback(async (siteId: string) => {
    const result = await test(siteId);
    // Could show a toast with the result
    console.log('Test result:', result);
  }, [test]);

  const handleDeleteSite = useCallback(async (siteId: string) => {
    await remove(siteId);
  }, [remove]);

  const filteredSites = sites.filter((site) => {
    if (filterType === 'all') return true;
    return site.type === filterType;
  });

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text variant="headlineSmall" style={styles.headerTitle}>Download Sites</Text>
          {stats && (
            <View style={styles.statsRow}>
              <Chip icon="server" textStyle={styles.chipText}>{stats.total_sites} Total</Chip>
              <Chip icon="check-circle" textStyle={styles.chipText}>{stats.active_sites} Active</Chip>
              {stats.private_sites > 0 && (
                <Chip icon="lock" textStyle={styles.chipText}>{stats.private_sites} Private</Chip>
              )}
            </View>
          )}
        </View>

        {/* Type Filter */}
        <View style={styles.filterContainer}>
          {(['all', 'private', 'public'] as const).map((type) => (
            <Chip
              key={type}
              selected={filterType === type}
              onPress={() => setFilterType(type)}
              style={styles.filterChip}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Chip>
          ))}
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (filteredSites.length === 0 && !isLoadingSites) {
      return (
        <View style={styles.emptyContainer}>
          <IconButton icon="server-off" size={48} iconColor={theme.colors.onSurfaceVariant} />
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {filterType === 'all' ? 'No sites configured' : `No ${filterType} sites found`}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={filteredSites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SiteCard
            site={item}
            isTesting={testingSiteId === item.id}
            onPress={() => {}}
            onToggle={() => handleToggleSite(item)}
            onTest={() => handleTestSite(item.id)}
            onDelete={() => handleDeleteSite(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoadingSites} onRefresh={refreshAll} />}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  headerTop: { marginBottom: 16 },
  headerTitle: { fontWeight: '600', marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chipText: { fontSize: 12 },
  filterContainer: { flexDirection: 'row', gap: 8 },
  filterChip: { flex: 1 },
  listContent: { padding: 16, gap: 12 },
  siteCard: { padding: 16 },
  siteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  siteLeft: { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  statusIndicator: { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginRight: 12 },
  siteInfo: { flex: 1 },
  siteTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  siteName: { fontWeight: '600', flex: 1 },
  typeChip: { height: 24 },
  siteStats: { flexDirection: 'row', marginTop: 4 },
  siteActions: { marginLeft: 12 },
  siteDivider: { marginVertical: 12 },
  siteFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  siteFeatures: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  featureChip: { height: 24 },
  siteButtons: { flexDirection: 'row' },
  emptyContainer: { alignItems: 'center', paddingVertical: 64 },
});
