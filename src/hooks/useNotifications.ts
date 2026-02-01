/**
 * useNotifications Hook
 *
 * Manages push notification subscription and permissions:
 * - Request notification permissions
 * - Subscribe/unsubscribe from WebPush
 * - Handle incoming notifications
 * - Persistent subscription state
 */

import { useState, useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { subscribeWebPush, unsubscribeWebPush } from '@/api/message';
import { useAuthStore } from '@/stores/authStore';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface UseNotificationsReturn {
  isSupported: boolean;
  permissionStatus: Notifications.PermissionStatus | null;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  requestPermissions: () => Promise<boolean>;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  getSubscriptionStatus: () => Promise<boolean>;
}

/**
 * Hook for managing push notifications
 */
export function useNotifications(): UseNotificationsReturn {
  const { isAuthenticated } = useAuthStore();

  const [isSupported, setIsSupported] = useState(false);
  const [permissionStatus, setPermissionStatus] =
    useState<Notifications.PermissionStatus | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if push notifications are supported
  useEffect(() => {
    async function checkSupport() {
      // For Expo, notifications are always available
      setIsSupported(true);
    }
    checkSupport();
  }, []);

  // Get current permission status
  useEffect(() => {
    if (isSupported) {
      Notifications.getPermissionsAsync().then((status: any) => setPermissionStatus(status as Notifications.PermissionStatus | null));
    }
  }, [isSupported]);

  // Check subscription status on mount (if authenticated)
  useEffect(() => {
    if (isAuthenticated && isSupported) {
      getSubscriptionStatus();
    }
  }, [isAuthenticated, isSupported]);

  /**
   * Request notification permissions
   */
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications are not supported on this device');
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permission if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setPermissionStatus(finalStatus);

      if (finalStatus === 'granted') {
        // On Android, create push notification channel
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#E50914',
          });
        }
        return true;
      }

      setError('Notification permission denied');
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request permissions');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  /**
   * Subscribe to push notifications
   */
  const subscribe = useCallback(async () => {
    if (!isAuthenticated) {
      setError('User not authenticated');
      return;
    }

    if (!isSupported) {
      setError('Push notifications are not supported');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Request permissions first
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setError('Notification permission required');
        return;
      }

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: getProjectId(),
      });

      // For native push, get the device push subscription
      const subscription: PushSubscription = {
        endpoint: tokenData.data,
        keys: {
          p256dh: '', // Expo handles this internally
          auth: '', // Expo handles this internally
        },
      };

      // Send subscription to server
      await subscribeWebPush({
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      });

      setIsSubscribed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe');
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isSupported, requestPermissions]);

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = useCallback(async () => {
    if (!isAuthenticated) {
      setError('User not authenticated');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await unsubscribeWebPush();
      setIsSubscribed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Get current subscription status from server
   */
  const getSubscriptionStatus = useCallback(async (): Promise<boolean> => {
    try {
      // This would check local storage or a cached flag
      // For now, we'll use a local storage approach
      return false;
    } catch {
      return false;
    }
  }, []);

  return {
    isSupported,
    permissionStatus,
    isSubscribed,
    isLoading,
    error,
    requestPermissions,
    subscribe,
    unsubscribe,
    getSubscriptionStatus,
  };
}

/**
 * Get Expo project ID from app config
 * This should be configured in app.json
 */
function getProjectId(): string {
  // In production, this would come from app.json or Constants.expoConfig
  // For now, return a placeholder
  return 'your-project-id';
}
