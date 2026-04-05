import { Ionicons } from '@expo/vector-icons';
import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import TransactionDetailModal from '@/components/home/TransactionDetailModal';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CurrencyText } from '@/components/currency-text';
import { type Transaction } from '@/components/home/TransactionItem';
import AppHeader from '@/components/layout/AppHeader';
import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getCategoryDisplayLabel,
  GOAL_ALLOCATION_DISPLAY_LABEL,
  isGoalAllocationCategory,
} from '@/constants/transaction-category-styles';
import { useStore } from '@/store/useStore';

type TransactionFilter = 'all' | 'income' | 'expense';

type TransactionSection = {
  id: string;
  title: string;
  subtitle: string;
  data: Transaction[];
  sortKey: number;
};

const MONTHS: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseTransactionDate(timeLabel: string) {
  const now = new Date();
  const base = startOfDay(now);
  const trimmed = timeLabel.trim();

  if (/^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(trimmed)) {
    return base;
  }

  const compact = trimmed.split('·')[0].trim();
  const match = compact.match(/^([A-Za-z]{3})\s+(\d{1,2})$/);
  if (match) {
    const monthIndex = MONTHS[match[1].toLowerCase()];
    const day = Number(match[2]);
    if (monthIndex !== undefined && Number.isFinite(day)) {
      const candidate = new Date(now.getFullYear(), monthIndex, day);
      if (candidate.getTime() > now.getTime()) {
        candidate.setFullYear(candidate.getFullYear() - 1);
      }
      return startOfDay(candidate);
    }
  }

  return base;
}

function formatSectionSubtitle(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function formatOlderSectionTitle(date: Date) {
  const now = startOfDay(new Date());
  const diffDays = Math.round((now.getTime() - date.getTime()) / 86400000);

  if (diffDays <= 1) return 'Recent Activity';
  if (diffDays <= 7) return 'Earlier This Week';
  if (diffDays <= 31) return 'Earlier This Month';

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });
}

function matchesFilter(item: Transaction, filter: TransactionFilter) {
  if (filter === 'income') return item.amount > 0;
  if (filter === 'expense') return item.amount < 0 && !isGoalAllocationCategory(item.category);
  return true;
}

