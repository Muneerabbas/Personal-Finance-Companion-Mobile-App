import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { CurrencyText } from '@/components/currency-text';
import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type StatRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  amountUsd: number;
  iconBg: string;
  iconColor: string;
};

function StatRow({ icon, label, amountUsd, iconBg, iconColor }: StatRowProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}>
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.copy}>
        <ThemedText style={[styles.label, { color: theme.muted }]}>{label}</ThemedText>
        <CurrencyText amountUsd={amountUsd} style={[styles.amount, { color: theme.text }]} />
      </View>
    </View>
  );
}

type IncomeExpenseCardProps = {
  incomeUsd: number;
  expensesUsd: number;
};

export default function IncomeExpenseCard({ incomeUsd, expensesUsd }: IncomeExpenseCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme];

  const incomeBg = isDark ? 'rgba(139,124,255,0.14)' : '#EDE9FE';
  const expenseBg = isDark ? 'rgba(248,113,113,0.14)' : '#FEF2F2';
  const expenseIcon = isDark ? '#F87171' : '#DC2626';

  return (
    <View style={styles.column}>
      <StatRow
        icon="arrow-down"
        label="Income"
        amountUsd={incomeUsd}
        iconBg={incomeBg}
        iconColor={theme.primary}
      />
      <StatRow
        icon="arrow-up"
        label="Expenses"
        amountUsd={expensesUsd}
        iconBg={expenseBg}
        iconColor={expenseIcon}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    gap: 12,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  amount: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    lineHeight: 28,
  },
});
