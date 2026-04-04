import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import CurrencyPickerButton from '@/components/home/CurrencyPickerButton';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type HeaderProps = {
  month?: string;
  onPressMonth?: () => void;
};

export default function Header({ month = 'October', onPressMonth }: HeaderProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.avatarPlaceholder,
          {
            backgroundColor: isDark ? '#222941' : '#F4F6FA',
            borderColor: isDark ? '#313A55' : '#ECEFF5',
          },
        ]}>
        <Ionicons name="person" size={18} color={theme.primary} />
      </View>

      <TouchableOpacity style={styles.monthWrap} onPress={onPressMonth} activeOpacity={0.8}>
        <ThemedText style={[styles.monthText, { color: isDark ? '#F5F7FF' : '#2D3348' }]}>{month}</ThemedText>
        <Ionicons name="chevron-down" size={16} color={theme.primary} />
      </TouchableOpacity>

      <CurrencyPickerButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  monthText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
  },
});
