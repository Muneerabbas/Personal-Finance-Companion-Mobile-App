import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts } from '@/constants/theme';
import { useCurrency } from '@/context/currency-context';
import { useTransactions } from '@/context/transactions-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

type CategorySlice = {
  name: string;
  amount: number;
  percent: number;
  color: string;
};

const SLICE_COLORS = ['#8FF5FF', '#BF81FF', '#65AFFF', '#444852'];
const TRACK_COLOR = '#202633';
const MONTH_LABEL = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(
  new Date(),
);

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function summarizeInsights(expenseByCategory: CategorySlice[]) {
  if (!expenseByCategory.length) {
    return {
      title: 'Smart Insight',
      body: 'Add a few expense transactions to unlock spending patterns and category-level recommendations.',
      cta: 'Add expenses',
    };
  }

  const top = expenseByCategory[0];
  const runnerUp = expenseByCategory[1];

  if (!runnerUp) {
    return {
      title: 'Smart Insight',
      body: `${top.name} is your main spending category right now at ${formatPercent(top.percent)} of total expenses. Set a limit here first for the fastest control.`,
      cta: 'Set category cap',
    };
  }

  return {
    title: 'Smart Insight',
    body: `${top.name} is leading your spend at ${formatPercent(top.percent)}. It is ahead of ${runnerUp.name} by $${(top.amount - runnerUp.amount).toFixed(0)}, so that is the clearest place to tighten this month.`,
    cta: 'Adjust budget',
  };
}

