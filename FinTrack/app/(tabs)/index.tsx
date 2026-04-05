import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BalanceCard from '@/components/home/BalanceCard';
import BudgetCard from '@/components/home/BudgetCard';
import IncomeExpenseCard from '@/components/home/IncomeExpenseCard';
import InsightsSection from '@/components/home/InsightsSection';
import SafeToSpendCard from '@/components/home/SafeToSpendCard';
import SpendingChart from '@/components/home/SpendingChart';
import TransactionList from '@/components/home/TransactionList';
import AppHeader from '@/components/layout/AppHeader';
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

  const { totalIncome, totalExpenses } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    transactions.forEach(t => {
      if (t.amount > 0) income += t.amount;
      else if (t.amount < 0) expenses += Math.abs(t.amount);
    });
    
    // Fallback to mock data if there are no transactions available, so UI renders correctly
    if (income === 0 && expenses === 0 && dashboardMock.incomeExpense) {
      return { 
        totalIncome: dashboardMock.incomeExpense.incomeUsd, 
        totalExpenses: dashboardMock.incomeExpense.expensesUsd 
      };
    }
    
    return { totalIncome: income, totalExpenses: expenses };
  }, [transactions]);

  const netBalance = totalIncome - totalExpenses;
  const budget = 2500; // Represents standard monthly budget
  const remainingBudget = Math.max(0, budget - totalExpenses);
  
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysLeftInMonth = Math.max(1, daysInMonth - today.getDate() + 1);
  
  const safeToSpend = remainingBudget / daysLeftInMonth;
  const potentialSavings = totalIncome - budget;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <AppHeader />
        
        <BalanceCard amountUsd={netBalance} />
        
        <IncomeExpenseCard
          incomeUsd={totalIncome}
          expensesUsd={totalExpenses}
        />
        
        <BudgetCard 
          budgetUsd={budget} 
          remainingUsd={remainingBudget} 
          expensesUsd={totalExpenses} 
        />
        
        <SafeToSpendCard safeToSpendUsd={safeToSpend} />
        
        <InsightsSection potentialSavingsUsd={potentialSavings} />

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
