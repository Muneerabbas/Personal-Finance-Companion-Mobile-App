import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BalanceCard from '@/components/home/BalanceCard';
import Header from '@/components/home/Header';
import IncomeExpenseCard from '@/components/home/IncomeExpenseCard';
import SpendingChart from '@/components/home/SpendingChart';
import TimeFilterTabs from '@/components/home/TimeFilterTabs';
import TransactionList from '@/components/home/TransactionList';
import { type Transaction } from '@/components/home/TransactionItem';

const TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    title: 'Shopping',
    subtitle: 'Buy some grocery',
    amount: -120,
    time: '10:00 AM',
    icon: 'bag-handle',
    iconBackground: '#FFF5D8',
  },
  {
    id: '2',
    title: 'Subscription',
    subtitle: 'Disney+ Annual',
    amount: -80,
    time: '03:30 PM',
    icon: 'document-text',
    iconBackground: '#F2E7FF',
  },
  {
    id: '3',
    title: 'Food',
    subtitle: 'Buy a ramen',
    amount: -32,
    time: '07:30 PM',
    icon: 'restaurant',
    iconBackground: '#FFE4EC',
  },
  {
    id: '4',
    title: 'Freelance',
    subtitle: 'Landing page project',
    amount: 320,
    time: '09:15 PM',
    icon: 'cash',
    iconBackground: '#E3FCEC',
  },
];

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topSection}>
          <Header />
          <BalanceCard amount="$9400" />
          <IncomeExpenseCard income="$5000" expenses="$1200" />
        </View>

        <View style={styles.chartSection}>
          <SpendingChart data={[45, 52, 33, 58, 46, 72, 100, 52, 47]} />
        </View>

        <TimeFilterTabs />

        <TransactionList
          transactions={TRANSACTIONS}
          onPressSeeAll={() => router.push('/(tabs)/transaction')}
        />
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
    paddingHorizontal: 18,
    paddingBottom: 24,
    gap: 18,
  },
  topSection: {
    backgroundColor: '#F9EFE1',
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 24,
    gap: 18,
  },
  chartSection: {
    marginTop: 4,
  },
});
