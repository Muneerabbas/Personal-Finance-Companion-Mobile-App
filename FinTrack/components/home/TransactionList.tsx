import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';

import TransactionItem, { type Transaction } from './TransactionItem';

type TransactionListProps = {
  transactions: Transaction[];
  onPressSeeAll?: () => void;
};

export default function TransactionList({ transactions, onPressSeeAll }: TransactionListProps) {
  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Recent Transactions</Text>
        <Pressable style={styles.seeAllButton} onPress={onPressSeeAll}>
          <Text style={styles.seeAllText}>See All</Text>
        </Pressable>
      </View>

      {transactions.map((transaction) => (
        <TransactionItem key={transaction.id} item={transaction} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    color: '#111827',
  },
  seeAllButton: {
    backgroundColor: '#F1E8FF',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  seeAllText: {
    fontFamily: Fonts.semiBold,
    color: '#7F3DFF',
    fontSize: 14,
  },
});
