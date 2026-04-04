import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { CurrencyText } from '@/components/currency-text';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ChartPoint = {
  value: number;
  label: string;
  amountUsd: number;
};

type SpendingChartProps = {
  data: ChartPoint[];
  activePointIndex?: number;
  headerAccessory?: React.ReactNode;
};

const CHART_HEIGHT = 210;
const H_PAD = 10;
const V_PAD_TOP = 22;
const V_PAD_BOTTOM = 10;
const STROKE_WIDTH = 3;

function clampIndex(index: number, length: number) {
  if (length <= 0) return 0;
  return Math.max(0, Math.min(index, length - 1));
}

function smoothLinePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i === 0 ? points[0] : points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i + 2 < points.length ? points[i + 2] : p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function SpendingChartInner({
  data,
  activePointIndex = data.length - 1,
  headerAccessory,
}: SpendingChartProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme];
  const { width: screenW } = useWindowDimensions();
  const widthFallback = Math.max(screenW - 68, 220);
  const [plotWidth, setPlotWidth] = useState(0);
  const chartWidth = plotWidth > 0 ? plotWidth : widthFallback;

  const onChartLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setPlotWidth((prev) => (Math.abs(w - prev) > 0.5 ? w : prev));
  }, []);

  const [selectedIndex, setSelectedIndex] = useState(() =>
    clampIndex(activePointIndex, data.length),
  );

  useEffect(() => {
    setSelectedIndex(clampIndex(activePointIndex, data.length));
  }, [activePointIndex, data]);

  const innerW = chartWidth - H_PAD * 2;
  const innerH = CHART_HEIGHT - V_PAD_TOP - V_PAD_BOTTOM;
  const baseY = V_PAD_TOP + innerH;

  const { linePath, fillPath, points } = useMemo(() => {
    if (data.length === 0) {
      return { linePath: '', fillPath: '', points: [] as { x: number; y: number }[] };
    }
    const maxV = Math.max(...data.map((d) => d.value), 0) + 8;
    const n = data.length;
    const pts = data.map((item, i) => {
      const x = H_PAD + (n === 1 ? innerW / 2 : (i / (n - 1)) * innerW);
      const y = V_PAD_TOP + innerH * (1 - item.value / maxV);
      return { x, y };
    });
    const line = smoothLinePath(pts);
    if (!line) {
      return { linePath: '', fillPath: '', points: pts };
    }
    const last = pts[pts.length - 1];
    const first = pts[0];
    const fill = `${line} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`;
    return { linePath: line, fillPath: fill, points: pts };
  }, [data, innerW, innerH, baseY]);

  const safeIndex = clampIndex(selectedIndex, data.length);
  const selectedItem = data[safeIndex];
  const selPoint = points[safeIndex];

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      if (data.length <= 1) return;
      const x = e.nativeEvent.locationX;
      const rel = x - H_PAD;
      const t = rel / innerW;
      const idx = Math.round(Math.max(0, Math.min(1, t)) * (data.length - 1));
      setSelectedIndex(idx);
    },
    [data.length, innerW],
  );

  const gradientId = React.useId().replace(/:/g, '');
  const primary = theme.primary;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#171B2B' : '#F7F7F8',
          borderColor: isDark ? '#232A3F' : '#ECECF1',
        },
      ]}>
      <ThemedText style={[styles.title, { color: isDark ? '#F5F7FF' : '#232836' }]}>Spending Trends</ThemedText>
      <ThemedText style={[styles.subtitle, { color: isDark ? '#8D95B2' : '#7B8195' }]}>
        Visualization of your editorial cashflow
      </ThemedText>
      {headerAccessory ? <View style={styles.filterWrap}>{headerAccessory}</View> : null}

      {selectedItem ? (
        <View
          style={[
            styles.summary,
            {
              backgroundColor: isDark ? '#232A40' : '#FFFFFF',
              borderColor: isDark ? '#343D59' : '#EEF0F6',
            },
          ]}>
          <Text style={[styles.summaryDate, { color: isDark ? '#98A1BC' : '#9298AA' }]}>
            {selectedItem.label}
          </Text>
          <CurrencyText
            amountUsd={selectedItem.amountUsd}
            style={[styles.summaryAmount, { color: primary }]}
          />
        </View>
      ) : null}

      <View
        style={[
          styles.chartWrap,
          { backgroundColor: isDark ? '#1C2234' : '#F1F1F2' },
        ]}>
        <View style={styles.chartSurface} onLayout={onChartLayout}>
          {linePath ? (
            <Svg width={chartWidth} height={CHART_HEIGHT} viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}>
              <Defs>
                <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={primary} stopOpacity={isDark ? 0.32 : 0.24} />
                  <Stop offset="1" stopColor={primary} stopOpacity={0.02} />
                </LinearGradient>
              </Defs>
              <Path d={fillPath} fill={`url(#${gradientId})`} />
              <Path
                d={linePath}
                fill="none"
                stroke={primary}
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {selPoint ? (
                <Circle
                  cx={selPoint.x}
                  cy={selPoint.y}
                  r={6}
                  fill="#FFFFFF"
                  stroke={primary}
                  strokeWidth={3}
                />
              ) : null}
            </Svg>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Spending chart, tap to select a day"
            onPress={handlePress}
            disabled={data.length === 0}
            style={StyleSheet.absoluteFill}
          />
        </View>
      </View>
    </View>
  );
}

export default React.memo(SpendingChartInner);

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    marginBottom: 14,
  },
  filterWrap: {
    marginBottom: 14,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  summaryDate: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
  },
  summaryAmount: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
  },
  chartWrap: {
    borderRadius: 28,
    overflow: 'hidden',
    paddingTop: 12,
    paddingHorizontal: 0,
    paddingBottom: 10,
  },
  chartSurface: {
    height: CHART_HEIGHT,
    width: '100%',
    position: 'relative',
  },
});
