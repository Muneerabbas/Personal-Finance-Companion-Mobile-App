import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ChartPoint = {
  value: number;
  label: string;
  amountUsd: number;
};

type SpendingChartProps = {
  data: ChartPoint[];
};

const BAR_CHART_HEIGHT = 140;
const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;
const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

function labelToShortUpper(label: string, index: number): string {
  const raw = label.trim();
  const upper = raw.toUpperCase();
  if (upper.length <= 3 && /^[A-Z]+$/.test(upper)) {
    return upper;
  }
  const match = DAY_LABELS.find((d) => upper.startsWith(d.slice(0, 2)));
  if (match) return match;
  return DAY_LABELS[index] ?? upper.slice(0, 3);
}

function SpendingChartInner({ data }: SpendingChartProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const mutedColor = useThemeColor({}, 'muted');
  const primaryColor = useThemeColor({}, 'primary');
  const cardBg = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  const series = useMemo(() => {
    const sliced = data.slice(0, 7);
    const out: ChartPoint[] = [...sliced];
    while (out.length < 7) {
      const i = out.length;
      out.push({ value: 0, label: WEEKDAY_SHORT[i], amountUsd: 0 });
    }
    return out;
  }, [data]);

  const highlightIndex = useMemo(() => {
    let best = 0;
    for (let i = 1; i < series.length; i++) {
      if (series[i].value > series[best].value) best = i;
    }
    return best;
  }, [series]);

  const bars = useMemo(() => {
    const maxV = Math.max(...series.map((d) => d.value), 1);
    return series.map((point, index) => {
      const heightPct = Math.max(12, Math.round((point.value / maxV) * 100));
      const isHighlight = index === highlightIndex;
      return {
        key: `${point.label}-${index}`,
        heightPct,
        isHighlight,
        shortLabel: labelToShortUpper(point.label, index),
      };
    });
  }, [series, highlightIndex]);

  const inactiveBarColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)';
  const chartWellBg = isDark ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.04)';

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
      <View style={styles.headerRow}>
        <ThemedText style={styles.title}>Weekly Spending</ThemedText>
        <ThemedText style={[styles.rangeCaps, { color: primaryColor }]}>Last 7 days</ThemedText>
      </View>

      <View style={[styles.chartWell, { backgroundColor: chartWellBg }]}>
        <View
          style={[styles.barsRow, { height: BAR_CHART_HEIGHT }]}
          accessible
          accessibilityLabel="Spending by day for the last seven days">
          {bars.map((bar) => (
            <View key={bar.key} style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    height: `${bar.heightPct}%`,
                    backgroundColor: bar.isHighlight ? primaryColor : inactiveBarColor,
                  },
                ]}
              />
            </View>
          ))}
        </View>
        <View style={styles.labelsRow}>
          {bars.map((bar) => (
            <View key={`${bar.key}-lab`} style={styles.labelCell}>
              <ThemedText
                style={[
                  styles.axisLabel,
                  { color: bar.isHighlight ? primaryColor : mutedColor },
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    letterSpacing: -0.2,
  },
  rangeCaps: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  chartWell: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 20,
    paddingBottom: 14,
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
});
