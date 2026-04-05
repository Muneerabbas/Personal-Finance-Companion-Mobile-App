import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ChartPoint = {
  value: number;
  label: string;
  amountUsd: number;
  dateKey?: string;
};

type SpendingChartProps = {
  data: ChartPoint[];
  /** Bar highlight in day-by-day mode; null when “To date” aggregate mode is on */
  selectedIndex?: number | null;
  onBarPress?: (index: number) => void;
  weekOffset?: number;
  maxWeekOffset?: number;
  onWeekChange?: (offset: number) => void;
  weekLabel?: string;
  /** ON: totals use the week through today. OFF: single-day view (defaults to today’s bar). */
  toDateEnabled: boolean;
  onToDateToggle: () => void;
};

const BAR_CHART_HEIGHT = 140;

function SpendingChartInner({
  data,
  selectedIndex,
  onBarPress,
  weekOffset = 0,
  maxWeekOffset = 3,
  onWeekChange,
  weekLabel,
  toDateEnabled,
  onToDateToggle,
}: SpendingChartProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const mutedColor = useThemeColor({}, 'muted');
  const primaryColor = useThemeColor({}, 'primary');
  const cardBg = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const onPrimaryText = '#FFFFFF';

  const series = useMemo(() => {
    const sliced = data.slice(0, 7);
    const out: ChartPoint[] = [...sliced];
    while (out.length < 7) {
      const i = out.length;
      out.push({ value: 0, label: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][i], amountUsd: 0 });
    }
    return out;
  }, [data]);

  const hasBarHighlight = !toDateEnabled && selectedIndex !== null && selectedIndex !== undefined;

  const highlightIndex = useMemo(() => {
    if (hasBarHighlight) return selectedIndex as number;
    return -1;
  }, [selectedIndex, hasBarHighlight]);

  const bars = useMemo(() => {
    // Tallest bar = the day with the highest spend this week; other days are scaled as a % of that max.
    const maxV = Math.max(...series.map((d) => d.value), 1);
    return series.map((point, index) => {
      const heightPct = point.value > 0
        ? Math.max(14, Math.round((point.value / maxV) * 100))
        : 8;
      const isHighlight = !hasBarHighlight || index === highlightIndex;
      return {
        key: `${point.label}-${index}`,
        heightPct,
        isHighlight,
        shortLabel: point.label.slice(0, 3).toUpperCase(),
      };
    });
  }, [series, highlightIndex, hasBarHighlight]);

  const inactiveBarColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)';
  const chartWellBg = isDark ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.04)';
  const canGoForward = weekOffset > 0;
  const canGoBack = weekOffset < maxWeekOffset;

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      <View style={styles.headerBlock}>
        <ThemedText style={styles.title}>Weekly Spending</ThemedText>
        <View style={styles.headerActionsRow}>
          <View style={styles.weekNav}>
            <Pressable
              onPress={() => canGoBack && onWeekChange?.(weekOffset + 1)}
              hitSlop={10}
              style={[styles.navBtn, !canGoBack && styles.navBtnDisabled]}>
              <Ionicons name="chevron-back" size={18} color={canGoBack ? primaryColor : (isDark ? '#333' : '#ccc')} />
            </Pressable>
            <ThemedText style={[styles.weekLabel, { color: primaryColor }]}>
              {weekLabel || (weekOffset === 0 ? 'This Week' : `${weekOffset}w ago`)}
            </ThemedText>
            <Pressable
              onPress={() => canGoForward && onWeekChange?.(weekOffset - 1)}
              hitSlop={10}
              style={[styles.navBtn, !canGoForward && styles.navBtnDisabled]}>
              <Ionicons name="chevron-forward" size={18} color={canGoForward ? primaryColor : (isDark ? '#333' : '#ccc')} />
            </Pressable>
          </View>
          <Pressable
            onPress={onToDateToggle}
            accessibilityRole="switch"
            accessibilityState={{ checked: toDateEnabled }}
            accessibilityLabel="To date: use spending through today for this week"
            style={({ pressed }) => [
              styles.toDateChip,
              { borderColor },
              toDateEnabled && { backgroundColor: primaryColor, borderColor: primaryColor },
              pressed && { opacity: 0.9 },
            ]}>
            <ThemedText
              style={[
                styles.toDateChipText,
                { color: toDateEnabled ? onPrimaryText : mutedColor },
              ]}>
              To date
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <View style={[styles.chartWell, { backgroundColor: chartWellBg }]}>
        <View
          style={[styles.barsRow, { height: BAR_CHART_HEIGHT }]}
          accessible
          accessibilityLabel="Spending by day; bar height is relative to the highest-spending day this week">
          {bars.map((bar, index) => (
            <Pressable
              key={bar.key}
              style={styles.barTrack}
              onPress={() => onBarPress?.(index)}>
              <View
                style={[
                  styles.barFill,
                  {
                    height: `${bar.heightPct}%`,
                    backgroundColor: bar.isHighlight ? primaryColor : inactiveBarColor,
                    opacity: hasBarHighlight && !bar.isHighlight ? 0.35 : 1,
                  },
                ]}
              />
            </Pressable>
          ))}
        </View>
        <View style={styles.labelsRow}>
          {bars.map((bar) => (
            <View key={`${bar.key}-lab`} style={styles.labelCell}>
              <ThemedText
                style={[
                  styles.axisLabel,
                  { color: bar.isHighlight ? primaryColor : mutedColor },
                  bar.isHighlight && styles.axisLabelActive,
                ]}>
                {bar.shortLabel}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export default React.memo(SpendingChartInner);

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
  },
  headerBlock: {
    marginBottom: 14,
    gap: 10,
  },
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    letterSpacing: -0.2,
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navBtn: {
    padding: 4,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  weekLabel: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    minWidth: 70,
    textAlign: 'center',
  },
  chartWell: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 14,
  },
  toDateChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    alignItems: 'center',
    flexShrink: 0,
  },
  toDateChipText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  barTrack: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    minHeight: 4,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  labelCell: {
    flex: 1,
    alignItems: 'center',
  },
  axisLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  axisLabelActive: {
    fontFamily: Fonts.bold,
  },
});
