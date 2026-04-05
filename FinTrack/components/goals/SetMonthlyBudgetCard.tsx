import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import SetMonthlyBudgetModal from '@/components/goals/SetMonthlyBudgetModal';
import { CurrencyText } from '@/components/currency-text';
import PrimaryButton from '@/components/ui/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useStore } from '@/store/useStore';

const FALLBACK_BUDGET_USD = 2500;

/** Opens bottom-sheet modal (same pattern as Add Funds) to set monthly budget — not the old ring widget. */
export default function SetMonthlyBudgetCard() {
  const [modalVisible, setModalVisible] = useState(false);
  const monthlyBudget = useStore((state) => state.monthlyBudget);
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');

  const effectiveUsd = monthlyBudget || FALLBACK_BUDGET_USD;
  const hasSavedBudget = monthlyBudget != null;

  return (
    <View style={[styles.wrap, { backgroundColor: card, borderColor: border }]}>
      <View style={styles.copyBlock}>
        <ThemedText style={[styles.label, { color: muted }]}>Monthly budget</ThemedText>
        <View style={styles.amountRow}>
          <CurrencyText amountUsd={effectiveUsd} style={[styles.amount, { color: text }]} />
          {!hasSavedBudget ? (
            <ThemedText style={[styles.defaultHint, { color: muted }]}> (default)</ThemedText>
          ) : null}
        </View>
      </View>
      <PrimaryButton
        title="Set budget"
        onPress={() => setModalVisible(true)}
        style={styles.primaryBtn}
      />

      <SetMonthlyBudgetModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  copyBlock: {
    gap: 6,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 13,
  },
  amountRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: 4,
  },
  amount: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    letterSpacing: -0.3,
  },
  defaultHint: {
    fontFamily: Fonts.sans,
    fontSize: 13,
  },
  primaryBtn: {
    alignSelf: 'stretch',
    borderRadius: 14,
    height: 52,
  },
});
