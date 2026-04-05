import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { CurrencyText } from '@/components/currency-text';
import PrimaryButton from '@/components/ui/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import { useCurrency } from '@/context/currency-context';
import { useThemeColor } from '@/hooks/use-theme-color';

function parseAmount(raw: string) {
  const cleaned = raw.replace(/[^0-9.]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

type AddToGoalModalProps = {
  visible: boolean;
  goalTitle: string;
  goalId: string;
  /** Net balance in USD (stored amounts) */
  availableBalanceUsd: number;
  onClose: () => void;
  onAllocate: (amountUsd: number) => Promise<void>;
};

export default function AddToGoalModal({
  visible,
  goalTitle,
  goalId,
  availableBalanceUsd,
  onClose,
  onAllocate,
}: AddToGoalModalProps) {
  const inputRef = useRef<TextInput>(null);
  const [amountText, setAmountText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { convertDisplayToUsd, currencySymbol } = useCurrency();
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const background = useThemeColor({}, 'background');

  useEffect(() => {
    if (visible) {
      setAmountText('');
      setError(null);
      setSubmitting(false);
      const t = setTimeout(() => inputRef.current?.focus(), 300);
      return () => clearTimeout(t);
    }
  }, [visible, goalId]);

  const amountUsdPreview = convertDisplayToUsd(parseAmount(amountText));
  const exceedsBalance = amountUsdPreview > availableBalanceUsd + 1e-6;
  const canSubmit =
    parseAmount(amountText) > 0 && !exceedsBalance && !submitting && availableBalanceUsd > 0;

  const handleAllocate = async () => {
    setError(null);
    const displayVal = parseAmount(amountText);
    if (displayVal <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }
    const usd = convertDisplayToUsd(displayVal);
    if (usd > availableBalanceUsd + 1e-6) {
      setError('Insufficient balance');
      return;
    }
    setSubmitting(true);
    try {
      await onAllocate(usd);
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      setError(msg === 'Insufficient balance' ? 'Insufficient balance' : msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={[styles.sheet, { backgroundColor: card, borderColor: border }]}>
              <View style={[styles.handle, { backgroundColor: border }]} />
              <ThemedText style={[styles.title, { color: text }]}>Add Funds</ThemedText>
              <ThemedText style={[styles.subtitle, { color: muted }]} numberOfLines={2}>
                {goalTitle}
              </ThemedText>

              <ThemedText style={[styles.balanceLabel, { color: muted }]}>
                Available balance:{' '}
                <CurrencyText amountUsd={availableBalanceUsd} style={{ color: text, fontFamily: Fonts.semiBold }} />
              </ThemedText>
              {availableBalanceUsd <= 0 ? (
                <ThemedText style={[styles.hint, { color: muted }]}>
                  Add income or reduce expenses to build a positive balance before allocating to goals.
                </ThemedText>
              ) : null}

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
                autoFocus
              />

              {error ? (
                <ThemedText style={styles.errorText} lightColor="#DC2626" darkColor="#F87171">
                  {error}
                </ThemedText>
              ) : null}

              <PrimaryButton
                title="Allocate"
                onPress={handleAllocate}
                disabled={!canSubmit}
                loading={submitting}
              />

              <Pressable onPress={onClose} style={styles.cancelBtn} hitSlop={12}>
                <ThemedText style={[styles.cancelText, { color: muted }]}>Cancel</ThemedText>
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  keyboard: { width: '100%' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
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
  balanceLabel: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    marginTop: 4,
  },
  hint: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
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
