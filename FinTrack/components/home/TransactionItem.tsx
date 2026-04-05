import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CurrencyText } from '@/components/currency-text';
import { ThemedText } from '@/components/themed-text';
import { getCategoryDisplayLabel, isGoalAllocationCategory } from '@/constants/transaction-category-styles';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type Transaction = {
  id: string;
  title: string;
  category: string;
  timeLabel: string;
  amount: number;
  paymentMethod: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconBackground: string;
  iconColor: string;
  /** Raw ISO date string from DB for grouping/filtering */
  date?: string;
  /** Custom "Other" category — grey tag icon in UI */
  isOtherCategory?: boolean;
};

type TransactionItemProps = {
  item: Transaction;
  onPress?: (item: Transaction) => void;
};

export default function TransactionItem({ item, onPress }: TransactionItemProps) {
  const isExpense = item.amount < 0;
  const isGoalAllocation = isGoalAllocationCategory(item.category);
  const isDark = (useColorScheme() ?? 'light') === 'dark';
  const metaLine = `${getCategoryDisplayLabel(item.category)} • ${item.timeLabel}`;
  const isOther = item.isOtherCategory === true;
  const iconBg = isOther ? (isDark ? '#2A3045' : '#E8E8ED') : item.iconBackground;
  const iconCol = isOther ? (isDark ? '#9CA3AF' : '#6B7280') : item.iconColor;
  const iconName = isOther ? 'pricetag-outline' : item.icon;

  const amountColor = isGoalAllocation
    ? isDark
      ? '#A78BFA'
      : item.iconColor || '#6D28D9'
    : isExpense
      ? isDark
        ? '#F87171'
        : '#DC2626'
      : isDark
        ? '#4ADE80'
        : '#15803D';

  return (
    <Pressable
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: isDark ? '#171B2B' : '#FFFFFF',
          borderColor: isDark ? '#232A3F' : '#E8E8ED',
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={24} color={iconCol} />
      </View>

      <View style={styles.meta}>
        <ThemedText
          style={[styles.title, { color: isDark ? '#F5F7FF' : '#111827' }]}
          numberOfLines={2}
          ellipsizeMode="tail">
          {item.title}
        </ThemedText>
        <ThemedText
          style={[styles.metaLine, { color: isDark ? '#8D95B2' : '#6B7280' }]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {metaLine}
        </ThemedText>
      </View>

      <View style={styles.amountColumn}>
        <CurrencyText
          amountUsd={item.amount}
          signed
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[styles.amount, { color: amountColor }]}
        />
        <Text
          style={[styles.paymentMethod, { color: isDark ? '#6B7280' : '#9CA3AF' }]}
          numberOfLines={1}>
          {(isGoalAllocation ? 'Towards goal' : item.paymentMethod || '').toUpperCase()}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  meta: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
    minWidth: 0,
    overflow: 'hidden',
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
    flexShrink: 1,
  },
  metaLine: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 13,
    lineHeight: 18,
    flexShrink: 1,
  },
  amountColumn: {
    alignItems: 'flex-end',
    flexShrink: 0,
    flexGrow: 0,
    maxWidth: '42%',
    minWidth: 72,
    paddingTop: 2,
  },
  amount: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 17,
    marginBottom: 4,
  },
  paymentMethod: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 10,
    letterSpacing: 0.6,
    maxWidth: 120,
    textAlign: 'right',
  },
});
