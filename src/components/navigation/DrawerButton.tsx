/**
 * Drawer Button Component
 *
 * A menu button that opens the side drawer.
 * Can be placed in any screen's header or as a floating action button.
 */

import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { IconButton, useTheme } from 'react-native-paper';

export interface DrawerButtonProps {
  onPress: () => void;
  size?: number;
  color?: string;
  style?: any;
}

export function DrawerButton({
  onPress,
  size = 24,
  color,
  style,
}: DrawerButtonProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <IconButton
        icon="menu"
        size={size}
        iconColor={color || theme.colors.onSurface}
        style={styles.icon}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  icon: {
    margin: 0,
  },
});
