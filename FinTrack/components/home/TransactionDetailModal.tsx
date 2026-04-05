import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CurrencyText } from '@/components/currency-text';
import { Colors, Fonts } from '@/constants/theme';
import {
  getCategoryDisplayLabel,
  GOAL_ALLOCATION_DISPLAY_LABEL,
  isGoalAllocationCategory,
} from '@/constants/transaction-category-styles';
import { BottomSheetScrollView, renderSheetBackdrop } from '@/context/bottom-sheet-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Transaction } from './TransactionItem';

type TransactionDetailModalProps = {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
};

function formatFullDate(dateStr?: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatFullTime(dateStr?: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function TransactionDetailBody({ transaction: tx }: { transaction: Transaction }) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme];

  const isExpense = tx.amount < 0;
  const isGoalAllocation = isGoalAllocationCategory(tx.category);
  const isOther = tx.isOtherCategory === true;
  const iconBg = isOther ? (isDark ? '#2A3045' : '#E8E8ED') : tx.iconBackground;
  const iconCol = isOther ? (isDark ? '#9CA3AF' : '#6B7280') : tx.iconColor;
  const iconName = isOther ? 'pricetag-outline' : tx.icon;

  const amountColor = isGoalAllocation
    ? isDark
      ? '#A78BFA'
      : tx.iconColor || '#6D28D9'
    : isExpense
      ? isDark
        ? '#F87171'
        : '#DC2626'
      : isDark
        ? '#4ADE80'
        : '#15803D';

  const typeBadgeColor = isGoalAllocation
    ? isDark
      ? '#2E1065'
      : '#EDE9FE'
    : isExpense
      ? isDark
        ? '#3B1C1C'
        : '#FEE2E2'
      : isDark
        ? '#1C3B2A'
        : '#DCFCE7';

  const typeBadgeTextColor = isGoalAllocation
    ? isDark
      ? '#C4B5FD'
      : '#5B21B6'
    : isExpense
      ? isDark
        ? '#F87171'
        : '#DC2626'
      : isDark
        ? '#4ADE80'
        : '#15803D';

  const rows: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: 'Category', value: getCategoryDisplayLabel(tx.category), icon: 'folder-outline' },
    {
      label: 'Payment Method',
      value: (isGoalAllocation ? 'Goal' : tx.paymentMethod || '—').toUpperCase(),
      icon: 'card-outline',
    },
    { label: 'Date', value: formatFullDate(tx.date), icon: 'calendar-outline' },
    { label: 'Time', value: formatFullTime(tx.date), icon: 'time-outline' },
    {
      label: 'Type',
      value: isGoalAllocation ? GOAL_ALLOCATION_DISPLAY_LABEL : isExpense ? 'Expense' : 'Income',
      icon: isGoalAllocation ? 'flag' : isExpense ? 'trending-down' : 'trending-up',
    },
  ];

  return (
    <BottomSheetScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.heroSection}>
        <View style={[styles.heroIcon, { backgroundColor: iconBg }]}>
          <Ionicons name={iconName} size={36} color={iconCol} />
        </View>
        <ThemedText style={[styles.heroTitle, { color: theme.text }]} numberOfLines={2}>
          {tx.title}
        </ThemedText>

        <CurrencyText amountUsd={tx.amount} signed style={[styles.heroAmount, { color: amountColor }]} />

        <View style={[styles.typeBadge, { backgroundColor: typeBadgeColor }]}>
          <Ionicons
            name={isGoalAllocation ? 'flag' : isExpense ? 'arrow-down-circle' : 'arrow-up-circle'}
            size={14}
            color={typeBadgeTextColor}
          />
          <ThemedText style={[styles.typeBadgeText, { color: typeBadgeTextColor }]}>
            {isGoalAllocation ? GOAL_ALLOCATION_DISPLAY_LABEL : isExpense ? 'Expense' : 'Income'}
          </ThemedText>
        </View>
      </View>

      <View
        style={[
          styles.detailCard,
          { backgroundColor: isDark ? '#1A1F35' : '#F9FAFB', borderColor: isDark ? '#232A3F' : '#E5E7EB' },
        ]}>
        {rows.map((row, index) => (
          <View
            key={row.label}
            style={[
              styles.detailRow,
              index < rows.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: isDark ? '#232A3F' : '#E5E7EB',
              },
            ]}>
            <View style={styles.detailLabelRow}>
              <Ionicons name={row.icon} size={18} color={theme.muted} style={{ marginRight: 10 }} />
              <ThemedText style={[styles.detailLabel, { color: theme.muted }]}>{row.label}</ThemedText>
            </View>
            <ThemedText style={[styles.detailValue, { color: theme.text }]} numberOfLines={1}>
              {row.value}
            </ThemedText>
          </View>
        ))}
      </View>

      <ThemedText style={[styles.txId, { color: isDark ? '#4B5068' : '#9CA3AF' }]}>ID: {tx.id}</ThemedText>
    </BottomSheetScrollView>
  );
}

export default function TransactionDetailModal({ visible, transaction, onClose }: TransactionDetailModalProps) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const snapPoints = useMemo(() => ['78%', '95%'], []);
  const renderBackdrop = useCallback(renderSheetBackdrop, []);

  useEffect(() => {
    if (visible && transaction) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [visible, transaction]);

  const handleDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <BottomSheetModal
      ref={sheetRef}
      name="transactionDetail"
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={handleDismiss}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: isDark ? '#13172A' : '#FFFFFF' }}
      handleIndicatorStyle={{ backgroundColor: isDark ? '#3A3F55' : '#D1D5DB' }}>
      <Pressable style={styles.closeBtn} onPress={() => sheetRef.current?.dismiss()} hitSlop={12}>
        <Ionicons name="close" size={24} color={Colors[colorScheme].muted} />
      </Pressable>
      {transaction ? <TransactionDetailBody transaction={transaction} /> : <View style={styles.emptyStub} />}
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  emptyStub: {
    minHeight: 1,
  },
  closeBtn: {
    position: 'absolute',
    top: 8,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 28,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroAmount: {
    fontFamily: Fonts.bold,
    fontSize: 32,
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  typeBadgeText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
  },
  detailCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 4,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: Fonts.sans,
    fontSize: 14,
  },
  detailValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    maxWidth: '55%',
    textAlign: 'right',
  },
  txId: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
