/**
 * AddDownloadScreen
 *
 * Screen for adding new downloads:
 * - Magnet link input
 * - Torrent file selection
 * - Save path configuration
 * - Validation and submission
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Divider,
  useTheme,
  IconButton,
} from 'react-native-paper';
import { createDownload } from '@/api/download';

type DownloadSource = 'magnet' | 'torrent';

export function AddDownloadScreen({ navigation }: any) {
  const theme = useTheme();

  const [source, setSource] = useState<DownloadSource>('magnet');
  const [magnetLink, setMagnetLink] = useState('');
  const [savePath, setSavePath] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validate input
    if (source === 'magnet' && !magnetLink.trim()) {
      Alert.alert('Error', 'Please enter a magnet link');
      return;
    }

    if (source === 'torrent' && !magnetLink.trim()) {
      Alert.alert('Error', 'Torrent file selection not implemented yet');
      return;
    }

    setSubmitting(true);
    try {
      await createDownload({
        magnet: source === 'magnet' ? magnetLink.trim() : undefined,
        torrent: source === 'torrent' ? magnetLink.trim() : undefined,
        savePath: savePath.trim() || undefined,
      });

      Alert.alert(
        'Success',
        'Download added successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Failed to add download:', error);
      Alert.alert('Error', 'Failed to add download. Please check the link and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaste = async () => {
    // TODO: Implement clipboard paste
    Alert.alert('Coming Soon', 'Clipboard paste will be available soon');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <Card style={styles.card} elevation={2}>
          <Card.Content>
            <View style={styles.headerContent}>
              <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.primary}20` }]}>
                <IconButton
                  icon="download-plus"
                  size={32}
                  iconColor={theme.colors.primary}
                  style={styles.headerIcon}
                />
              </View>
              <View style={styles.headerText}>
                <Text variant="headlineSmall">Add Download</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Add a torrent or magnet link to start downloading
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Source Selection */}
        <Card style={styles.card} elevation={1}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Download Source
            </Text>

            <View style={styles.sourceButtons}>
              <Button
                mode={source === 'magnet' ? 'contained' : 'outlined'}
                onPress={() => setSource('magnet')}
                style={styles.sourceButton}
                buttonColor={theme.colors.primary}
              >
                Magnet Link
              </Button>
              <Button
                mode={source === 'torrent' ? 'contained' : 'outlined'}
                onPress={() => setSource('torrent')}
                style={styles.sourceButton}
                buttonColor={theme.colors.primary}
              >
                Torrent File
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Magnet Link Input */}
        {source === 'magnet' && (
          <Card style={styles.card} elevation={1}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Magnet Link
              </Text>
              <TextInput
                value={magnetLink}
                onChangeText={setMagnetLink}
                placeholder="magnet:?xt=..."
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                right={
                  <TextInput.Icon
                    icon="content-paste"
                    onPress={handlePaste}
                  />
                }
              />
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Paste a magnet link from any torrent site
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Torrent File Selection */}
        {source === 'torrent' && (
          <Card style={styles.card} elevation={1}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Torrent File
              </Text>
              <Button
                mode="outlined"
                icon="folder-open"
                onPress={() => Alert.alert('Coming Soon', 'File picker will be available soon')}
                style={styles.fileButton}
              >
                Select Torrent File
              </Button>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Select a .torrent file from your device
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Save Path Configuration */}
        <Card style={styles.card} elevation={1}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Save Location (Optional)
            </Text>
            <TextInput
              value={savePath}
              onChangeText={setSavePath}
              placeholder="Default download folder"
              mode="outlined"
              style={styles.input}
              left={<TextInput.Icon icon="folder" />}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Leave empty to use the default download folder
            </Text>
          </Card.Content>
        </Card>

        {/* Help/Tips Card */}
        <Card style={styles.card} elevation={1}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Tips
            </Text>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Make sure your MoviePilot server can access the torrent tracker
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Magnet links start with "magnet:?" or "magnet:?xt="
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                Downloaded files will be saved to your configured media library folder
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Spacer for button */}
        <View style={styles.buttonSpacer} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionBar, { backgroundColor: theme.colors.surface }]}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          disabled={submitting}
          style={styles.actionButton}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting}
          style={styles.actionButton}
          buttonColor="#E50914"
        >
          Add Download
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerIcon: {
    margin: 0,
  },
  headerText: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  sourceButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  sourceButton: {
    flex: 1,
  },
  input: {
    marginBottom: 8,
  },
  fileButton: {
    marginBottom: 8,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 16,
    marginRight: 8,
    color: '#E50914',
  },
  buttonSpacer: {
    height: 20,
  },
  actionBar: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 6,
  },
});