function getVelocityBars(expenses: number[]) {
  const base = expenses.length ? expenses : [120, 160, 220, 140, 90, 180, 240, 310, 150, 170, 110, 130, 260, 280];
  const normalizedBase = base.slice(-14);
  const max = Math.max(...normalizedBase, 1);

  return normalizedBase.map((value, index) => ({
    key: `${index}-${value}`,
    value,
    heightPct: Math.max(18, Math.round((value / max) * 100)),
    highlight: index === normalizedBase.length - 7 || index === normalizedBase.length - 1,
  }));
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

export default function BudgetScreen() {
  const { transactions } = useTransactions();
  const { formatUsd } = useCurrency();
  const colorScheme = useColorScheme() ?? 'dark';
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  const expenseTransactions = useMemo(
    () => transactions.filter((transaction) => transaction.amount < 0),
    [transactions],
  );

  const totalExpenses = useMemo(
    () => expenseTransactions.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0),
    [expenseTransactions],
  );

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

    return slicesWithOther.map(([name, amount], index) => ({
      name,
      amount,
      percent: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      color: SLICE_COLORS[index] ?? SLICE_COLORS[SLICE_COLORS.length - 1],
    }));
  }, [expenseTransactions, totalExpenses]);

  const topCategory = categorySlices[0];
  const previousWindow = expenseTransactions.slice(7, 14);
  const currentWindow = expenseTransactions.slice(0, 7);
  const previousTotal = previousWindow.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  const currentTotal = currentWindow.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  const comparisonPct = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;
  const isIncrease = comparisonPct >= 0;
  const insight = summarizeInsights(categorySlices);
  const bars = getVelocityBars(expenseTransactions.map((item) => Math.abs(item.amount)));
  const segments = ringSegments(categorySlices.length ? categorySlices : [{ name: 'Other', amount: 1, percent: 100, color: TRACK_COLOR }]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#0A0E17' : theme.background }]} edges={['top']}>
      <ScrollView
        style={[styles.container, { backgroundColor: isDark ? '#0A0E17' : theme.background }]}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroHeader}>
          <View>
            <ThemedText style={[styles.eyebrow, { color: isDark ? '#65AFFF' : theme.primary }]}>
              Monthly Analysis
            </ThemedText>
            <ThemedText style={[styles.heroTitle, { color: isDark ? '#EBEDFB' : theme.text }]}>
              Spending Insights
            </ThemedText>
          </View>

          <View
            style={[
              styles.monthChip,
              {
                backgroundColor: isDark ? '#0F131D' : '#FFFFFF',
                borderColor: isDark ? '#1F2737' : theme.border,
              },
            ]}>
            <Ionicons name="calendar-clear-outline" size={15} color={isDark ? '#8FF5FF' : theme.primary} />
            <ThemedText style={[styles.monthText, { color: isDark ? '#EBEDFB' : theme.text }]}>
              {MONTH_LABEL}
            </ThemedText>
          </View>
        </View>

        <View style={styles.gridStack}>
          <View
            style={[
              styles.bigCard,
              {
                backgroundColor: isDark ? '#0F131D' : '#FFFFFF',
                borderColor: isDark ? '#1A1F2C' : theme.border,
              },
            ]}>
            <ThemedText style={[styles.cardTitle, { color: isDark ? '#EBEDFB' : theme.text }]}>
              Category Distribution
            </ThemedText>

            <View style={styles.distributionContent}>
              <View style={styles.chartWrap}>
                <Svg width={220} height={220} viewBox="0 0 120 120">
                  <Circle
                    cx="60"
                    cy="60"
                    r="44"
                    stroke={TRACK_COLOR}
                    strokeWidth="12"
                    fill="transparent"
                  />
                  {segments.map((segment, index) => (
                    <Circle
                      key={index}
                      cx="60"
                      cy="60"
                      r="44"
                      stroke={segment.color}
                      strokeWidth="12"
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
                  <ThemedText style={[styles.totalLabel, { color: isDark ? '#A7ABB7' : theme.muted }]}>
                    Total
                  </ThemedText>
                  <ThemedText style={[styles.totalValue, { color: isDark ? '#EBEDFB' : theme.text }]}>
                    {formatUsd(-totalExpenses || 0)}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.legendList}>
                {categorySlices.map((slice) => (
                  <View key={slice.name} style={styles.legendRow}>
                    <View style={styles.legendLeft}>
                      <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
                      <ThemedText style={[styles.legendText, { color: isDark ? '#A7ABB7' : theme.muted }]}>
                        {slice.name}
                      </ThemedText>
                    </View>
                    <ThemedText style={[styles.legendPercent, { color: isDark ? '#EBEDFB' : theme.text }]}>
                      {formatPercent(slice.percent)}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.sideCards}>
            <LinearGradient
              colors={isDark ? ['rgba(191,129,255,0.18)', 'rgba(32,38,51,0.55)'] : ['#F7F1FF', '#EEF5FF']}
              style={[
                styles.sideCard,
                styles.glassCard,
                { borderColor: isDark ? 'rgba(114,117,129,0.18)' : '#E2E8F0' },
              ]}>
              <View style={[styles.iconBadge, { backgroundColor: isDark ? '#7701D0' : '#EBDDFF' }]}>
                <MaterialCommunityIcons
                  name="silverware-fork-knife"
                  size={20}
                  color={isDark ? '#F0DCFF' : '#6B21A8'}
                />
              </View>
              <View>
                <ThemedText style={[styles.sideLabel, { color: isDark ? '#A7ABB7' : theme.muted }]}>
                  Top spending category
                </ThemedText>
                <ThemedText style={[styles.sideHeadline, { color: isDark ? '#EBEDFB' : theme.text }]}>
                  {topCategory ? topCategory.name : 'No expenses'}
                </ThemedText>
                <ThemedText style={[styles.sideAccent, { color: isDark ? '#65AFFF' : theme.primary }]}>
                  {topCategory ? `${formatUsd(-topCategory.amount)} this month` : 'Add some transactions'}
                </ThemedText>
              </View>
            </LinearGradient>

            <View
              style={[
                styles.sideCard,
                {
                  backgroundColor: isDark ? '#202633' : '#FFFFFF',
                  borderColor: isDark ? '#2A3141' : theme.border,
                },
              ]}>
              <View style={styles.comparisonHeader}>
                <View
                  style={[
                    styles.iconBadge,
                    { backgroundColor: isIncrease ? 'rgba(255,113,108,0.12)' : 'rgba(52,211,153,0.12)' },
                  ]}>
                  <Ionicons
                    name={isIncrease ? 'trending-up' : 'trending-down'}
                    size={20}
                    color={isIncrease ? '#FF716C' : '#34D399'}
                  />
                </View>
                <View
                  style={[
                    styles.changeChip,
                    { backgroundColor: isIncrease ? 'rgba(255,113,108,0.16)' : 'rgba(52,211,153,0.14)' },
                  ]}>
                  <ThemedText style={[styles.changeChipText, { color: isIncrease ? '#FF716C' : '#34D399' }]}>
                    {`${isIncrease ? '+' : ''}${Math.round(comparisonPct || 0)}%`}
                  </ThemedText>
                </View>
              </View>
              <View>
                <ThemedText style={[styles.sideLabel, { color: isDark ? '#A7ABB7' : theme.muted }]}>
                  Weekly comparison
                </ThemedText>
                <ThemedText style={[styles.comparisonCopy, { color: isDark ? '#EBEDFB' : theme.text }]}>
                  You spent{' '}
                  <ThemedText style={{ color: isIncrease ? '#FF716C' : '#34D399', fontFamily: Fonts.bold }}>
                    {`${isIncrease ? 'more' : 'less'}`}
                  </ThemedText>{' '}
                  than the previous window based on your latest expense activity.
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        <LinearGradient
          colors={isDark ? ['rgba(143,245,255,0.10)', 'rgba(191,129,255,0.12)'] : ['#EEF8FF', '#F6F0FF']}
          style={[
            styles.aiCard,
            {
              borderColor: isDark ? 'rgba(114,117,129,0.24)' : '#DCE7F7',
              backgroundColor: isDark ? '#151925' : '#FFFFFF',
            },
          ]}>
          <View style={[styles.aiOrb, { backgroundColor: isDark ? 'rgba(143,245,255,0.08)' : '#EEF8FF' }]}>
            <Ionicons name="sparkles" size={34} color={isDark ? '#8FF5FF' : '#1A73E8'} />
          </View>

          <View style={styles.aiBody}>
            <ThemedText style={[styles.aiTitle, { color: isDark ? '#8FF5FF' : theme.primary }]}>
              {insight.title}
            </ThemedText>
            <ThemedText style={[styles.aiCopy, { color: isDark ? '#A7ABB7' : theme.muted }]}>
              {insight.body}
            </ThemedText>
          </View>

          <Pressable
            style={[
              styles.aiButton,
              { backgroundColor: isDark ? '#8FF5FF' : theme.primary },
            ]}>
            <ThemedText style={[styles.aiButtonText, { color: isDark ? '#005D63' : '#FFFFFF' }]}>
              {insight.cta}
            </ThemedText>
          </Pressable>
        </LinearGradient>

        <View
          style={[
            styles.velocityCard,
            {
              backgroundColor: isDark ? '#0F131D' : '#FFFFFF',
              borderColor: isDark ? '#1A1F2C' : theme.border,
            },
          ]}>
          <View style={styles.velocityHeader}>
            <ThemedText style={[styles.cardTitle, { color: isDark ? '#EBEDFB' : theme.text }]}>
              Spending Velocity
            </ThemedText>
            <View style={styles.rangeTabs}>
              <ThemedText style={[styles.rangeActive, { color: isDark ? '#8FF5FF' : theme.primary }]}>
                30 DAYS
              </ThemedText>
              <ThemedText style={[styles.rangeInactive, { color: isDark ? '#A7ABB7' : theme.muted }]}>
                90 DAYS
              </ThemedText>
            </View>
          </View>

          <View style={styles.barChart}>
            {bars.map((bar) => (
              <View
                key={bar.key}
                style={[
                  styles.bar,
                  {
                    height: `${bar.heightPct}%`,
                    backgroundColor: bar.highlight
                      ? bar.value === Math.max(...bars.map((item) => item.value))
                        ? '#BF81FF'
                        : '#8FF5FF'
                      : TRACK_COLOR,
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.axisLabels}>
            <ThemedText style={[styles.axisText, { color: isDark ? '#A7ABB7' : theme.muted }]}>Day 1</ThemedText>
            <ThemedText style={[styles.axisText, { color: isDark ? '#A7ABB7' : theme.muted }]}>Day 7</ThemedText>
            <ThemedText style={[styles.axisText, { color: isDark ? '#A7ABB7' : theme.muted }]}>Day 14</ThemedText>
            <ThemedText style={[styles.axisText, { color: isDark ? '#A7ABB7' : theme.muted }]}>Today</ThemedText>
          </View>
        </View>
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
    paddingTop: 20,
    paddingBottom: 140,
    gap: 22,
  },
  heroHeader: {
    gap: 16,
  },
  eyebrow: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroTitle: {
    fontFamily: Fonts.bold,
    fontSize: 38,
    lineHeight: 48,
    paddingTop: 2,
    includeFontPadding: false,
  },
  monthChip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  monthText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
  },
  gridStack: {
    gap: 16,
  },
  bigCard: {
    borderRadius: 32,
    borderWidth: 1,
    padding: 24,
  },
  cardTitle: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    lineHeight: 30,
    marginBottom: 24,
  },
  distributionContent: {
    gap: 20,
  },
  chartWrap: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.3,
    marginBottom: 6,
  },
  totalValue: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    lineHeight: 34,
  },
  legendList: {
    gap: 12,
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
    fontSize: 15,
  },
  sideCards: {
    gap: 16,
  },
  sideCard: {
    borderRadius: 32,
    borderWidth: 1,
    padding: 22,
    minHeight: 170,
    justifyContent: 'space-between',
  },
  glassCard: {
    overflow: 'hidden',
  },
  iconBadge: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  sideLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    marginBottom: 6,
  },
  sideHeadline: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    lineHeight: 38,
    paddingTop: 2,
    marginBottom: 8,
  },
  sideAccent: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  comparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  changeChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  changeChipText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  comparisonCopy: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    lineHeight: 30,
  },
  aiCard: {
    borderRadius: 32,
    borderWidth: 1,
    padding: 24,
    gap: 18,
  },
  aiOrb: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBody: {
    gap: 8,
  },
  aiTitle: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    lineHeight: 32,
  },
  aiCopy: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 24,
  },
  aiButton: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  aiButtonText: {
    fontFamily: Fonts.bold,
    fontSize: 15,
  },
  velocityCard: {
    borderRadius: 32,
    borderWidth: 1,
    padding: 24,
  },
  velocityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 26,
  },
  rangeTabs: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  rangeActive: {
    fontFamily: Fonts.bold,
    fontSize: 12,
  },
  rangeInactive: {
    fontFamily: Fonts.bold,
    fontSize: 12,
  },
  barChart: {
    height: 210,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  bar: {
    flex: 1,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    minHeight: 24,
  },
  axisLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  axisText: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
