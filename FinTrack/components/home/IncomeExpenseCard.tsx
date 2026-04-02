import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';

type CardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  amount: string;
  backgroundColor: string;
};

function StatCard({ icon, label, amount, backgroundColor }: CardProps) {
  return (
    <View style={[styles.card, { backgroundColor }]}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={18} color="#3B3B3B" />
      </View>
      <View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.amount}>{amount}</Text>
      </View>
    </View>
  );
}

type IncomeExpenseCardProps = {
  income: string;
  expenses: string;
};

export default function IncomeExpenseCard({ income, expenses }: IncomeExpenseCardProps) {
  return (
    <View style={styles.row}>
      <StatCard icon="wallet" label="Income" amount={income} backgroundColor="#0AB27D" />
      <StatCard icon="arrow-up" label="Expenses" amount={expenses} backgroundColor="#F13F5D" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: Fonts.sans,
    color: '#E8FDF6',
    fontSize: 12,
  },
  amount: {
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 24,
  },
});
