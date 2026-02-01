/**
 * Plugin Management Screen
 *
 * Plugin management interface:
 * - Installed plugins list
 * - Enable/disable plugins
 * - Install/uninstall plugins
 * - Plugin marketplace
 * - Plugin settings
 * - Plugin logs
 */

import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Text, useTheme, IconButton, Chip, Searchbar, Switch, Divider } from 'react-native-paper';
import { GlassCard } from '@/components/common';
import { usePlugin } from '@/hooks/usePlugin';
import type { Plugin, PluginMarketplaceItem } from '@/types/plugin';

interface PluginCardProps {
  plugin: Plugin;
  onPress: () => void;
  onToggle: () => void;
}

function PluginCard({ plugin, onPress, onToggle }: PluginCardProps) {
  const theme = useTheme();

  const getStatusColor = () => {
    switch (plugin.status) {
      case 'active': return '#4CAF50';
      case 'inactive': return '#9E9E9E';
      case 'error': return '#F44336';
      case 'installing': return '#FF9800';
      case 'uninstalling': return '#FF5722';
      default: return '#9E9E9E';
    }
  };

  const getTypeIcon = () => {
    switch (plugin.type) {
      case 'service': return 'server';
      case 'notification': return 'bell';
      case 'security': return 'shield';
      case 'media': return 'film';
      case 'utility': return 'wrench';
      default: return 'puzzle';
    }
  };

  return (
    <GlassCard onPress={onPress} style={styles.pluginCard}>
      <View style={styles.pluginHeader}>
        <View style={styles.pluginInfo}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
          <View style={styles.pluginDetails}>
            <View style={styles.pluginTitleRow}>
              <Text variant="titleMedium" style={styles.pluginName}>{plugin.name}</Text>
              {plugin.has_update && (
                <Chip icon="update" mode="flat" compact style={styles.updateChip}>Update</Chip>
              )}
            </View>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {plugin.description}
            </Text>
            <View style={styles.pluginMeta}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                v{plugin.version} • {plugin.author}
              </Text>
            </View>
          </View>
        </View>
        <Switch value={plugin.status === 'active'} onValueChange={onToggle} color={theme.colors.primary} />
      </View>
    </GlassCard>
  );
}

interface MarketplaceCardProps {
  item: PluginMarketplaceItem;
  isInstalled: boolean;
  isInstalling: boolean;
  onPress: () => void;
  onInstall: () => void;
}

function MarketplaceCard({ item, isInstalled, isInstalling, onPress, onInstall }: MarketplaceCardProps) {
  const theme = useTheme();

  const getTypeIcon = () => {
    switch (item.type) {
      case 'service': return 'server';
      case 'notification': return 'bell';
      case 'security': return 'shield';
      case 'media': return 'film';
      case 'utility': return 'wrench';
      default: return 'puzzle';
    }
  };

  return (
    <GlassCard onPress={onPress} style={styles.marketplaceCard}>
      <View style={styles.marketplaceHeader}>
        <View style={styles.marketplaceInfo}>
          <View style={styles.marketplaceIconContainer}>
            <IconButton icon={getTypeIcon()} size={20} iconColor={theme.colors.primary} style={styles.marketplaceIcon} />
          </View>
          <View style={styles.marketplaceDetails}>
            <Text variant="titleMedium" style={styles.marketplaceName}>{item.name}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.marketplaceMeta}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {item.author} • {item.downloads.toLocaleString()} downloads
              </Text>
              {item.rating > 0 && (
                <Text variant="bodySmall" style={{ color: '#FFB300' }}>
                  {' '}★ {item.rating.toFixed(1)}
                </Text>
              )}
            </View>
            {item.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {item.tags.slice(0, 3).map((tag) => (
                  <Chip key={tag} mode="outlined" compact style={styles.tagChip}>{tag}</Chip>
                ))}
              </View>
            )}
          </View>
        </View>
        <IconButton
          icon={isInstalled ? 'check' : 'download'}
          size={20}
          onPress={isInstalled ? undefined : onInstall}
          iconColor={isInstalled ? theme.colors.primary : undefined}
          disabled={isInstalling}
        />
      </View>
    </GlassCard>
  );
}

type ViewMode = 'installed' | 'marketplace';

