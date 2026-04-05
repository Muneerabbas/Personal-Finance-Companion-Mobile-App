import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BalanceCard from '@/components/home/BalanceCard';
import BudgetCard from '@/components/home/BudgetCard';
import IncomeExpenseCard from '@/components/home/IncomeExpenseCard';
import InsightsSection from '@/components/home/InsightsSection';
import SafeToSpendCard from '@/components/home/SafeToSpendCard';
import SpendingChart from '@/components/home/SpendingChart';
import type { ChartPoint } from '@/components/home/SpendingChart';
import TransactionList from '@/components/home/TransactionList';
import AppHeader from '@/components/layout/AppHeader';
import { Colors } from '@/constants/theme';
import { GOAL_SAVING_CATEGORY } from '@/constants/transaction-category-styles';
import { useStore } from '@/store/useStore';
import { HOME_RECENT_TRANSACTION_COUNT } from '@/data/dashboard-mock';
import { useColorScheme } from '@/hooks/use-color-scheme';

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const;
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MAX_WEEK_OFFSET = 3; // Can go back 4 weeks total (0,1,2,3)

/** Returns a YYYY-MM-DD string in local time */
function toLocalDateKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function todayLocalKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Build 7-day window: weekOffset=0 means this week (Mon-Sun containing today) */
function buildWeekDays(weekOffset: number): { dateKey: string; label: string }[] {
  const today = new Date();
  // Find the Monday of the current week
  const dayOfWeek = today.getDay(); // 0=Sun
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const thisMonday = new Date(today);
  thisMonday.setDate(today.getDate() + mondayOffset);
  thisMonday.setHours(0, 0, 0, 0);

  // Go back by weekOffset weeks
  const startMonday = new Date(thisMonday);
  startMonday.setDate(thisMonday.getDate() - weekOffset * 7);

  const days: { dateKey: string; label: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startMonday);
    d.setDate(startMonday.getDate() + i);
    const dayIndex = d.getDay();
    days.push({
      dateKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      label: DAY_NAMES[dayIndex],
    });
  }
  return days;
}

