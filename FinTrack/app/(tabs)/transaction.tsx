import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TransactionList from '@/components/home/TransactionList';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useTransactions } from '@/context/transactions-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TransactionScreen() {
  const { transactions } = useTransactions();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        style={[styles.scroll, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <ThemedText style={[styles.pageTitle, { color: isDark ? '#F5F7FF' : '#111827' }]}>Transactions</ThemedText>
          <ThemedText style={[styles.pageSubtitle, { color: theme.muted }]}>
            {transactions.length} activities
          </ThemedText>
        </View>

        <TransactionList
          transactions={transactions}
          title="All activity"
          showSeeAll={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 120,
  },
  pageHeader: {
    marginBottom: 20,
  },
  pageTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 28,
    marginBottom: 6,
  },
  pageSubtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  },
});
