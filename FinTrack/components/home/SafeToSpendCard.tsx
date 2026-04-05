import { StyleSheet, View } from 'react-native';

import { CurrencyText } from '@/components/currency-text';
import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type SafeToSpendCardProps = {
  safeToSpendUsd: number;
};

export default function SafeToSpendCard({ safeToSpendUsd }: SafeToSpendCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.background,
          borderColor: theme.primary,
        },
      ]}>
      <View style={[styles.highlightBg, { backgroundColor: theme.primary }]} />
      <View style={styles.content}>
        <ThemedText style={[styles.title, { color: theme.text }]}>Safe to spend today:</ThemedText>
        <CurrencyText amountUsd={safeToSpendUsd} style={[styles.amount, { color: theme.primary }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  highlightBg: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    opacity: 0.8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 14,
  },
  amount: {
    fontFamily: Fonts.bold,
    fontSize: 15,
  },
});
