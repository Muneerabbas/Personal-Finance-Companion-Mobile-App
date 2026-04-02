import { StyleSheet, Text, View } from 'react-native';
import { Defs, LinearGradient, Path, Stop, Svg } from 'react-native-svg';

import { Fonts } from '@/constants/theme';

type SpendingChartProps = {
  data: number[];
};

const CHART_WIDTH = 340;
const CHART_HEIGHT = 180;

function createSmoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return '';

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i += 1) {
    const current = points[i];
    const next = points[i + 1];
    const controlPointX = (current.x + next.x) / 2;

    d += ` C ${controlPointX} ${current.y}, ${controlPointX} ${next.y}, ${next.x} ${next.y}`;
  }

  return d;
}

export default function SpendingChart({ data }: SpendingChartProps) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(max - min, 1);

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * CHART_WIDTH;
    const y = CHART_HEIGHT - ((value - min) / range) * (CHART_HEIGHT - 12);

    return { x, y };
  });

  const linePath = createSmoothPath(points);
  const areaPath = `${linePath} L ${CHART_WIDTH} ${CHART_HEIGHT} L 0 ${CHART_HEIGHT} Z`;

  return (
    <View>
      <Text style={styles.title}>Spending Trends</Text>
      <View style={styles.chartWrap}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          <Defs>
            <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#7F3DFF" stopOpacity="0.25" />
              <Stop offset="1" stopColor="#7F3DFF" stopOpacity="0.03" />
            </LinearGradient>
          </Defs>

          <Path d={areaPath} fill="url(#chartGradient)" />
          <Path d={linePath} stroke="#7F3DFF" strokeWidth={5} fill="none" strokeLinecap="round" />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: '#111827',
    marginBottom: 10,
  },
  chartWrap: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
});
