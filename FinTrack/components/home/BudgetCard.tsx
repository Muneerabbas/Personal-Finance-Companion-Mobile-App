import { StyleSheet, View } from 'react-native';

import { CurrencyText } from '@/components/currency-text';
import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type BudgetCardProps = {
  budgetUsd: number;
  remainingUsd: number;
  expensesUsd: number;
};

export default function BudgetCard({ budgetUsd, remainingUsd, expensesUsd }: BudgetCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const progressRatio = budgetUsd > 0 ? Math.min(1, Math.max(0, expensesUsd / budgetUsd)) : 0;
  const pctUsed = Math.round(progressRatio * 100);

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <ThemedText style={[styles.title, { color: theme.muted }]}>Monthly Budget</ThemedText>
      <CurrencyText amountUsd={budgetUsd} style={[styles.budgetAmount, { color: theme.text }]} />

      <View style={styles.barWrap}>
        <View
          style={[
            styles.track,
            { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' },
          ]}>
          <View style={[styles.fill, { width: `${pctUsed}%`, backgroundColor: theme.primary }]} />
        </View>
      </View>

      <View style={styles.rowBetween}>
        <View style={styles.row}>
          <CurrencyText amountUsd={remainingUsd} style={[styles.remainingText, { color: theme.text }]} />
          <ThemedText style={{ color: theme.muted, fontSize: 13 }}> left to spend</ThemedText>
        </View>
        <ThemedText style={{ color: theme.muted, fontSize: 13 }}>{pctUsed}% used</ThemedText>
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
    paddingBottom: 20,
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 6,
  },
  budgetAmount: {
    fontFamily: Fonts.bold,
    fontSize: 26,
    marginBottom: 20,
  },
  barWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  remainingText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
  },
});
