import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';

export type Transaction = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  time: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBackground: string;
};

type TransactionItemProps = {
  item: Transaction;
};

export default function TransactionItem({ item }: TransactionItemProps) {
  const isExpense = item.amount < 0;

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: item.iconBackground }]}>
        <Ionicons name={item.icon} size={22} color="#7F3DFF" />
      </View>

      <View style={styles.meta}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>

      <View style={styles.amountMeta}>
        <Text style={[styles.amount, { color: isExpense ? '#F13F5D' : '#0AB27D' }]}>
          {isExpense ? '-' : '+'} ${Math.abs(item.amount)}
        </Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 2,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    color: '#9CA3AF',
    fontSize: 13,
  },
  amountMeta: {
    alignItems: 'flex-end',
  },
  amount: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    marginBottom: 2,
  },
  time: {
    fontFamily: Fonts.sans,
    color: '#9CA3AF',
    fontSize: 12,
  },
});
