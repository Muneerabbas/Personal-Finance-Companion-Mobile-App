import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '@/store/useStore';

import CurrencyPickerButton from '@/components/home/CurrencyPickerButton';
import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type AppHeaderProps = {
  userFirstName?: string;
  rightAccessory?: ReactNode;
};

function greetingLine() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
}


export default function AppHeader({ userFirstName, rightAccessory }: AppHeaderProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme];
  const router = useRouter();
  const user = useStore(state => state.user);

  const displayFirstName = userFirstName || user?.user_metadata?.first_name || user?.user_metadata?.full_name?.split(' ')[0] || user?.user_metadata?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Guest';

  return (
    <View style={styles.row}>
      <Pressable style={styles.left} onPress={() => router.push('/profile')}>
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: isDark ? theme.card : '#F4F6FA',
              borderColor: isDark ? theme.border : '#ECEFF5',
            },
          ]}>
          <Ionicons name="person" size={20} color={theme.primary} />
        </View>
        <View style={styles.greetingBlock}>
          <ThemedText style={[styles.greetLine, { color: theme.muted }]}>{greetingLine()}</ThemedText>
          <ThemedText style={[styles.nameLine, { color: theme.text }]} numberOfLines={1}>
            {displayFirstName}
          </ThemedText>
        </View>
      </Pressable>

      <View style={styles.right}>{rightAccessory ?? <CurrencyPickerButton variant="header" />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 4,
    minHeight: 52,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  right: {
    flexShrink: 0,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  greetingBlock: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  greetLine: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 16,
  },
  nameLine: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    lineHeight: 22,
    marginTop: 2,
  },
});
