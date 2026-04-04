import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { CurrencyText } from '@/components/currency-text';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

type CardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  amountUsd: number;
  accentColor: string;
  iconBackgroundColor: string;
};

function StatCard({ icon, label, amountUsd, accentColor, iconBackgroundColor }: CardProps) {
  const isDark = (useColorScheme() ?? 'light') === 'dark';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#1D2337' : '#FBFBFC',
          borderColor: isDark ? '#2A3148' : '#F0F0F4',
        },
      ]}>
      <View style={[styles.iconBox, { backgroundColor: iconBackgroundColor }]}>
        <Ionicons name={icon} size={18} color={accentColor} />
      </View>
      <View style={styles.copyWrap}>
        <ThemedText style={[styles.label, { color: isDark ? '#8F97B3' : '#A0A5B8' }]}>{label}</ThemedText>
        <CurrencyText
          amountUsd={amountUsd}
          style={[styles.amount, { color: isDark ? '#F5F7FF' : '#2A2F3C' }]}
        />
      </View>
      <Ionicons name="chevron-forward" size={18} color={isDark ? '#6F7898' : '#C9CCE0'} />
    </View>
  );
}

type IncomeExpenseCardProps = {
  incomeUsd: number;
  expensesUsd: number;
};

export default function IncomeExpenseCard({ incomeUsd, expensesUsd }: IncomeExpenseCardProps) {
  return (
    <View style={styles.column}>
      <StatCard
        icon="wallet-outline"
        label="Income"
        amountUsd={incomeUsd}
        accentColor="#2F7A52"
        iconBackgroundColor="#E7F3EA"
      />
      <StatCard
        icon="arrow-up"
        label="Expenses"
        amountUsd={expensesUsd}
        accentColor="#C05A5A"
        iconBackgroundColor="#F9EAEA"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    gap: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyWrap: {
    flex: 1,
  },
  label: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    marginBottom: 2,
  },
  amount: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    lineHeight: 24,
  },
});