function matchesSearch(item: Transaction, query: string) {
  if (!query) return true;
  const haystack = [
    item.title,
    item.category,
    getCategoryDisplayLabel(item.category),
    GOAL_ALLOCATION_DISPLAY_LABEL,
    item.paymentMethod,
    Math.abs(item.amount).toFixed(2),
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

function buildSections(transactions: Transaction[], filter: TransactionFilter, query: string): TransactionSection[] {
  const groups = new Map<string, TransactionSection>();

  for (const item of transactions) {
    if (!matchesFilter(item, filter)) continue;
    if (!matchesSearch(item, query)) continue;

    const date = parseTransactionDate(item.timeLabel);
    const key = startOfDay(date).toISOString();
    const existing = groups.get(key);

    if (existing) {
      existing.data.push(item);
      continue;
    }

    groups.set(key, {
      id: key,
      title: formatOlderSectionTitle(date),
      subtitle: formatSectionSubtitle(date),
      data: [item],
      sortKey: date.getTime(),
    });
  }

  return [...groups.values()].sort((a, b) => b.sortKey - a.sortKey);
}

function iconNameForTransaction(item: Transaction): keyof typeof Ionicons.glyphMap {
  if (item.isOtherCategory) return 'pricetag-outline';
  return item.icon;
}

function filterLabel(value: TransactionFilter) {
  if (value === 'all') return 'All';
  if (value === 'income') return 'Income';
  return 'Expenses';
}

export default function TransactionScreen() {
  const transactions = useStore(state => state.transactions);
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  const [filter, setFilter] = useState<TransactionFilter>('all');
  const [searchText, setSearchText] = useState('');
  const deferredSearchText = useDeferredValue(searchText);
  const normalizedQuery = deferredSearchText.trim().toLowerCase();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const handleTxPress = useCallback((item: Transaction) => {
    setSelectedTx(item);
  }, []);

  const handleModalClose = useCallback(() => {
    setSelectedTx(null);
  }, []);

  const sections = useMemo(
    () => buildSections(transactions, filter, normalizedQuery),
    [transactions, filter, normalizedQuery],
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#0E1220' : theme.background }]} edges={['top']}>
      <ScrollView
        style={[styles.container, { backgroundColor: isDark ? '#0E1220' : theme.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <AppHeader />
        <View
          style={[
            styles.searchWrap,
            {
              backgroundColor: isDark ? '#171C28' : '#FFFFFF',
              borderColor: isDark ? '#3B4558' : theme.border,
            },
          ]}>
          <Ionicons name="search" size={18} color={isDark ? '#A8B3C8' : theme.muted} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search transactions..."
            placeholderTextColor={isDark ? '#9AA4B8' : theme.muted}
            style={[styles.searchInput, { color: isDark ? '#EBEDFB' : theme.text }]}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
          style={styles.filterScroll}>
          {(['all', 'income', 'expense'] as const).map((value) => {
            const active = filter === value;
            return (
              <Pressable
                key={value}
                onPress={() => setFilter(value)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: active
                      ? isDark
                        ? '#92EEFF'
                        : '#E8ECFF'
                      : isDark
                        ? '#232938'
                        : '#E9ECF3',
                  },
                ]}>
                <ThemedText
                  style={[
                    styles.filterLabel,
                    {
                      color: active
                        ? isDark
                          ? '#082A35'
                          : '#3949AB'
                        : isDark
                          ? '#E2E7F2'
                          : theme.muted,
                    },
                  ]}>
                  {filterLabel(value)}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>

        {sections.length ? (
          sections.map((section, sectionIndex) => (
            <View key={section.id} style={styles.sectionBlock}>
              <View style={styles.sectionHeader}>
                <ThemedText style={[styles.sectionTitle, { color: isDark ? '#F3F6FF' : theme.text }]}>
                  {sectionIndex === 0 ? 'Recent Activity' : section.title}
                </ThemedText>
              </View>

              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: isDark ? '#1C2230' : '#FFFFFF',
                    borderColor: isDark ? '#2E3748' : theme.border,
                  },
                ]}>
                {section.data.map((item, index) => {
                  const isExpense = item.amount < 0;
                  const isGoalAllocation = isGoalAllocationCategory(item.category);
                  const accentColor = isGoalAllocation
                    ? isDark
                      ? '#A78BFA'
                      : item.iconColor || '#6D28D9'
                    : isExpense
                      ? isDark
                        ? '#F3AAA1'
                        : '#DC6B5F'
                      : isDark
                        ? '#86E2B8'
                        : '#1FA971';
                  return (
                    <Pressable key={item.id} onPress={() => handleTxPress(item)} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}>
                      <View style={styles.row}>
                        <View
                          style={[
                            styles.iconWrap,
                            {
                              backgroundColor: item.isOtherCategory
                                ? isDark
                                  ? '#2A3143'
                                  : '#E8E8ED'
                                : item.iconBackground,
                            },
                          ]}>
                          <Ionicons
                            name={iconNameForTransaction(item)}
                            size={22}
                            color={
                              item.isOtherCategory
                                ? isDark
                                  ? '#9CA3AF'
                                  : '#6B7280'
                                : item.iconColor
                            }
                          />
                        </View>

                        <View style={styles.meta}>
                          <ThemedText
                            style={[styles.title, { color: isDark ? '#F2F5FD' : theme.text }]}
                            numberOfLines={1}>
                            {item.title}
                          </ThemedText>
                          <ThemedText
                            style={[styles.metaLine, { color: isDark ? '#B7BECE' : theme.muted }]}
                            numberOfLines={1}>
                            {`${item.timeLabel} • ${getCategoryDisplayLabel(item.category)}`}
                          </ThemedText>
                        </View>

                        <View style={styles.amountWrap}>
                          <CurrencyText
                            amountUsd={item.amount}
                            signed
                            numberOfLines={1}
                            style={[
                              styles.amount,
                              { color: accentColor },
                            ]}
                          />
                          <View style={styles.typeRow}>
                            <View
                              style={[
                                styles.typeDot,
                                { backgroundColor: accentColor },
                              ]}
                            />
                            <ThemedText
                              style={[styles.typeLabel, { color: isDark ? '#B7BECE' : theme.muted }]}>
                              {isGoalAllocation ? 'GOAL' : isExpense ? 'EXPENSE' : 'INCOME'}
                            </ThemedText>
                          </View>
                        </View>
                      </View>

                      {index < section.data.length - 1 ? (
                        <View
                          style={[
                            styles.divider,
                            { backgroundColor: isDark ? '#2D3546' : '#EDF1F5' },
                          ]}
                        />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))
        ) : (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: isDark ? '#1C2230' : '#FFFFFF',
                borderColor: isDark ? '#2E3748' : theme.border,
              },
            ]}>
            <Ionicons name="receipt-outline" size={28} color={isDark ? '#A8B3C8' : theme.muted} />
            <ThemedText style={[styles.emptyTitle, { color: isDark ? '#F2F5FD' : theme.text }]}>
              No transactions found
            </ThemedText>
            <ThemedText style={[styles.emptyBody, { color: isDark ? '#B7BECE' : theme.muted }]}>
              Try a different search or filter.
            </ThemedText>
          </View>
        )}

        <TransactionDetailModal
          visible={selectedTx !== null}
          transaction={selectedTx}
          onClose={handleModalClose}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 120,
    gap: 16,
  },
  searchWrap: {
    height: 60,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontFamily: Fonts.sans,
    fontSize: 15,
  },
  filterScroll: {
    marginBottom: 22,
  },
  filterContent: {
    gap: 12,
    paddingRight: 12,
  },
  filterPill: {
    minWidth: 78,
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  sectionBlock: {
    marginBottom: 18,
  },
  sectionHeader: {
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    lineHeight: 24,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  meta: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 3,
  },
  metaLine: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
  },
  amountWrap: {
    alignItems: 'flex-end',
    minWidth: 110,
  },
  amount: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    lineHeight: 22,
    marginBottom: 5,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 5,
  },
  typeLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    letterSpacing: 0.4,
  },
  divider: {
    height: 1,
    marginLeft: 62,
  },
  emptyCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    marginTop: 12,
  },
  emptyTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    marginTop: 12,
    marginBottom: 6,
  },
  emptyBody: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    textAlign: 'center',
  },
});
