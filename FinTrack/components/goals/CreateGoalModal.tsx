import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, type KeyboardEvent, Platform, Pressable, StyleSheet, View } from 'react-native';
import type { TextInput as GHTextInput } from 'react-native-gesture-handler';

import PrimaryButton from '@/components/ui/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Fonts } from '@/constants/theme';
import {
  BottomSheetScrollView,
  BottomSheetTextInput,
  renderSheetBackdrop,
} from '@/context/bottom-sheet-context';
import { useCurrency } from '@/context/currency-context';
import { useThemeColor } from '@/hooks/use-theme-color';

function parseAmount(raw: string) {
  const cleaned = raw.replace(/[^0-9.]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function parseOptionalMonths(raw: string) {
  const cleaned = raw.replace(/\D/g, '');
  if (!cleaned) return null;
  const n = parseInt(cleaned, 10);
  if (!Number.isFinite(n) || n <= 0 || n > 600) return null;
  return n;
}

export type CreateGoalSubmitPayload = {
  title: string;
  target_amount: number;
  deadline: string | null;
  is_primary: boolean;
};

type CreateGoalModalProps = {
  visible: boolean;
  isFirstGoal: boolean;
  onClose: () => void;
  onCreate: (payload: CreateGoalSubmitPayload) => Promise<void>;
};

export default function CreateGoalModal({
  visible,
  isFirstGoal,
  onClose,
  onCreate,
}: CreateGoalModalProps) {
  const sheetRef = useRef<BottomSheetModal>(null);
  const titleRef = useRef<GHTextInput>(null);
  const [name, setName] = useState('');
  const [targetText, setTargetText] = useState('');
  const [durationMonthsText, setDurationMonthsText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);

  const { convertDisplayToUsd, currencySymbol } = useCurrency();
  const card = useThemeColor({}, 'card');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const background = useThemeColor({}, 'background');

  /** Taller snaps + extend keyboard mode so lower fields stay above the keyboard on Android. */
  const snapPoints = useMemo(() => ['85%', '97%'], []);
  const renderBackdrop = useCallback(renderSheetBackdrop, []);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.present();
      setName('');
      setTargetText('');
      setDurationMonthsText('');
      setError(null);
      setSubmitting(false);
      const t = setTimeout(() => titleRef.current?.focus(), 350);
      return () => clearTimeout(t);
    }
    sheetRef.current?.dismiss();
  }, [visible]);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const onShow = (e: KeyboardEvent) => {
      setKeyboardInset(e.endCoordinates.height);
    };
    const onHide = () => setKeyboardInset(0);
    const subShow = Keyboard.addListener(showEvt, onShow);
    const subHide = Keyboard.addListener(hideEvt, onHide);
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  const handleDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  const targetUsd = convertDisplayToUsd(parseAmount(targetText));
  const months = parseOptionalMonths(durationMonthsText);
  const canSubmit =
    name.trim().length > 0 && parseAmount(targetText) > 0 && !submitting && targetUsd > 0;

  const handleCreate = async () => {
    setError(null);
    const title = name.trim();
    if (!title) {
      setError('Enter a goal name.');
      return;
    }
    const displayVal = parseAmount(targetText);
    if (displayVal <= 0) {
      setError('Enter a target amount greater than zero.');
      return;
    }
    const usd = convertDisplayToUsd(displayVal);
    if (usd <= 0) {
      setError('Enter a valid target amount.');
      return;
    }

    let deadline: string | null = null;
    if (durationMonthsText.trim()) {
      const m = parseOptionalMonths(durationMonthsText);
      if (m == null) {
        setError('Duration: enter months between 1 and 600, or leave blank.');
        return;
      }
      const d = new Date();
      d.setMonth(d.getMonth() + m);
      deadline = d.toISOString();
    }

    setSubmitting(true);
    try {
      await onCreate({
        title,
        target_amount: usd,
        deadline,
        is_primary: isFirstGoal,
      });
      sheetRef.current?.dismiss();
    } catch (e) {
      const msg =
        e && typeof e === 'object' && 'message' in e && typeof (e as { message: unknown }).message === 'string'
          ? (e as { message: string }).message
          : e instanceof Error
            ? e.message
            : 'Could not create goal';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      name="createGoal"
      snapPoints={snapPoints}
      enablePanDownToClose
      keyboardBehavior="extend"
      keyboardBlurBehavior="none"
      android_keyboardInputMode="adjustResize"
      onDismiss={handleDismiss}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: card }}
      handleIndicatorStyle={{ backgroundColor: border }}>
      <BottomSheetScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 28 + keyboardInset + (Platform.OS === 'android' ? 24 : 12) },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.inner}>
          <ThemedText style={[styles.title, { color: text }]}>New goal</ThemedText>
          <ThemedText style={[styles.subtitle, { color: muted }]}>
            Name your goal, set a target, and optionally pick how long you plan to save.
          </ThemedText>

          <ThemedText style={[styles.fieldLabel, { color: muted }]}>Goal name</ThemedText>
          <BottomSheetTextInput
            ref={titleRef}
            value={name}
            onChangeText={(t) => {
              setName(t);
              setError(null);
            }}
            placeholder="e.g. Emergency fund"
            placeholderTextColor={muted}
            style={[
              styles.input,
              {
                color: text,
                borderColor: error && !name.trim() ? '#DC2626' : border,
                backgroundColor: background,
              },
            ]}
            autoCapitalize="sentences"
          />

          <ThemedText style={[styles.fieldLabel, { color: muted }]}>Target amount</ThemedText>
          <BottomSheetTextInput
            value={targetText}
            onChangeText={(t) => {
              setTargetText(t);
              setError(null);
            }}
            placeholder={currencySymbol ? `${currencySymbol}0` : '0'}
            placeholderTextColor={muted}
            keyboardType="decimal-pad"
            style={[
              styles.input,
              {
                color: text,
                borderColor: border,
                backgroundColor: background,
              },
            ]}
          />

          <ThemedText style={[styles.fieldLabel, { color: muted }]}>Target duration (optional)</ThemedText>
          <BottomSheetTextInput
            value={durationMonthsText}
            onChangeText={(t) => {
              setDurationMonthsText(t);
              setError(null);
            }}
            placeholder="Months from now"
            placeholderTextColor={muted}
            keyboardType="number-pad"
            style={[
              styles.input,
              {
                color: text,
                borderColor: border,
                backgroundColor: background,
              },
            ]}
          />
          {months != null ? (
            <ThemedText style={[styles.hint, { color: muted }]}>
              Deadline set to ~{months} month{months === 1 ? '' : 's'} from today.
            </ThemedText>
          ) : null}

          {error ? (
            <ThemedText style={styles.errorText} lightColor="#DC2626" darkColor="#F87171">
              {error}
            </ThemedText>
          ) : null}

          <PrimaryButton title="Create Goal" onPress={handleCreate} disabled={!canSubmit} loading={submitting} />

          <Pressable onPress={() => sheetRef.current?.dismiss()} style={styles.cancelBtn} hitSlop={12}>
            <ThemedText style={[styles.cancelText, { color: muted }]}>Cancel</ThemedText>
          </Pressable>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 22,
  },
  inner: {
    gap: 8,
    paddingTop: 4,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  fieldLabel: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  hint: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
  },
  input: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 4,
  },
  errorText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    marginTop: 4,
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
