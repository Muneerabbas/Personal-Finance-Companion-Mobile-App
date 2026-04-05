import React, { useState, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import TransactionItem, { type Transaction } from './TransactionItem';
import TransactionDetailModal from './TransactionDetailModal';

type TransactionListProps = {
  transactions: Transaction[];
  onPressSeeAll?: () => void;
  title?: string;
  showSeeAll?: boolean;
};

export default function TransactionList({
  transactions,
  onPressSeeAll,
  title = 'Recent Transactions',
  showSeeAll = true,
}: TransactionListProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const accent = Colors[colorScheme].primary;

  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const handlePress = useCallback((item: Transaction) => {
    setSelectedTx(item);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedTx(null);
  }, []);

  return (
    <View>
      <View style={styles.headerRow}>
        <ThemedText style={[styles.title, { color: isDark ? '#F5F7FF' : '#111827' }]}>{title}</ThemedText>
        {showSeeAll && onPressSeeAll ? (
          <Pressable onPress={onPressSeeAll} hitSlop={12} accessibilityRole="button" accessibilityLabel="See all transactions">
            <ThemedText style={[styles.seeAllText, { color: accent }]}>See All</ThemedText>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.list}>
        {transactions.map((transaction) => (
          <TransactionItem key={transaction.id} item={transaction} onPress={handlePress} />
        ))}
      </View>

      <TransactionDetailModal
        visible={selectedTx !== null}
        transaction={selectedTx}
        onClose={handleClose}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
  },
  seeAllText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
  },
  list: {
    gap: 12,
    paddingBottom: 20,
  },
});
