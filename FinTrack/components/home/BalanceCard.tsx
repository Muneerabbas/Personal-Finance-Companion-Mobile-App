import { StyleSheet, View } from 'react-native';

import { CurrencyText } from '@/components/currency-text';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

type BalanceCardProps = {
  amountUsd: number;
  trend: string;
};

export default function BalanceCard({ amountUsd, trend }: BalanceCardProps) {
  const isDark = (useColorScheme() ?? 'light') === 'dark';

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.title, { color: isDark ? '#8E97B5' : '#9AA1B5' }]}>ACCOUNT BALANCE</ThemedText>
      <CurrencyText
        amountUsd={amountUsd}
        style={[styles.amount, { color: isDark ? '#F8FAFF' : '#202430' }]}
      />
      <View style={[styles.trendPill, { backgroundColor: isDark ? '#183226' : '#DFF7D8' }]}>
        <ThemedText style={[styles.trendText, { color: isDark ? '#8BE19C' : '#1E8B4D' }]}>{trend}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  title: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 10,
  },
  amount: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 26,
    lineHeight: 32,
    marginBottom: 12,
  },
  trendPill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  trendText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
  },
});
