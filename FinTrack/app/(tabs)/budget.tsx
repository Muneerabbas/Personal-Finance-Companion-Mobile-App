import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from '@/components/layout/AppHeader';
import { ThemedText } from '@/components/themed-text';
import { OTHER_CATEGORY_LABEL, visualForCategory } from '@/constants/transaction-category-styles';
import { Fonts } from '@/constants/theme';
import { useCurrency } from '@/context/currency-context';
import { useStore } from '@/store/useStore';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

type CategorySlice = {
  name: string;
  amount: number;
  percent: number;
  color: string;
};

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getMonthLabel(offset: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - offset);
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

function getMonthRange(offset: number): { start: Date; end: Date } {
  const d = new Date();
  d.setMonth(d.getMonth() - offset);
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function summarizePrediction(
  expenseByCategory: CategorySlice[],
  projectedSavingsUsd: number,
  formatUsd: (n: number) => string,
) {
  if (!expenseByCategory.length) {
    return {
      title: 'Smart prediction',
      body: 'Add expense transactions to see projected savings and whether you are on track for your goals.',
      cta: 'Add expenses',
    };
  }

  const top = expenseByCategory[0];
  const savingsLine =
    projectedSavingsUsd > 0
      ? `Based on your current activity, you are on pace to keep about ${formatUsd(projectedSavingsUsd)} after expenses this period.`
      : 'Spending is outpacing income in your recent activity. Tightening discretionary categories will help rebalance.';

  return {
    title: 'Smart prediction',
    body: `${savingsLine} ${top.name} is still your largest share at ${formatPercent(top.percent)} — that is the fastest lever if you need more room.`,
    cta: 'Adjust goals',
  };
}

function ringSegments(slices: CategorySlice[]) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  let offsetCursor = 0;

  return slices.map((slice) => {
    const segmentLength = circumference * (slice.percent / 100);
    const segment = {
      color: slice.color,
      circumference,
      dashArray: `${segmentLength} ${circumference - segmentLength}`,
      dashOffset: -offsetCursor,
    };
    offsetCursor += segmentLength;
    return segment;
  });
}

function weeklyBarsFromExpenses(count: number, expenseAmounts: number[]) {
  const buckets = Array.from({ length: count }, () => 0);
  const take = expenseAmounts.slice(0, count * 3);
  for (let i = 0; i < take.length; i++) {
    buckets[i % count] += take[i];
  }
  const max = Math.max(...buckets, 1);
  return buckets.map((value, index) => ({
    key: `w-${index}`,
    heightPct: Math.max(28, Math.round((value / max) * 100)),
    highlight: index === count - 1,
  }));
}

