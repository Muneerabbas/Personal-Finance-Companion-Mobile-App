import React from 'react';
import { Modal, View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { CurrencyText } from '@/components/currency-text';
import { Colors, Fonts } from '@/constants/theme';
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

export default function TransactionDetailModal({ visible, transaction, onClose }: TransactionDetailModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme];

  if (!transaction) return null;

  const isExpense = transaction.amount < 0;
  const isOther = transaction.isOtherCategory === true;
  const iconBg = isOther ? (isDark ? '#2A3045' : '#E8E8ED') : transaction.iconBackground;
  const iconCol = isOther ? (isDark ? '#9CA3AF' : '#6B7280') : transaction.iconColor;
  const iconName = isOther ? 'pricetag-outline' : transaction.icon;

  const amountColor = isExpense
    ? isDark ? '#F87171' : '#DC2626'
    : isDark ? '#4ADE80' : '#15803D';

  const typeBadgeColor = isExpense
    ? isDark ? '#3B1C1C' : '#FEE2E2'
    : isDark ? '#1C3B2A' : '#DCFCE7';

  const typeBadgeTextColor = isExpense
    ? isDark ? '#F87171' : '#DC2626'
    : isDark ? '#4ADE80' : '#15803D';

  const rows: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: 'Category', value: transaction.category, icon: 'folder-outline' },
    { label: 'Payment Method', value: (transaction.paymentMethod || '—').toUpperCase(), icon: 'card-outline' },
    { label: 'Date', value: formatFullDate(transaction.date), icon: 'calendar-outline' },
    { label: 'Time', value: formatFullTime(transaction.date), icon: 'time-outline' },
    { label: 'Type', value: isExpense ? 'Expense' : 'Income', icon: isExpense ? 'trending-down' : 'trending-up' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: isDark ? '#13172A' : '#FFFFFF' }]}>
          {/* Handle bar */}
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: isDark ? '#3A3F55' : '#D1D5DB' }]} />
          </View>

          {/* Close button */}
          <Pressable style={styles.closeBtn} onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={theme.muted} />
          </Pressable>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Icon + Title */}
            <View style={styles.heroSection}>
              <View style={[styles.heroIcon, { backgroundColor: iconBg }]}>  
                <Ionicons name={iconName} size={36} color={iconCol} />
              </View>
              <ThemedText style={[styles.heroTitle, { color: theme.text }]} numberOfLines={2}>
                {transaction.title}
              </ThemedText>

              {/* Amount */}
              <CurrencyText
                amountUsd={transaction.amount}
                signed
                style={[styles.heroAmount, { color: amountColor }]}
              />

              {/* Type badge */}
              <View style={[styles.typeBadge, { backgroundColor: typeBadgeColor }]}>
                <Ionicons
                  name={isExpense ? 'arrow-down-circle' : 'arrow-up-circle'}
                  size={14}
                  color={typeBadgeTextColor}
                />
                <ThemedText style={[styles.typeBadgeText, { color: typeBadgeTextColor }]}>
                  {isExpense ? 'Expense' : 'Income'}
                </ThemedText>
              </View>
            </View>

            {/* Detail rows */}
            <View style={[styles.detailCard, { backgroundColor: isDark ? '#1A1F35' : '#F9FAFB', borderColor: isDark ? '#232A3F' : '#E5E7EB' }]}>
              {rows.map((row, index) => (
                <View
                  key={row.label}
                  style={[
                    styles.detailRow,
                    index < rows.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: isDark ? '#232A3F' : '#E5E7EB' },
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

            {/* Transaction ID */}
            <ThemedText style={[styles.txId, { color: isDark ? '#4B5068' : '#9CA3AF' }]}>
              ID: {transaction.id}
            </ThemedText>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingBottom: 40,
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 20,
    zIndex: 10,
    padding: 4,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
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
