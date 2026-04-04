import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BalanceCard from '@/components/home/BalanceCard';
import Header from '@/components/home/Header';
import IncomeExpenseCard from '@/components/home/IncomeExpenseCard';
import SpendingChart from '@/components/home/SpendingChart';
import TimeFilterTabs, { type TimeFilter } from '@/components/home/TimeFilterTabs';
import TransactionList from '@/components/home/TransactionList';
import { Colors } from '@/constants/theme';
import { useTransactions } from '@/context/transactions-context';
import { dashboardMock, HOME_RECENT_TRANSACTION_COUNT } from '@/data/dashboard-mock';
import { useColorScheme } from '@/hooks/use-color-scheme';

function clampChartIndex(index: number, length: number) {
  if (length <= 0) return 0;
  return Math.max(0, Math.min(index, length - 1));
}

export default function HomeScreen() {
  const router = useRouter();
  const { transactions } = useTransactions();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const [timeFilter, setTimeFilter] = useState<TimeFilter>(() => dashboardMock.defaultTimeFilter);

  const spendingData = useMemo(
    () => dashboardMock.spendingTrends[timeFilter] ?? [],
    [timeFilter],
  );

  const chartActiveIndex = useMemo(() => {
    const preferred = dashboardMock.chart.activeIndexByFilter[timeFilter];
    return clampChartIndex(preferred ?? spendingData.length - 1, spendingData.length);
  }, [timeFilter, spendingData]);

  const chartHeader = useMemo(
    () => (
      <TimeFilterTabs compact value={timeFilter} onChange={setTimeFilter} />
    ),
    [timeFilter],
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.topSection,
            {
              backgroundColor: colorScheme === 'dark' ? '#171B2B' : '#FFFFFF',
              borderColor: colorScheme === 'dark' ? '#232A3F' : '#ECECF2',
            },
          ]}>
          <Header />
          <BalanceCard amountUsd={dashboardMock.balance.amountUsd} trend={dashboardMock.balance.trend} />
          <IncomeExpenseCard
            incomeUsd={dashboardMock.incomeExpense.incomeUsd}
            expensesUsd={dashboardMock.incomeExpense.expensesUsd}
          />
        </View>

        <View style={styles.chartSection}>
          <SpendingChart
            data={spendingData}
            activePointIndex={chartActiveIndex}
            headerAccessory={chartHeader}
          />
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
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 140,
    gap: 20,
  },
  topSection: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 20,
    // shadowColor: '#101323',
    // shadowOpacity: 0.06,
    // shadowOffset: { width: 0, height: 10 },
    // shadowRadius: 30,
    // elevation: 0,
  },
  chartSection: {
    marginTop: 2,
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
