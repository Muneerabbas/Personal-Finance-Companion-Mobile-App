import React, { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  /** Filled (default) uses solid primary; outline uses border + primary label. */
  variant?: 'filled' | 'outline';
  leftAccessory?: ReactNode;
  rightAccessory?: ReactNode;
  /** Defaults to `title`. */
  accessibilityLabel?: string;
  disabled?: boolean;
  loading?: boolean;
};

export default function PrimaryButton({
  title,
  onPress,
  style,
  textStyle,
  variant = 'filled',
  leftAccessory,
  rightAccessory,
  accessibilityLabel,
  disabled,
  loading,
}: PrimaryButtonProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isOutline = variant === 'outline';

  const surfaceStyle = isOutline
    ? { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: theme.primary }
    : { backgroundColor: theme.primary };

  const labelColor = isOutline ? theme.primary : '#FFFFFF';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      style={[styles.button, surfaceStyle, { opacity: disabled ? 0.7 : 1 }, style]}
      onPress={onPress}
      disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator color={isOutline ? theme.primary : '#FFFFFF'} />
      ) : (
        <View style={styles.row}>
          {leftAccessory != null ? <View style={styles.accessorySlot}>{leftAccessory}</View> : null}
          <Text
            style={[styles.label, { color: labelColor }, Platform.OS === 'ios' && styles.labelIos, textStyle]}
            numberOfLines={1}>
            {title}
          </Text>
          {rightAccessory != null ? <View style={styles.accessorySlot}>{rightAccessory}</View> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  /** Keeps vector icons vertically centered with the label on iOS. */
  accessorySlot: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    margin: 0,
    padding: 0,
    textAlign: 'center',
  },
  labelIos: {
    lineHeight: 22,
  },
});