export function PluginScreen() {
  const theme = useTheme();
  const {
    plugins,
    marketplacePlugins,
    isLoadingPlugins,
    isLoadingMarketplace,
    stats,
    searchQuery,
    selectedTag,
    tags,
    installingPluginId,
    enable,
    disable,
    install,
    searchMarketplace,
    filterByTag,
    refreshAll,
  } = usePlugin();

  const [viewMode, setViewMode] = React.useState<ViewMode>('installed');
  const [searchText, setSearchText] = React.useState('');

  const handleSearch = useCallback(() => {
    searchMarketplace(searchText);
  }, [searchText, searchMarketplace]);

  const handleTogglePlugin = useCallback(async (plugin: Plugin) => {
    if (plugin.status === 'active') {
      await disable(plugin.id);
    } else {
      await enable(plugin.id);
    }
  }, [enable, disable]);

  const handleInstallPlugin = useCallback(async (pluginId: string) => {
    await install(pluginId);
  }, [install]);

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text variant="headlineSmall" style={styles.headerTitle}>Plugins</Text>
          {stats && (
            <View style={styles.statsRow}>
              <Chip icon="puzzle" textStyle={styles.chipText}>{stats.active_plugins} Active</Chip>
              {stats.available_updates > 0 && (
                <Chip icon="update" textStyle={styles.chipText} mode="flat">{stats.available_updates} Updates</Chip>
              )}
            </View>
          )}
        </View>

        {/* View Mode Toggle */}
        <View style={styles.viewToggleContainer}>
          <TouchableOpacity
            style={[styles.viewToggle, viewMode === 'installed' && styles.viewToggleActive]}
            onPress={() => setViewMode('installed')}
          >
            <Text variant="labelMedium" style={{ color: viewMode === 'installed' ? '#E50914' : theme.colors.onSurfaceVariant }}>
              Installed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggle, viewMode === 'marketplace' && styles.viewToggleActive]}
            onPress={() => setViewMode('marketplace')}
          >
            <Text variant="labelMedium" style={{ color: viewMode === 'marketplace' ? '#E50914' : theme.colors.onSurfaceVariant }}>
              Marketplace
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar (Marketplace only) */}
        {viewMode === 'marketplace' && (
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search plugins..."
              onChangeText={setSearchText}
              value={searchText}
              onSubmitEditing={handleSearch}
              style={styles.searchBar}
              iconColor={theme.colors.onSurface}
              placeholderTextColor={theme.colors.onSurfaceVariant}
            />
          </View>
        )}

        {/* Tags Filter (Marketplace only) */}
        {viewMode === 'marketplace' && tags.length > 0 && (
          <View style={styles.tagsContainer}>
            <Chip
              selected={selectedTag === null}
              onPress={() => filterByTag(null)}
              style={styles.filterChip}
            >
              All
            </Chip>
            {tags.slice(0, 5).map((tag) => (
              <Chip
                key={tag}
                selected={selectedTag === tag}
                onPress={() => filterByTag(tag)}
                style={styles.filterChip}
              >
                {tag}
              </Chip>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderContent = () => {
    if (viewMode === 'installed') {
      if (plugins.length === 0 && !isLoadingPlugins) {
        return (
          <View style={styles.emptyContainer}>
            <IconButton icon="puzzle-outline" size={48} iconColor={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>No plugins installed</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
              Visit the Marketplace to install plugins
            </Text>
          </View>
        );
      }

      return (
        <FlatList
          data={plugins}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PluginCard
              plugin={item}
              onPress={() => {}}
              onToggle={() => handleTogglePlugin(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isLoadingPlugins} onRefresh={refreshAll} />}
        />
      );
    }

    // Marketplace
    return (
      <FlatList
        data={marketplacePlugins}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MarketplaceCard
            item={item}
            isInstalled={item.installed}
            isInstalling={installingPluginId === item.id}
            onPress={() => {}}
            onInstall={() => handleInstallPlugin(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoadingMarketplace} onRefresh={refreshAll} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconButton icon="magnify" size={48} iconColor={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>No plugins found</Text>
          </View>
        }
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
  statsRow: { flexDirection: 'row', gap: 8 },
  chipText: { fontSize: 12 },
  viewToggleContainer: { flexDirection: 'row', backgroundColor: '#2A2A2A', borderRadius: 8, padding: 4, marginBottom: 12 },
  viewToggle: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  viewToggleActive: { backgroundColor: '#1A1A1A' },
  searchContainer: { marginBottom: 12 },
  searchBar: { elevation: 0, backgroundColor: '#2A2A2A', borderRadius: 12 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  filterChip: { height: 32 },
  listContent: { padding: 16, gap: 12 },
  pluginCard: { padding: 16 },
  pluginHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  pluginInfo: { flexDirection: 'row', alignItems: 'flex-start', flex: 1, marginRight: 12 },
  statusIndicator: { width: 8, height: 8, borderRadius: 4, marginTop: 6, marginRight: 12 },
  pluginDetails: { flex: 1 },
  pluginTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  pluginName: { fontWeight: '600', flex: 1 },
  updateChip: { height: 24 },
  pluginMeta: { marginTop: 4 },
  marketplaceCard: { padding: 12 },
  marketplaceHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  marketplaceInfo: { flexDirection: 'row', alignItems: 'flex-start', flex: 1, marginRight: 12 },
  marketplaceIconContainer: { backgroundColor: 'rgba(229, 9, 20, 0.1)', borderRadius: 8 },
  marketplaceIcon: { margin: 0 },
  marketplaceDetails: { flex: 1, marginLeft: 12 },
  marketplaceName: { fontWeight: '600', marginBottom: 4 },
  marketplaceMeta: { flexDirection: 'row', marginTop: 4 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 },
  tagChip: { height: 24 },
  emptyContainer: { alignItems: 'center', paddingVertical: 64 },
});
