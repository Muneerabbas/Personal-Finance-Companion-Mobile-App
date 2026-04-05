import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BalanceCard from '@/components/home/BalanceCard';
import AppHeader from '@/components/layout/AppHeader';
import IncomeExpenseCard from '@/components/home/IncomeExpenseCard';
import SafeToSpendCard from '@/components/home/SafeToSpendCard';
import SpendingChart from '@/components/home/SpendingChart';
import TransactionList from '@/components/home/TransactionList';
import { Colors } from '@/constants/theme';
import { useTransactions } from '@/context/transactions-context';
import { dashboardMock, HOME_RECENT_TRANSACTION_COUNT } from '@/data/dashboard-mock';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const router = useRouter();
  const { transactions } = useTransactions();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const weeklySpendingData = useMemo(() => dashboardMock.spendingTrends.Week ?? [], []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <AppHeader />
        <BalanceCard amountUsd={dashboardMock.balance.amountUsd} />
        <IncomeExpenseCard
          incomeUsd={dashboardMock.incomeExpense.incomeUsd}
          expensesUsd={dashboardMock.incomeExpense.expensesUsd}
        />
        <SafeToSpendCard
          incomeUsd={dashboardMock.incomeExpense.incomeUsd}
          expensesUsd={dashboardMock.incomeExpense.expensesUsd}
        />

        <View style={styles.chartSection}>
          <SpendingChart data={weeklySpendingData} />
        </View>

        <TransactionList
          transactions={transactions.slice(0, HOME_RECENT_TRANSACTION_COUNT)}
          onPressSeeAll={() => router.push('/(tabs)/transaction')}
        />

        <View style={styles.scrollFooter} accessible accessibilityLabel="Made with love for Zorvyn">
          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: theme.muted }]}>Made with </Text>
            <Ionicons name="heart" size={13} color={theme.primary} style={styles.footerHeart} />
            <Text style={[styles.footerText, { color: theme.muted }]}> for </Text>
            <Text style={[styles.footerBrand, { color: colorScheme === 'dark' ? '#C4B5FD' : theme.primary }]}>
              Zorvyn
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F6F8',
  },
  container: {
    flex: 1,
    backgroundColor: '#F6F6F8',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 140,
    gap: 16,
  },
  chartSection: {
    marginTop: 4,
  },
  scrollFooter: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  footerText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    letterSpacing: 0.15,
  },
  footerHeart: {
    marginTop: 1,
    marginHorizontal: 2,
  },
  footerBrand: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 12,
    letterSpacing: 0.2,
  },
});