export default function BudgetScreen() {
  const router = useRouter();
  const allTransactions = useStore((state) => state.transactions);
  const { formatUsd } = useCurrency();
  const colorScheme = useColorScheme() ?? 'dark';
  const isDark = colorScheme === 'dark';
  const { width: windowWidth } = useWindowDimensions();
  const isWideLayout = windowWidth >= 640;

  const [monthOffset, setMonthOffset] = useState(0);
  const MAX_MONTH_OFFSET = 3; // 4 months total

  // Find earliest transaction month to cap navigation
  const earliestMonthsBack = useMemo(() => {
    if (allTransactions.length === 0) return 0;
    const now = new Date();
    let maxBack = 0;
    for (const tx of allTransactions) {
      if (!tx.date) continue;
      const txDate = new Date(tx.date);
      const monthsDiff = (now.getFullYear() - txDate.getFullYear()) * 12 + (now.getMonth() - txDate.getMonth());
      if (monthsDiff > maxBack) maxBack = monthsDiff;
    }
    return Math.min(maxBack, MAX_MONTH_OFFSET);
  }, [allTransactions]);

  const canGoBack = monthOffset < earliestMonthsBack;
  const canGoForward = monthOffset > 0;
  const monthLabel = getMonthLabel(monthOffset);
  const { start: monthStart, end: monthEnd } = useMemo(() => getMonthRange(monthOffset), [monthOffset]);

  // Filter transactions for the selected month (calendar month)
  const monthTransactions = useMemo(() => {
    return allTransactions.filter(tx => {
      if (!tx.date) return false;
      const d = new Date(tx.date);
      return d >= monthStart && d <= monthEnd;
    });
  }, [allTransactions, monthStart, monthEnd]);

  const monthExpenseTransactions = useMemo(
    () => monthTransactions.filter((transaction) => transaction.amount < 0),
    [monthTransactions],
  );

  /** Semantic tokens from `constants/theme` via `useThemeColor` (ThemedText uses the same hook for default `text`). */
  const mutedForeground = useThemeColor({}, 'muted');
  const primaryForeground = useThemeColor({}, 'primary');
  const borderToken = useThemeColor({}, 'border');
  const cardToken = useThemeColor({}, 'card');
  const backgroundToken = useThemeColor({}, 'background');
  const secondarySurface = useThemeColor({}, 'secondary');

  // Month chunks by calendar day: 1–7, 8–14, 15–21, 22–28, then 29–last (no Mon–Sun alignment)
  const weekBuckets = useMemo(() => {
    const y = monthStart.getFullYear();
    const mo = monthStart.getMonth();
    const daysInMonth = monthEnd.getDate();
    const buckets: { start: Date; end: Date; label: string; total: number }[] = [];

    for (let startDay = 1; startDay <= daysInMonth; startDay += 7) {
      const endDay = Math.min(startDay + 6, daysInMonth);
      const effectiveStart = new Date(y, mo, startDay, 0, 0, 0, 0);
      const effectiveEnd = new Date(y, mo, endDay, 23, 59, 59, 999);
      const weekNum = buckets.length + 1;

      const total = monthExpenseTransactions
        .filter(tx => {
          if (!tx.date) return false;
          const d = new Date(tx.date);
          return d >= effectiveStart && d <= effectiveEnd;
        })
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

      buckets.push({
        start: effectiveStart,
        end: effectiveEnd,
        label: `W${weekNum}`,
        total,
      });
    }
    return buckets;
  }, [monthExpenseTransactions, monthStart, monthEnd]);

  const [selectedWeekIdx, setSelectedWeekIdx] = useState<number | null>(null);

  const visibleTransactions = useMemo(() => {
    if (selectedWeekIdx === null) return monthTransactions;
    const b = weekBuckets[selectedWeekIdx];
    if (!b) return monthTransactions;
    return monthTransactions.filter(tx => {
      if (!tx.date) return false;
      const d = new Date(tx.date);
      return d >= b.start && d <= b.end;
    });
  }, [monthTransactions, selectedWeekIdx, weekBuckets]);

  const expenseTransactions = useMemo(
    () => visibleTransactions.filter((transaction) => transaction.amount < 0),
    [visibleTransactions],
  );

  const incomeTotalUsd = useMemo(
    () => visibleTransactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
    [visibleTransactions],
  );

  const totalExpenses = useMemo(
    () => expenseTransactions.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0),
    [expenseTransactions],
  );

  const scopeDayCount = useMemo(() => {
    if (selectedWeekIdx !== null) {
      const b = weekBuckets[selectedWeekIdx];
      if (!b) return 1;
      const s = new Date(b.start);
      const e = new Date(b.end);
      s.setHours(0, 0, 0, 0);
      e.setHours(0, 0, 0, 0);
      return Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000) + 1);
    }
    return Math.max(1, monthEnd.getDate());
  }, [selectedWeekIdx, weekBuckets, monthEnd]);

  const projectedSavingsUsd = Math.max(0, incomeTotalUsd - totalExpenses);
  const avgDailyUsd = totalExpenses > 0 ? totalExpenses / scopeDayCount : 0;

  const trackColor = borderToken;

  const categorySlices = useMemo(() => {
    const byCategory = new Map<string, number>();

    for (const transaction of expenseTransactions) {
      byCategory.set(
        transaction.category,
        (byCategory.get(transaction.category) ?? 0) + Math.abs(transaction.amount),
      );
    }

    const sorted = [...byCategory.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    const topThreeTotal = sorted.slice(0, 3).reduce((sum, [, amount]) => sum + amount, 0);
    const otherAmount = Math.max(0, totalExpenses - topThreeTotal);
    const slicesWithOther = [...sorted.slice(0, 3)];

    if (otherAmount > 0) {
      slicesWithOther.push(['Other', otherAmount]);
    }

    return slicesWithOther.map(([name, amount]) => {
      const isOther = name === OTHER_CATEGORY_LABEL;
      const { iconColor } = visualForCategory(name, 'expense', isOther);
      return {
        name,
        amount,
        percent: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
        color: iconColor,
      };
    });
  }, [expenseTransactions, totalExpenses]);

  const topCategory = categorySlices[0];

  const topCategoryVisual = useMemo(() => {
    if (!topCategory) return null;
    return visualForCategory(topCategory.name, 'expense', topCategory.name === OTHER_CATEGORY_LABEL);
  }, [topCategory]);
  
  // Week comparison: selected week vs previous week
  const currentWeekTotal = selectedWeekIdx !== null ? weekBuckets[selectedWeekIdx]?.total ?? 0 : 0;
  const previousWeekTotal = selectedWeekIdx !== null && selectedWeekIdx > 0 ? weekBuckets[selectedWeekIdx - 1]?.total ?? 0 : 0;
  const weekComparisonPct = previousWeekTotal > 0 ? ((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100 : 0;
  const isWeekIncrease = weekComparisonPct >= 0;

  const prediction = summarizePrediction(categorySlices, projectedSavingsUsd, formatUsd);

  // Build bar data from real weekly buckets
  const weekBars = useMemo(() => {
    const max = Math.max(...weekBuckets.map(b => b.total), 1);
    return weekBuckets.map((bucket, index) => ({
      key: `w-${index}`,
      heightPct: bucket.total > 0 ? Math.max(14, Math.round((bucket.total / max) * 100)) : 8,
      highlight: selectedWeekIdx === null || index === selectedWeekIdx,
      label: bucket.label,
      total: bucket.total,
    }));
  }, [weekBuckets, selectedWeekIdx]);

  const segments = ringSegments(
    categorySlices.length
      ? categorySlices
      : [{ name: 'Other', amount: 1, percent: 100, color: trackColor }],
  );

  const surfaceContainer = cardToken;
  const surfaceHigh = isDark ? '#1E2436' : '#F8FAFC';
  const surfaceLow = isDark ? secondarySurface : '#F1F5F9';
  const errorColor = isDark ? '#F87171' : '#DC2626';
  const errorSurface = isDark ? 'rgba(248,113,113,0.16)' : 'rgba(220,38,38,0.12)';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: backgroundToken }]} edges={['top']}>
      <ScrollView
        style={[styles.container, { backgroundColor: backgroundToken }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <AppHeader />
        <View style={styles.headerBlock}>
          <ThemedText style={styles.heroTitle}>Financial insights</ThemedText>
          <View style={styles.monthNav}>
            <Pressable
              onPress={() => { if (canGoBack) { setMonthOffset(prev => prev + 1); setSelectedWeekIdx(null); } }}
              hitSlop={10}
              style={[styles.monthNavBtn, !canGoBack && { opacity: 0.3 }]}>
              <Ionicons name="chevron-back" size={18} color={primaryForeground} />
            </Pressable>
            <ThemedText style={[styles.heroEyebrow, { color: mutedForeground }]}>
              {monthLabel}
            </ThemedText>
            <Pressable
              onPress={() => { if (canGoForward) { setMonthOffset(prev => prev - 1); setSelectedWeekIdx(null); } }}
              hitSlop={10}
              style={[styles.monthNavBtn, !canGoForward && { opacity: 0.3 }]}>
              <Ionicons name="chevron-forward" size={18} color={primaryForeground} />
            </Pressable>
          </View>
        </View>

        {/* Bento: spending by category (large) */}
        <View
          style={[
            styles.bentoLarge,
            {
              backgroundColor: surfaceContainer,
              borderColor: borderToken,
            },
            isWideLayout && styles.bentoLargeRow,
          ]}>
          <View style={[styles.bentoLargeCopy, isWideLayout && styles.bentoLargeCopyWide]}>
            <View>
              <ThemedText style={styles.cardTitleSm}>Spending by category</ThemedText>
              <ThemedText style={[styles.cardSubtitle, { color: mutedForeground }]}>
                {selectedWeekIdx !== null
                  ? `Category split for ${weekBuckets[selectedWeekIdx]?.label ?? 'week'} only. Tap that bar again below to return to the full month.`
                  : 'Your primary outflow is spread across the categories below. Use this view to spot where to trim first.'}
              </ThemedText>
            </View>
            <View style={styles.legendList}>
              {categorySlices.length ? (
                categorySlices.map((slice) => (
                  <View key={slice.name} style={styles.legendRow}>
                    <View style={styles.legendLeft}>
                      <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
                      <ThemedText style={styles.legendText}>{slice.name}</ThemedText>
                    </View>
                    <ThemedText style={styles.legendPercent}>
                      {formatPercent(slice.percent)}
                    </ThemedText>
                  </View>
                ))
              ) : (
                <ThemedText style={[styles.cardSubtitle, { color: mutedForeground }]}>
                  No expenses yet — add a few to see your split.
                </ThemedText>
              )}
            </View>
          </View>

          <View style={styles.chartWrap}>
            <Svg width={200} height={200} viewBox="0 0 120 120">
              <Circle cx="60" cy="60" r="44" stroke={trackColor} strokeWidth="10" fill="transparent" />
              {segments.map((segment, index) => (
                <Circle
                  key={index}
                  cx="60"
                  cy="60"
                  r="44"
                  stroke={segment.color}
                  strokeWidth="10"
                  strokeLinecap="round"
                  fill="transparent"
                  strokeDasharray={segment.dashArray}
                  strokeDashoffset={segment.dashOffset}
                  rotation={-90}
                  origin="60, 60"
                />
              ))}
            </Svg>
            <View style={styles.chartCenter}>
              <ThemedText style={styles.totalValue}>{formatUsd(-totalExpenses || 0, { compact: true })}</ThemedText>
              <ThemedText style={[styles.totalLabel, { color: mutedForeground }]}>Total spent</ThemedText>
            </View>
          </View>
        </View>

        {/* Weekly comparison */}
        <View
          style={[
            styles.weeklyCard,
            {
              backgroundColor: surfaceHigh,
              borderColor: borderToken,
              borderLeftColor: primaryForeground,
            },
          ]}>
          <View style={styles.weeklyTop}>
            <MaterialCommunityIcons name="trending-up" size={28} color={primaryForeground} />
            {selectedWeekIdx !== null && previousWeekTotal > 0 ? (
              isWeekIncrease ? (
                <View style={[styles.alertChip, { backgroundColor: errorSurface }]}>
                  <ThemedText style={[styles.alertChipText, { color: errorColor }]}>Alert</ThemedText>
                </View>
              ) : (
                <View style={[styles.alertChip, { backgroundColor: isDark ? 'rgba(74,222,128,0.14)' : 'rgba(22,163,74,0.12)' }]}>
                  <ThemedText style={[styles.alertChipText, { color: isDark ? '#4ADE80' : '#15803D' }]}>On track</ThemedText>
                </View>
              )
            ) : (
              <View style={[styles.alertChip, { backgroundColor: isDark ? 'rgba(139,124,255,0.14)' : 'rgba(127,61,255,0.08)' }]}>
                <ThemedText style={[styles.alertChipText, { color: primaryForeground }]}>
                  {selectedWeekIdx !== null ? 'Week view' : 'Month total'}
                </ThemedText>
              </View>
            )}
          </View>
          <ThemedText style={[styles.cardTitleSm, { marginBottom: 6 }]}>Weekly comparison</ThemedText>
          <ThemedText style={[styles.weeklyCopy, { color: mutedForeground }]}>
            {selectedWeekIdx !== null ? (
              previousWeekTotal > 0 ? (
                <>
                  {weekBuckets[selectedWeekIdx]?.label}: Spending {isWeekIncrease ? 'increased' : 'decreased'} by{' '}
                  <ThemedText style={{ color: isWeekIncrease ? errorColor : '#34D399', fontFamily: Fonts.bold }}>
                    {`${Math.abs(Math.round(weekComparisonPct))}%`}
                  </ThemedText>{' '}
                  vs {weekBuckets[selectedWeekIdx - 1]?.label}. Total: {formatUsd(currentWeekTotal, { compact: true })}
                </>
              ) : (
                `${weekBuckets[selectedWeekIdx]?.label}: ${formatUsd(currentWeekTotal, { compact: true })} spent. No prior week to compare.`
              )
            ) : (
              <>
                {formatUsd(totalExpenses, { compact: true })} total in {monthLabel}. Tap a bar to compare that period
                with the one before.
              </>
            )}
          </ThemedText>

          <View style={styles.miniBars}>
            {weekBars.map((bar, index) => (
              <Pressable
                key={bar.key}
                style={styles.miniBarTrack}
                onPress={() => setSelectedWeekIdx(prev => prev === index ? null : index)}>
                <View
                  style={[
                    styles.miniBarFill,
                    {
                      height: `${bar.heightPct}%`,
                      backgroundColor: bar.highlight ? primaryForeground : isDark ? '#2F3548' : '#E2E8F0',
                      opacity: selectedWeekIdx !== null && !bar.highlight ? 0.4 : 1,
                    },
                  ]}
                />
              </Pressable>
            ))}
          </View>
          <View style={styles.miniAxis}>
            {weekBars.map((bar) => (
              <ThemedText key={`ax-${bar.key}`} style={[styles.axisTiny, { color: bar.highlight ? primaryForeground : mutedForeground, flex: 1, textAlign: 'center' }]}>
                {bar.label}
              </ThemedText>
            ))}
          </View>
        </View>

        {/* Two insight tiles — column layout so category titles use full card width (avoids awkward wraps) */}
        <View style={styles.insightRow}>
          <View
            style={[
              styles.insightTile,
              { backgroundColor: surfaceLow, borderColor: borderToken },
            ]}>
            <View
              style={[
                styles.insightIconWrap,
                {
                  backgroundColor: topCategoryVisual
                    ? topCategoryVisual.iconBackground
                    : isDark
                      ? '#2A3045'
                      : '#EEF2FF',
                },
              ]}>
              {topCategoryVisual ? (
                <Ionicons name={topCategoryVisual.icon} size={26} color={topCategoryVisual.iconColor} />
              ) : (
                <Ionicons name="stats-chart-outline" size={26} color={mutedForeground} />
              )}
            </View>
            <View style={styles.insightTileBody}>
              <ThemedText style={[styles.tileEyebrow, { color: mutedForeground }]}>Top category</ThemedText>
              <ThemedText
                style={styles.tileTitle}
                numberOfLines={2}
                {...(Platform.OS === 'android' ? ({ textBreakStrategy: 'simple' } as const) : {})}>
                {topCategory ? topCategory.name : '—'}
              </ThemedText>
              <ThemedText style={[styles.tileMeta, { color: mutedForeground }]} numberOfLines={2}>
                {topCategory
                  ? `${formatUsd(topCategory.amount, { compact: true })} ${
                      selectedWeekIdx !== null ? `in ${weekBuckets[selectedWeekIdx]?.label ?? 'week'}` : 'this month'
                    }`
                  : 'No expenses recorded'}
              </ThemedText>
            </View>
          </View>

          <View
            style={[
              styles.insightTile,
              { backgroundColor: surfaceLow, borderColor: borderToken },
            ]}>
            <View style={[styles.insightIconWrap, { backgroundColor: isDark ? '#2A3045' : '#EEF2FF' }]}>
              <MaterialCommunityIcons name="cash-multiple" size={28} color={primaryForeground} />
            </View>
            <View style={styles.insightTileBody}>
              <ThemedText style={[styles.tileEyebrow, { color: mutedForeground }]}>Avg daily spend</ThemedText>
              <ThemedText style={styles.tileTitle} numberOfLines={1}>
                {totalExpenses > 0 ? formatUsd(-avgDailyUsd) : '—'}
              </ThemedText>
              <ThemedText style={[styles.tileMeta, { color: mutedForeground }]} numberOfLines={2}>
                {totalExpenses > 0
                  ? selectedWeekIdx !== null
                    ? `Daily average across ${weekBuckets[selectedWeekIdx]?.label ?? 'week'}`
                    : 'Daily average for days in this month'
                  : 'Add expenses to estimate'}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Smart prediction */}
        <LinearGradient
          colors={
            isDark
              ? ['rgba(139,124,255,0.14)', 'rgba(19,24,39,0.2)']
              : ['rgba(127,61,255,0.08)', 'rgba(255,255,255,0.9)']
          }
          style={[styles.predictionCard, { borderColor: borderToken, backgroundColor: surfaceContainer }]}>
          <View style={styles.predictionWatermark} pointerEvents="none">
            <MaterialCommunityIcons name="chart-timeline-variant" size={160} color={primaryForeground} />
          </View>
          <View style={styles.predictionInner}>
            <ThemedText style={[styles.predictionTitle, { color: primaryForeground }]}>{prediction.title}</ThemedText>
            <ThemedText style={[styles.predictionBody, { color: mutedForeground }]}>{prediction.body}</ThemedText>
            <Pressable
              onPress={() =>
                prediction.cta === 'Add expenses'
                  ? router.push('/add-transaction')
                  : router.push('/(tabs)/challenges')
              }
              style={({ pressed }) => [
                styles.predictionCta,
                {
                  backgroundColor: primaryForeground,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}>
              <ThemedText
                style={[styles.predictionCtaText, { color: isDark ? backgroundToken : secondarySurface }]}>
                {prediction.cta}
              </ThemedText>
            </Pressable>
          </View>
        </LinearGradient>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 140,
    gap: 20,
  },
  headerBlock: {
    gap: 6,
    marginBottom: 4,
  },
  heroTitle: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  heroEyebrow: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthNavBtn: {
    padding: 4,
  },
  bentoLarge: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 22,
    gap: 20,
  },
  bentoLargeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  bentoLargeCopy: {
    flex: 1,
    gap: 20,
    justifyContent: 'space-between',
  },
  bentoLargeCopyWide: {
    minWidth: 0,
  },
  cardTitleSm: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  chartWrap: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  totalValue: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    lineHeight: 28,
  },
  totalLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  legendList: {
    gap: 14,
    marginTop: 4,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  legendText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
  },
  legendPercent: {
    fontFamily: Fonts.bold,
    fontSize: 14,
  },
  weeklyCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    padding: 22,
    gap: 14,
  },
  weeklyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  alertChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  alertChipText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  weeklyCopy: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 22,
  },
  miniBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    height: 96,
    marginTop: 8,
  },
  miniBarTrack: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  miniBarFill: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    minHeight: 8,
  },
  miniAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  axisTiny: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  insightRow: {
    flexDirection: 'row',
    gap: 12,
  },
  insightTile: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 12,
  },
  insightIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTileBody: {
    width: '100%',
    gap: 4,
  },
  tileEyebrow: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tileTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    lineHeight: 22,
  },
  tileMeta: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
  },
  predictionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  predictionWatermark: {
    position: 'absolute',
    right: -36,
    bottom: -40,
    opacity: 0.08,
  },
  predictionInner: {
    maxWidth: '100%',
    gap: 12,
    zIndex: 1,
  },
  predictionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 17,
    lineHeight: 24,
  },
  predictionBody: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 24,
  },
  predictionCta: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 999,
  },
  predictionCtaText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
  },
});