/** Format a week label like "Mar 30 – Apr 5" */
function formatWeekLabel(weekOffset: number): string {
  const days = buildWeekDays(weekOffset);
  const first = new Date(days[0].dateKey + 'T00:00:00');
  const last = new Date(days[6].dateKey + 'T00:00:00');
  const m1 = MONTH_SHORT[first.getMonth()];
  const m2 = MONTH_SHORT[last.getMonth()];
  if (m1 === m2) {
    return `${m1} ${first.getDate()}–${last.getDate()}`;
  }
  return `${m1} ${first.getDate()} – ${m2} ${last.getDate()}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const transactions = useStore(state => state.transactions);
  const fetchTransactions = useStore(state => state.fetchTransactions);
  const fetchBudget = useStore(state => state.fetchBudget);
  const monthlyBudget = useStore(state => state.monthlyBudget);
  const getNetBalance = useStore(state => state.getNetBalance);

  /** ON: income/expenses for this week through today. OFF: one day at a time (defaults to today). */
  const [toDateEnabled, setToDateEnabled] = useState(true);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    fetchTransactions();
    fetchBudget();
  }, []);

  const handleWeekChange = useCallback((newOffset: number) => {
    setWeekOffset(newOffset);
    setToDateEnabled(true);
    setSelectedBarIndex(null);
  }, []);

  // Build current week's days
  const weekDays = useMemo(() => buildWeekDays(weekOffset), [weekOffset]);
  const weekLabel = useMemo(() => formatWeekLabel(weekOffset), [weekOffset]);

  // Index all transactions by local date key
  const txByDate = useMemo(() => {
    const map: Record<string, typeof transactions> = {};
    for (const tx of transactions) {
      if (!tx.date) continue;
      const key = toLocalDateKey(tx.date);
      if (!map[key]) map[key] = [];
      map[key].push(tx);
    }
    return map;
  }, [transactions]);

  // Build chart data for the selected week
  const chartData: ChartPoint[] = useMemo(() => {
    return weekDays.map((day) => {
      const dayTxs = txByDate[day.dateKey] || [];
      const totalSpent = dayTxs
        .filter((tx) => tx.amount < 0 && tx.category !== GOAL_SAVING_CATEGORY)
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
      return {
        value: totalSpent,
        label: day.label,
        amountUsd: totalSpent,
        dateKey: day.dateKey,
      };
    });
  }, [weekDays, txByDate]);

  const todayBarIndex = useMemo(() => {
    const t = todayLocalKey();
    const i = weekDays.findIndex((d) => d.dateKey === t);
    return i >= 0 ? i : null;
  }, [weekDays]);

  /** Default day when “To date” is off but today is not in the visible week */
  const defaultDayBarIndex = todayBarIndex ?? 6;

  const effectiveEndDateKey = useMemo(() => {
    const first = weekDays[0]?.dateKey;
    const last = weekDays[6]?.dateKey;
    if (!first || !last) return last ?? '';
    if (weekOffset > 0) return last;
    const t = todayLocalKey();
    if (t < first) return first;
    if (t > last) return last;
    return t;
  }, [weekDays, weekOffset]);

  const handleToDateToggle = useCallback(() => {
    if (toDateEnabled) {
      setToDateEnabled(false);
      setSelectedBarIndex(todayBarIndex ?? 6);
    } else {
      setToDateEnabled(true);
      setSelectedBarIndex(null);
    }
  }, [toDateEnabled, todayBarIndex]);

  // All transactions in this week window
  const weekDateKeys = useMemo(() => new Set(weekDays.map(d => d.dateKey)), [weekDays]);
  const weekTransactions = useMemo(() => {
    return transactions.filter(tx => tx.date && weekDateKeys.has(toLocalDateKey(tx.date)));
  }, [transactions, weekDateKeys]);

  const handleBarPress = useCallback(
    (index: number) => {
      if (toDateEnabled) {
        setToDateEnabled(false);
        setSelectedBarIndex(index);
        return;
      }
      setSelectedBarIndex((prev) => {
        if (prev === index) {
          return defaultDayBarIndex;
        }
        return index;
      });
    },
    [toDateEnabled, defaultDayBarIndex],
  );

  const filteredTransactions = useMemo(() => {
    const firstKey = weekDays[0]?.dateKey;
    if (!firstKey) return weekTransactions;

    if (toDateEnabled) {
      return weekTransactions.filter((tx) => {
        if (!tx.date) return false;
        const k = toLocalDateKey(tx.date);
        return k >= firstKey && k <= effectiveEndDateKey;
      });
    }

    const dayIdx = selectedBarIndex ?? defaultDayBarIndex;
    const selectedDateKey = weekDays[dayIdx]?.dateKey;
    if (!selectedDateKey) return weekTransactions;
    return weekTransactions.filter(tx => tx.date && toLocalDateKey(tx.date) === selectedDateKey);
  }, [
    weekTransactions,
    weekDays,
    toDateEnabled,
    effectiveEndDateKey,
    selectedBarIndex,
    defaultDayBarIndex,
  ]);

  // Compute dashboard metrics based on filtered transactions
  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter(tx => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [filteredTransactions]);

  const totalExpenses = useMemo(() => {
    return filteredTransactions
      .filter((tx) => tx.amount < 0 && tx.category !== GOAL_SAVING_CATEGORY)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  }, [filteredTransactions]);

  const netBalanceAllTime = getNetBalance();
  const budget = monthlyBudget || 2500;
  const remainingBudget = Math.max(0, budget - totalExpenses);

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysLeftInMonth = Math.max(1, daysInMonth - today.getDate() + 1);

  const safeToSpend = toDateEnabled
    ? remainingBudget / daysLeftInMonth
    : remainingBudget;

  const potentialSavings = totalIncome - budget;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <AppHeader />
        
        <BalanceCard amountUsd={netBalanceAllTime} />
        
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
          <SpendingChart
            data={chartData}
            selectedIndex={toDateEnabled ? null : (selectedBarIndex ?? defaultDayBarIndex)}
            onBarPress={handleBarPress}
            weekOffset={weekOffset}
            maxWeekOffset={MAX_WEEK_OFFSET}
            onWeekChange={handleWeekChange}
            weekLabel={weekLabel}
            toDateEnabled={toDateEnabled}
            onToDateToggle={handleToDateToggle}
          />
        </View>

        <TransactionList
          transactions={filteredTransactions.slice(0, HOME_RECENT_TRANSACTION_COUNT)}
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
