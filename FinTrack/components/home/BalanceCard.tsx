import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { CurrencyText } from '@/components/currency-text';
import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type BalanceCardProps = {
  amountUsd: number;
};

export default function BalanceCard({ amountUsd }: BalanceCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme];

  const updatedLabel = useMemo(() => {
    const t = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date());
    return `Updated today, ${t}`;
  }, []);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}>
      <View style={styles.topRow}>
        <ThemedText style={[styles.netLabel, { color: theme.muted }]}>Net balance</ThemedText>
        <View style={[styles.walletBadge, { backgroundColor: isDark ? 'rgba(139,124,255,0.12)' : '#F3E8FF' }]}>
          <Ionicons name="wallet-outline" size={22} color={theme.primary} />
        </View>
      </View>

      <CurrencyText amountUsd={amountUsd} style={[styles.amount, { color: theme.text }]} />

      <View style={styles.footerRow}>
        <View style={[styles.dot, { backgroundColor: theme.primary }]} />
        <ThemedText style={[styles.footerText, { color: theme.muted }]}>{updatedLabel}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  netLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  walletBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amount: {
    fontFamily: Fonts.bold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  footerText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
  },
});
