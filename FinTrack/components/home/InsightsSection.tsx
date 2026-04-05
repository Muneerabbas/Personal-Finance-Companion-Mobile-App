import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { CurrencyText } from '@/components/currency-text';
import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type InsightsSectionProps = {
  potentialSavingsUsd: number;
};

export default function InsightsSection({ potentialSavingsUsd }: InsightsSectionProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  const isOnTrack = potentialSavingsUsd >= 0;

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: isDark ? 'rgba(74, 222, 128, 0.15)' : '#DCFCE7' }]}>
            <Ionicons name="leaf-outline" size={18} color={isDark ? '#4ADE80' : '#15803D'} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={{ fontFamily: Fonts.sans, fontSize: 13, color: theme.muted }}>
              Potential savings
            </ThemedText>
            <CurrencyText
              amountUsd={Math.max(0, potentialSavingsUsd)}
              style={{ fontFamily: Fonts.bold, fontSize: 16, color: theme.text, marginTop: 2 }}
            />
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.row}>
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: isOnTrack ? (isDark ? 'rgba(139, 124, 255, 0.15)' : '#F3E8FF') : (isDark ? 'rgba(248, 113, 113, 0.15)' : '#FEE2E2') },
            ]}>
            <Ionicons
              name={isOnTrack ? 'bulb-outline' : 'warning-outline'}
              size={18}
              color={isOnTrack ? theme.primary : (isDark ? '#F87171' : '#DC2626')}
            />
          </View>
          <View style={{ flex: 1 }}>
            {isOnTrack ? (
              <ThemedText style={{ fontFamily: Fonts.sans, fontSize: 13, color: theme.muted, lineHeight: 18 }}>
                You are on track to save{' '}
                <CurrencyText
                  amountUsd={potentialSavingsUsd}
                  style={{ fontFamily: Fonts.semiBold, color: theme.primary }}
                />{' '}
                this month.
              </ThemedText>
            ) : (
              <ThemedText style={{ fontFamily: Fonts.sans, fontSize: 13, color: theme.muted, lineHeight: 18 }}>
                Reduce spending by{' '}
                <CurrencyText
                  amountUsd={Math.abs(potentialSavingsUsd)}
                  style={{ fontFamily: Fonts.semiBold, color: isDark ? '#F87171' : '#DC2626' }}
                />{' '}
                to stay within budget.
              </ThemedText>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 14,
    marginLeft: 48,
  },
});
