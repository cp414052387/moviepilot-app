/**
 * Media Server Screen
 *
 * Media server management and browsing:
 * - Server list with status indicators
 * - Library browsing
 * - File system navigation
 * - Scan management
 * - Server statistics
 */

import React, { useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Text, useTheme, IconButton, Chip, ProgressBar } from 'react-native-paper';
import { GlassCard } from '@/components/common';
import { useMediaServer } from '@/hooks/useMediaServer';
import type { MediaServer, Library, FileSystemItem } from '@/types/mediaServer';

interface ServerCardProps {
  server: MediaServer;
  onPress: () => void;
  onRefresh: () => void;
  onTest: () => void;
}

function ServerCard({ server, onPress, onRefresh, onTest }: ServerCardProps) {
  const theme = useTheme();

  const getStatusColor = () => {
    switch (server.status) {
      case 'online': return '#4CAF50';
      case 'offline': return '#F44336';
      case 'degraded': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  return (
    <GlassCard onPress={onPress} style={styles.serverCard}>
      <View style={styles.serverCardHeader}>
        <View style={styles.serverInfo}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
          <View>
            <Text variant="titleMedium" style={styles.serverName}>{server.name}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {server.type.toUpperCase()} • {server.address}{server.port && `:${server.port}`}
            </Text>
          </View>
        </View>
        <View style={styles.serverActions}>
          <IconButton icon="refresh" size={18} onPress={onRefresh} iconColor={theme.colors.primary} />
          <IconButton icon="lan-connect" size={18} onPress={onTest} iconColor={getStatusColor()} />
        </View>
      </View>
      {server.version && (
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>v{server.version}</Text>
      )}
    </GlassCard>
  );
}

interface LibraryCardProps {
  library: Library;
  onPress: () => void;
}

function LibraryCard({ library, onPress }: LibraryCardProps) {
  const theme = useTheme();

  const getLibraryIcon = () => {
    switch (library.type) {
      case 'movie': return 'movie';
      case 'tv': return 'television';
      case 'music': return 'music-note';
      case 'photo': return 'image';
      case 'mixed': return 'folder-multiple';
      default: return 'folder';
    }
  };

  return (
    <GlassCard onPress={onPress} style={styles.libraryCard}>
      <View style={styles.libraryHeader}>
        <View style={styles.libraryInfo}>
          <View style={styles.libraryIconContainer}>
            <IconButton icon={getLibraryIcon()} size={24} iconColor={theme.colors.primary} style={styles.libraryIcon} />
          </View>
          <View style={styles.libraryDetails}>
            <Text variant="titleMedium" style={styles.libraryName}>{library.name}</Text>
            <View style={styles.libraryStats}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{library.media_count} items</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>• {(library.size / 1024 / 1024 / 1024).toFixed(1)} GB</Text>
            </View>
          </View>
        </View>
        <IconButton icon="chevron-right" size={20} />
      </View>
    </GlassCard>
  );
}

interface FileItemProps {
  item: FileSystemItem;
  onPress: () => void;
}

function FileItem({ item, onPress }: FileItemProps) {
  const theme = useTheme();

  const getFileIcon = () => {
    if (item.is_folder) return 'folder';
    switch (item.type) {
      case 'video': return 'file-video';
      case 'audio': return 'file-music';
      case 'image': return 'file-image';
      case 'subtitle': return 'subtitles';
      default: return 'file';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.fileItem}>
      <View style={styles.fileItemLeft}>
        <IconButton icon={getFileIcon()} size={20} iconColor={item.is_folder ? theme.colors.primary : theme.colors.onSurfaceVariant} style={styles.fileItemIcon} />
        <View style={styles.fileItemInfo}>
          <Text variant="bodyMedium" style={styles.fileName}>{item.name}</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{item.is_folder ? `${item.item_count} items` : formatFileSize(item.size)}</Text>
        </View>
      </View>
      {!item.is_folder && <IconButton icon="dots-vertical" size={20} />}
    </TouchableOpacity>
  );
}

type ViewMode = 'servers' | 'libraries' | 'files';

export function MediaServerScreen() {
  const theme = useTheme();
  const {
    servers,
    libraries,
    fileSystemItems,
    isLoadingServers,
    isLoadingFiles,
    scanProgress,
    isScanning,
    stats,
    fetchServers,
    fetchLibraries,
    fetchServerDetails,
    browsePath,
    refreshAll,
  } = useMediaServer();

  const [viewMode, setViewMode] = React.useState<ViewMode>('servers');
  const [currentServer, setCurrentServer] = React.useState<MediaServer | null>(null);
  const [currentLibrary, setCurrentLibrary] = React.useState<Library | null>(null);
  const [currentPath, setCurrentPath] = React.useState('/');

  useEffect(() => {
    refreshAll();
  }, []);

  const handleServerPress = useCallback(async (server: MediaServer) => {
    setCurrentServer(server);
    await fetchLibraries(server.id);
    setViewMode('libraries');
  }, [fetchLibraries]);

  const handleLibraryPress = useCallback(async (library: Library) => {
    setCurrentLibrary(library);
    await browsePath(library.path, library.server_id, library.id);
    setCurrentPath(library.path);
    setViewMode('files');
  }, [browsePath]);

  const handleFilePress = useCallback(async (item: FileSystemItem) => {
    if (item.is_folder) {
      const newPath = `${currentPath}/${item.name}`.replace('//', '/');
      await browsePath(newPath, currentServer?.id, currentLibrary?.id);
      setCurrentPath(newPath);
    }
  }, [currentPath, currentServer, currentLibrary, browsePath]);

  const handleNavigateUp = useCallback(() => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    browsePath(parentPath, currentServer?.id, currentLibrary?.id);
    setCurrentPath(parentPath);
  }, [currentPath, currentServer, currentLibrary, browsePath]);

  const handleBackToServers = useCallback(() => {
    setViewMode('servers');
    setCurrentServer(null);
    setCurrentLibrary(null);
    setCurrentPath('/');
  }, []);

  const handleBackToLibraries = useCallback(() => {
    setViewMode('libraries');
    setCurrentLibrary(null);
    setCurrentPath('/');
  }, []);

  const renderHeader = () => {
    if (viewMode === 'servers') {
      return (
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.headerTitle}>Media Servers</Text>
          {stats && (
            <View style={styles.statsRow}>
              <Chip icon="server" textStyle={styles.chipText}>{stats.total_libraries} Libraries</Chip>
              <Chip icon="film" textStyle={styles.chipText}>{stats.total_media} Items</Chip>
            </View>
          )}
        </View>
      );
    }
    if (viewMode === 'libraries') {
      return (
        <View style={styles.header}>
          <View style={styles.headerWithBack}>
            <IconButton icon="arrow-left" onPress={handleBackToServers} size={20} />
            <View style={styles.headerTextContainer}>
              <Text variant="headlineSmall" style={styles.headerTitle}>{currentServer?.name || 'Libraries'}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{libraries.length} libraries</Text>
            </View>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.header}>
        <View style={styles.headerWithBack}>
          <IconButton icon="arrow-left" onPress={handleBackToLibraries} size={20} />
          <IconButton icon="arrow-up" onPress={handleNavigateUp} size={20} />
          <View style={styles.headerTextContainer}>
            <Text variant="headlineSmall" style={styles.headerTitle} numberOfLines={1}>{currentLibrary?.name || 'Files'}</Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{currentPath}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderScanProgress = () => {
    if (!isScanning || !scanProgress) return null;
    return (
      <GlassCard style={styles.scanCard}>
        <View style={styles.scanHeader}>
          <Text variant="titleSmall">Scanning...</Text>
          <Text variant="bodySmall" style={{ color: theme.colors.primary }}>{scanProgress.progress.toFixed(1)}%</Text>
        </View>
        <ProgressBar progress={scanProgress.progress / 100} color={theme.colors.primary} style={styles.scanProgress} />
        {scanProgress.current_item && (
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>{scanProgress.current_item}</Text>
        )}
      </GlassCard>
    );
  };

  const renderContent = () => {
    if (viewMode === 'servers') {
      if (servers.length === 0 && !isLoadingServers) {
        return (
          <View style={styles.emptyContainer}>
            <IconButton icon="server-off" size={48} iconColor={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>No media servers configured</Text>
          </View>
        );
      }
      return (
        <FlatList
          data={servers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServerCard server={item} onPress={() => handleServerPress(item)} onRefresh={() => fetchServerDetails(item.id)} onTest={() => {}} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isLoadingServers} onRefresh={refreshAll} />}
        />
      );
    }
    if (viewMode === 'libraries') {
      return (
        <FlatList
          data={libraries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <LibraryCard library={item} onPress={() => handleLibraryPress(item)} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<View style={styles.emptyContainer}><Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>No libraries found</Text></View>}
        />
      );
    }
    return (
      <FlatList
        data={fileSystemItems}
        keyExtractor={(item, index) => item.path || index.toString()}
        renderItem={({ item }) => <FileItem item={item} onPress={() => handleFilePress(item)} />}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isLoadingFiles} onRefresh={() => browsePath(currentPath)} />}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderHeader()}
      {renderScanProgress()}
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontWeight: '600' },
  headerWithBack: { flexDirection: 'row', alignItems: 'center' },
  headerTextContainer: { flex: 1, marginLeft: 8 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  chipText: { fontSize: 12 },
  listContent: { padding: 16, gap: 12 },
  serverCard: { padding: 16 },
  serverCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serverInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  statusIndicator: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  serverName: { fontWeight: '600' },
  serverActions: { flexDirection: 'row' },
  libraryCard: { padding: 12 },
  libraryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  libraryInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  libraryIconContainer: { backgroundColor: 'rgba(229, 9, 20, 0.1)', borderRadius: 8, marginRight: 12 },
  libraryIcon: { margin: 0 },
  libraryDetails: { flex: 1 },
  libraryName: { fontWeight: '500' },
  libraryStats: { flexDirection: 'row', marginTop: 2, gap: 8 },
  fileItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#1A1A1A', borderRadius: 8, marginBottom: 8 },
  fileItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  fileItemIcon: { margin: 0, marginRight: 12 },
  fileItemInfo: { flex: 1 },
  fileName: { fontWeight: '500' },
  fileItemDetails: { flexDirection: 'row', marginTop: 2, gap: 8 },
  scanCard: { marginHorizontal: 16, marginTop: 8, padding: 16 },
  scanHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  scanProgress: { height: 4, borderRadius: 2, marginTop: 8 },
  emptyContainer: { alignItems: 'center', paddingVertical: 64 },
});
