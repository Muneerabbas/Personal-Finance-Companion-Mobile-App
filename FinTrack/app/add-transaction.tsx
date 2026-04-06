import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CategoryDropdown from '@/components/ui/category-dropdown';
import PrimaryButton from '@/components/ui/primary-button';
import { ThemedText } from '@/components/themed-text';
import { amountEntryStyles } from '@/constants/amount-entry-styles';
import { Colors, Fonts } from '@/constants/theme';
import { OTHER_CATEGORY_LABEL } from '@/constants/transaction-category-styles';
import { useAppAlert } from '@/context/app-alert-context';
import { useCurrency } from '@/context/currency-context';
import { dashboardMock } from '@/data/dashboard-mock';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { createTransactionPayload, createTransactionPayloadForUpdate } from '@/lib/transaction-helper';
import { useStore } from '@/store/useStore';

function displayAmountToInputText(displayAmount: number): string {
  if (!Number.isFinite(displayAmount)) return '';
  const s = displayAmount.toFixed(2).replace(/\.?0+$/, '');
  return s || '0';
}

function parseAmount(raw: string) {
  const cleaned = raw.replace(/[^0-9.]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

type TransactionType = 'income' | 'expense';

export default function AddTransactionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialType = (params.type as TransactionType) || 'expense';
  const editIdRaw = params.editId;
  const editId =
    typeof editIdRaw === 'string'
      ? editIdRaw
      : Array.isArray(editIdRaw)
        ? editIdRaw[0]
        : undefined;
  const isEditing = Boolean(editId);

  const [type, setType] = useState<TransactionType>(initialType);
  const addTransaction = useStore((state) => state.addTransaction);
  const updateExistingTransaction = useStore((state) => state.updateExistingTransaction);
  const transactions = useStore((state) => state.transactions);
  const syncInProgress = useStore((state) => state.syncInProgress);
  const isInitialSyncComplete = useStore((state) => state.isInitialSyncComplete);
  const { currencySymbol, convertDisplayToUsd, convertUsdToDisplay } = useCurrency();
  const { showAlert } = useAppAlert();
  const appliedEditIdRef = useRef<string | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];

  // Form State
  const [amountText, setAmountText] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [wallet, setWallet] = useState<string | null>(null);
  const [customWallet, setCustomWallet] = useState('');
  const [repeat, setRepeat] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onCategoryChange = (c: string) => {
    setCategory(c);
    if (c !== OTHER_CATEGORY_LABEL) setCustomCategory('');
  };

  const onWalletChange = (w: string) => {
    setWallet(w);
    if (w !== OTHER_CATEGORY_LABEL) setCustomWallet('');
  };

  useEffect(() => {
    if (!editId) {
      appliedEditIdRef.current = null;
      return;
    }
    const tx = transactions.find((t) => String(t.id) === String(editId));
    if (!tx) return;
    if (appliedEditIdRef.current === editId) return;
    appliedEditIdRef.current = editId;

    const nextType: TransactionType = tx.amount < 0 ? 'expense' : 'income';
    setType(nextType);

    const catOptions =
      nextType === 'income' ? dashboardMock.incomeCategories : dashboardMock.transactionCategories;
    if (tx.isOtherCategory === true) {
      setCategory(OTHER_CATEGORY_LABEL);
      setCustomCategory(tx.category);
    } else if (catOptions.includes(tx.category)) {
      setCategory(tx.category);
      setCustomCategory('');
    } else {
      setCategory(OTHER_CATEGORY_LABEL);
      setCustomCategory(tx.category);
    }

    const pm = (tx.paymentMethod || '').trim();
    const walletMatch = dashboardMock.wallets.find((w) => w.toLowerCase() === pm.toLowerCase());
    if (walletMatch) {
      setWallet(walletMatch);
      setCustomWallet('');
    } else {
      setWallet(OTHER_CATEGORY_LABEL);
      setCustomWallet(pm);
    }

    setDescription(tx.title || '');
    setAmountText(displayAmountToInputText(convertUsdToDisplay(Math.abs(Number(tx.amount)))));
  }, [editId, transactions, convertUsdToDisplay]);

  useEffect(() => {
    if (!editId || !isInitialSyncComplete || syncInProgress) return;
    const found = transactions.some((t) => String(t.id) === String(editId));
    if (!found) {
      showAlert({ title: 'Not found', message: 'This transaction is no longer available.' });
      router.back();
    }
  }, [editId, isInitialSyncComplete, syncInProgress, transactions, router, showAlert]);

  const submit = async () => {
    const amountUsd = convertDisplayToUsd(parseAmount(amountText));
    if (amountUsd <= 0) {
      showAlert({ title: 'Amount', message: 'Enter an amount greater than zero.' });
      return;
    }

    if (!category) {
      showAlert({ title: 'Category', message: 'Please choose a category.' });
      return;
    }
    if (category === OTHER_CATEGORY_LABEL && !customCategory.trim()) {
      showAlert({ title: 'Category', message: 'Please type a name for “Other”.' });
      return;
    }

    if (!wallet) {
      showAlert({ title: 'Wallet', message: 'Please choose a wallet or payment method.' });
      return;
    }
    if (wallet === OTHER_CATEGORY_LABEL && !customWallet.trim()) {
      showAlert({ title: 'Wallet', message: 'Please type a name for “Other”.' });
      return;
    }

    const walletLabel = wallet === OTHER_CATEGORY_LABEL ? customWallet.trim() : (wallet || '');
    const categoryLabel = category || '';

    setSubmitting(true);
    try {
      if (isEditing && editId) {
        const existing = transactions.find((t) => String(t.id) === String(editId));
        if (!existing) {
          showAlert({ title: 'Not found', message: 'This transaction is no longer available.' });
          return;
        }
        const createdAt = existing.date || new Date().toISOString();
        const payload = createTransactionPayloadForUpdate(
          {
            amount: amountUsd,
            type,
            category: categoryLabel,
            customCategory,
            note: description,
            wallet: walletLabel,
          },
          { id: existing.id, createdAt },
        );
        await updateExistingTransaction(existing.id, payload);
      } else {
        const payload = createTransactionPayload({
          amount: amountUsd,
          type,
          category: categoryLabel,
          customCategory,
          note: description,
          wallet: walletLabel,
        });
        await addTransaction(payload);
      }
      setTimeout(() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)');
        }
      }, 0);
    } catch {
      showAlert({ title: 'Could not save', message: 'Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const getHeaderColor = () => {
    if (type === 'income') return isDark ? '#10432F' : '#11A86C';
    return isDark ? '#3A0E16' : '#FF3B4E';
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: getHeaderColor() }]}>
      <View style={styles.headerArea}>
        <View style={styles.headerRow}>
          <View style={styles.headerSide}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <MaterialCommunityIcons name="arrow-left" size={26} color="#FFFFFF" />
            </Pressable>
          </View>
          <ThemedText style={styles.headerTitle} numberOfLines={1}>
            {isEditing
              ? type === 'income'
                ? 'Edit income'
                : 'Edit expense'
              : type === 'income'
                ? 'Income'
                : 'Expense'}
          </ThemedText>
          <View style={styles.headerSide} />
        </View>

        {/* Top Type Toggle */}
        <View style={styles.toggleContainer}>
          {(['expense', 'income'] as const).map((t) => (
            <Pressable
              key={t}
              style={[
                styles.toggleButton,
                type === t && styles.toggleButtonActive
              ]}
              onPress={() => setType(t)}
            >
              <Text style={[
                styles.toggleText,
                type === t && styles.toggleTextActive
              ]}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        <ThemedText style={styles.howMuch}>How much?</ThemedText>
        <View style={amountEntryStyles.amountRow}>
          <View style={amountEntryStyles.symbolWrap}>
            <Text style={amountEntryStyles.symbol}>{currencySymbol}</Text>
          </View>
          <View style={amountEntryStyles.inputOuter}>
            {!amountText ? (
              <Text pointerEvents="none" style={amountEntryStyles.amountPlaceholder}>
                0
              </Text>
            ) : null}
            <TextInput
              value={amountText}
              onChangeText={setAmountText}
              keyboardType="decimal-pad"
              underlineColorAndroid="transparent"
              style={amountEntryStyles.amountInput}
              autoFocus={true}
            />
          </View>
        </View>
      </View>

      <View style={[styles.formSheet, { backgroundColor: theme.card }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
          <CategoryDropdown
            sheetTitle="Category"
            options={type === 'income' ? dashboardMock.incomeCategories : dashboardMock.transactionCategories}
            value={category}
            onChange={onCategoryChange}
            placeholder="Category"
            otherFieldValue={customCategory}
            onOtherFieldChange={setCustomCategory}
          />
          <CategoryDropdown
            sheetTitle="Wallet"
            options={dashboardMock.wallets}
            value={wallet}
            onChange={onWalletChange}
            placeholder="Wallet"
            otherFieldValue={customWallet}
            onOtherFieldChange={setCustomWallet}
            otherFieldPlaceholder="Type wallet or payment method"
          />

          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            placeholderTextColor={theme.muted}
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
          />

          <Pressable style={[styles.attachment, { borderColor: theme.border, backgroundColor: theme.background }]}>
            <MaterialCommunityIcons name="paperclip" size={20} color={theme.muted} />
            <ThemedText style={{ color: theme.muted }}>Add attachment</ThemedText>
          </Pressable>

          <View style={styles.repeatRow}>
            <View>
              <ThemedText style={styles.repeatTitle}>Repeat</ThemedText>
              <ThemedText style={[styles.repeatSubtitle, { color: theme.muted }]}>Repeat transaction</ThemedText>
            </View>
            <Switch value={repeat} onValueChange={setRepeat} thumbColor="#FFFFFF" />
          </View>
        </ScrollView>

        <PrimaryButton
          title={isEditing ? 'Save changes' : 'Continue'}
          onPress={submit}
          style={styles.continueButton}
          loading={submitting}
          disabled={submitting}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  headerArea: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  headerSide: { width: 40, justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: Fonts.semiBold,
    fontSize: 20,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 16,
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  toggleText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  toggleTextActive: {
    color: '#000000',
  },
  howMuch: { color: 'rgba(255,255,255,0.85)', fontSize: 18, marginBottom: 10, fontFamily: Fonts.sans },
  formSheet: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  formContent: { padding: 16, gap: 12 },
  input: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontFamily: Fonts.sans,
    fontSize: 16,
    ...Platform.select({
      android: {
        textAlignVertical: 'center',
        includeFontPadding: false,
      },
      default: {},
    }),
  },
  attachment: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  repeatRow: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  repeatTitle: { fontFamily: Fonts.semiBold, fontSize: 18 },
  repeatSubtitle: { fontFamily: Fonts.sans, fontSize: 14, marginTop: 2 },
  continueButton: {
    margin: 16,
  },
});
