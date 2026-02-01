/**
 * Navigation Hook
 *
 * Provides centralized navigation management including:
 * - Drawer state management
 * - Navigation helpers
 * - Quick access to common navigation actions
 */

import { useCallback } from 'react';
import { NavigationProp, useNavigation as useRNNavigation } from '@react-navigation/native';
import { useSideDrawer } from '@/components/navigation';

export type AppNavigation = NavigationProp<{
  Home: undefined;
  Media: undefined;
  Search: undefined;
  MediaDetail: { mediaId: string };
  Subscriptions: undefined;
  SubscribeList: undefined;
  SubscribeDetail: { subscriptionId: string };
  AddSubscribe: undefined;
  Downloads: undefined;
  DownloadList: undefined;
  AddDownload: undefined;
  Messages: undefined;
  MessageList: undefined;
  Chat: { chatId?: string };
  Settings: undefined;
  SettingsScreen: undefined;
}>;

/**
 * Main navigation hook
 * Combines React Navigation with custom drawer management
 */
export function useNavigation() {
  const navigation = useRNNavigation<AppNavigation>();
  const drawer = useSideDrawer();

  // Navigation helpers - using any to bypass complex navigation types
  const goToHome = useCallback(() => {
    (navigation.navigate as any)('Home');
  }, [navigation]);

  const goToMedia = useCallback(() => {
    (navigation.navigate as any)('Media');
  }, [navigation]);

  const goToSearch = useCallback(() => {
    (navigation.navigate as any)('Search');
  }, [navigation]);

  const goToMediaDetail = useCallback(
    (mediaId: string) => {
      (navigation.navigate as any)('MediaDetail', { mediaId });
    },
    [navigation]
  );

  const goToSubscriptions = useCallback(() => {
    (navigation.navigate as any)('Subscriptions');
  }, [navigation]);

  const goToSubscribeDetail = useCallback(
    (subscriptionId: string) => {
      (navigation.navigate as any)('SubscribeDetail', { subscriptionId });
    },
    [navigation]
  );

  const goToAddSubscribe = useCallback(() => {
    (navigation.navigate as any)('AddSubscribe');
  }, [navigation]);

  const goToDownloads = useCallback(() => {
    (navigation.navigate as any)('Downloads');
  }, [navigation]);

  const goToAddDownload = useCallback(() => {
    (navigation.navigate as any)('AddDownload');
  }, [navigation]);

  const goToMessages = useCallback(() => {
    (navigation.navigate as any)('Messages');
  }, [navigation]);

  const goToChat = useCallback(
    (chatId?: string) => {
      (navigation.navigate as any)('Chat', { chatId });
    },
    [navigation]
  );

  const goToSettings = useCallback(() => {
    (navigation.navigate as any)('Settings');
  }, [navigation]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    // React Navigation
    navigation,

    // Drawer
    drawer,

    // Navigation helpers
    goToHome,
    goToMedia,
    goToSearch,
    goToMediaDetail,
    goToSubscriptions,
    goToSubscribeDetail,
    goToAddSubscribe,
    goToDownloads,
    goToAddDownload,
    goToMessages,
    goToChat,
    goToSettings,
    goBack,
  };
}
