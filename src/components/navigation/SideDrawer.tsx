/**
 * Side Drawer Component
 *
 * A custom drawer navigation component that provides:
 * - Quick access to all main sections
 * - User profile info and logout
 * - Quick actions (search, settings)
 * - Collapsible sections
 * - Glassmorphism styling
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Drawer,
  Text,
  IconButton,
  useTheme,
  Divider,
  Avatar,
} from 'react-native-paper';
import { GlassCard } from '@/components/common';

export interface DrawerItem {
  id: string;
  label: string;
  icon: string;
  onPress: () => void;
  badge?: number;
  disabled?: boolean;
}

export interface DrawerSection {
  title?: string;
  items: DrawerItem[];
}

export interface SideDrawerProps {
  visible: boolean;
  onClose: () => void;
  sections: DrawerSection[];
  userName?: string;
  userAvatar?: string;
  onLogout?: () => void;
}

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

export function SideDrawer({
  visible,
  onClose,
  sections,
  userName = 'User',
  userAvatar,
  onLogout,
}: SideDrawerProps) {
  const theme = useTheme();

  return (
    <Drawer.Section
      style={[styles.drawer, { backgroundColor: theme.colors.background }]}
      title=""
    >
      <View style={[styles.drawerContent, { backgroundColor: theme.colors.background }]}>
        {/* Header Section */}
        <GlassCard
          style={styles.headerCard}
          blurIntensity={15}
          opacity={0.7}
          tint="primary"
        >
          <View style={styles.headerContent}>
            <Avatar.Text
              size={64}
              label={userName.charAt(0).toUpperCase()}
              style={styles.avatar}
              labelStyle={styles.avatarLabel}
            />
            <Text variant="titleMedium" style={styles.userName}>
              {userName}
            </Text>
            <Text variant="bodySmall" style={styles.userStatus}>
              Online
            </Text>
          </View>
        </GlassCard>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {sections.map((section, sectionIndex) => (
            <View key={`section-${sectionIndex}`} style={styles.section}>
              {section.title && (
                <>
                  <Text
                    variant="labelMedium"
                    style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}
                  >
                    {section.title}
                  </Text>
                  <Divider style={styles.divider} />
                </>
              )}
              {section.items.map((item) => (
                <DrawerListItem
                  key={item.id}
                  item={item}
                  theme={theme}
                  onPress={() => {
                    item.onPress();
                    onClose();
                  }}
                />
              ))}
            </View>
          ))}
        </ScrollView>

        {/* Footer Section */}
        <View style={styles.footer}>
          <Divider style={styles.divider} />
          {onLogout && (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => {
                onLogout();
                onClose();
              }}
            >
              <IconButton
                icon="logout"
                size={20}
                iconColor={theme.colors.error}
                style={styles.logoutIcon}
              />
              <Text variant="bodyMedium" style={[styles.logoutText, { color: theme.colors.error }]}>
                Logout
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Drawer.Section>
  );
}

interface DrawerListItemProps {
  item: DrawerItem;
  theme: any;
  onPress: () => void;
}

function DrawerListItem({ item, theme, onPress }: DrawerListItemProps) {
  return (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: 'transparent' }]}
      onPress={onPress}
      disabled={item.disabled}
      activeOpacity={0.7}
    >
      <View style={styles.itemContent}>
        <View style={styles.itemLeft}>
          <IconButton
            icon={item.icon}
            size={20}
            iconColor={item.disabled ? theme.colors.onSurfaceDisabled : theme.colors.onSurface}
            style={styles.itemIcon}
          />
          <Text
            variant="bodyMedium"
            style={[
              styles.itemLabel,
              { color: item.disabled ? theme.colors.onSurfaceDisabled : theme.colors.onSurface },
            ]}
          >
            {item.label}
          </Text>
        </View>
        {item.badge !== undefined && item.badge > 0 && (
          <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
            <Text variant="labelSmall" style={styles.badgeText}>
              {item.badge > 99 ? '99+' : item.badge.toString()}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  drawer: {
    flex: 1,
  },
  drawerContent: {
    flex: 1,
    backgroundColor: '#141414',
  },
  headerCard: {
    margin: 16,
    borderRadius: 16,
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  avatar: {
    backgroundColor: '#E50914',
  },
  avatarLabel: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  userName: {
    marginTop: 12,
    fontWeight: '600',
  },
  userStatus: {
    marginTop: 4,
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    marginLeft: 16,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    margin: 0,
    marginRight: -8,
  },
  itemLabel: {
    marginLeft: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  footer: {
    paddingBottom: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoutIcon: {
    margin: 0,
    marginRight: -8,
  },
  logoutText: {
    marginLeft: 8,
    fontWeight: '500',
  },
});

/**
 * Hook to manage drawer state
 * Provides open/close functionality for the drawer
 */
export function useSideDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
