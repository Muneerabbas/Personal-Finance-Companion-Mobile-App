import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type KeyboardEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CurrencyText } from '@/components/currency-text';
import PrimaryButton from '@/components/ui/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useCurrency } from '@/context/currency-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useStore } from '@/store/useStore';

function parseAmount(raw: string) {
  const cleaned = raw.replace(/[^0-9.]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

const FALLBACK_BUDGET_USD = 2500;

type SetMonthlyBudgetModalProps = {
  visible: boolean;
  onClose: () => void;
};

export default function SetMonthlyBudgetModal({ visible, onClose }: SetMonthlyBudgetModalProps) {
  const inputRef = useRef<TextInput>(null);
  const [amountText, setAmountText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const insets = useSafeAreaInsets();

  const monthlyBudget = useStore((state) => state.monthlyBudget);
  const setBudget = useStore((state) => state.setBudget);
  const { convertDisplayToUsd, currencySymbol } = useCurrency();

  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const background = useThemeColor({}, 'background');

  const hasSavedBudget = monthlyBudget != null;
  const effectiveUsd = monthlyBudget || FALLBACK_BUDGET_USD;

  useEffect(() => {
    if (visible) {
      setAmountText('');
      setError(null);
      setSubmitting(false);
      const t = setTimeout(() => inputRef.current?.focus(), 350);
      return () => clearTimeout(t);
    }
    setKeyboardHeight(0);
  }, [visible]);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e: KeyboardEvent) => {
      setKeyboardHeight(e.endCoordinates.height);
    };
    const onHide = () => setKeyboardHeight(0);

    const subShow = Keyboard.addListener(showEvent, onShow);
    const subHide = Keyboard.addListener(hideEvent, onHide);
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  const displayVal = parseAmount(amountText);
  const canSubmit = displayVal > 0 && !submitting;

  const handleSave = async () => {
    setError(null);
    if (displayVal <= 0) {
      setError('Enter a monthly budget greater than zero.');
      return;
    }
    const usd = convertDisplayToUsd(displayVal);
    if (usd <= 0) {
      setError('Enter a valid amount.');
      return;
    }
    setSubmitting(true);
    try {
      await setBudget(usd);
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not save budget';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const closeIfAllowed = useCallback(() => {
    if (submitting) return;
    onClose();
  }, [onClose, submitting]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={closeIfAllowed}>
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={closeIfAllowed}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />
        <View
          style={[
            styles.sheetLift,
            {
              marginBottom: keyboardHeight,
            },
          ]}>
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: card,
                borderColor: border,
                paddingBottom: Math.max(insets.bottom, 20),
              },
            ]}>
            <View style={[styles.handlePill, { backgroundColor: border }]} />
            <View style={styles.sheetBody}>
              <ThemedText style={[styles.title, { color: text }]}>Monthly budget</ThemedText>
              <ThemedText style={[styles.subtitle, { color: muted }]} numberOfLines={3}>
                Sets your monthly spending limit .
              </ThemedText>

              <View style={styles.currentRow}>
                <ThemedText style={[styles.balanceLabel, { color: muted }]}>Current limit: </ThemedText>
                <CurrencyText
                  amountUsd={effectiveUsd}
                  style={{ color: text, fontFamily: Fonts.semiBold, fontSize: 14 }}
                />
                {!hasSavedBudget ? (
                  <ThemedText style={[styles.balanceLabel, { color: muted }]}> (default)</ThemedText>
                ) : null}
              </View>

              <TextInput
                ref={inputRef}
                value={amountText}
                onChangeText={(t) => {
                  setAmountText(t);
                  setError(null);
                }}
                placeholder={currencySymbol ? `${currencySymbol}0` : '0'}
                placeholderTextColor={muted}
                keyboardType="decimal-pad"
                style={[
                  styles.input,
                  {
                    color: text,
                    borderColor: error ? '#DC2626' : border,
                    backgroundColor: background,
                  },
                ]}
              />

              {error ? (
                <ThemedText style={styles.errorText} lightColor="#DC2626" darkColor="#F87171">
                  {error}
                </ThemedText>
              ) : null}

              <PrimaryButton title="Save budget" onPress={handleSave} disabled={!canSubmit} loading={submitting} />

              <Pressable onPress={closeIfAllowed} style={styles.cancelBtn} hitSlop={12}>
                <ThemedText style={[styles.cancelText, { color: muted }]}>Cancel</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheetLift: {
    width: '100%',
    maxHeight: '88%',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexShrink: 1,
  },
  handlePill: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 10,
    marginBottom: 4,
    opacity: 0.6,
  },
  sheetBody: {
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 12,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    marginTop: -4,
  },
  currentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  balanceLabel: {
    fontFamily: Fonts.sans,
    fontSize: 14,
  },
  input: {
    fontFamily: Fonts.semiBold,
    fontSize: 22,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 8,
  },
  errorText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
  },
  cancelBtn: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  cancelText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
  },
});
