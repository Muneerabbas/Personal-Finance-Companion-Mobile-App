import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { CurrencyText } from '@/components/currency-text';
import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type SafeToSpendCardProps = {
  incomeUsd: number;
  expensesUsd: number;
};

export default function SafeToSpendCard({ incomeUsd, expensesUsd }: SafeToSpendCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme];

  const { safeTodayUsd, pctLeft } = useMemo(() => {
    const remaining = incomeUsd - expensesUsd;
    const safe = Math.max(0, remaining / 30);
    const pct =
      incomeUsd > 0 ? Math.min(100, Math.max(0, Math.round((remaining / incomeUsd) * 100))) : 0;
    return { safeTodayUsd: safe, pctLeft: pct };
  }, [incomeUsd, expensesUsd]);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderLeftColor: theme.primary,
        },
      ]}>
      <ThemedText style={[styles.title, { color: theme.muted }]}>Safe to spend today</ThemedText>
      <CurrencyText amountUsd={safeTodayUsd} style={[styles.amount, { color: theme.primary }]} />

      <View style={styles.barRow}>
        <View style={[styles.track, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }]}>
          <View style={[styles.fill, { width: `${pctLeft}%`, backgroundColor: theme.primary }]} />
        </View>
        <ThemedText style={[styles.pctLabel, { color: theme.muted }]}>{pctLeft}% left</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderLeftWidth: 4,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  amount: {
    fontFamily: Fonts.bold,
    fontSize: 26,
    lineHeight: 32,
    marginBottom: 14,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  pctLabel: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    minWidth: 56,
    textAlign: 'right',
  },
});
