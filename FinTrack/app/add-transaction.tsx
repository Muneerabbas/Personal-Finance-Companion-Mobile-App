import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
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
import { useCurrency } from '@/context/currency-context';
import { dashboardMock } from '@/data/dashboard-mock';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { createTransactionPayload } from '@/lib/transaction-helper';
import { useStore } from '@/store/useStore';

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
  
  const [type, setType] = useState<TransactionType>(initialType);
  const addTransaction = useStore(state => state.addTransaction);
  const { currencySymbol, convertDisplayToUsd } = useCurrency();
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

  const submit = async () => {
    const amountUsd = convertDisplayToUsd(parseAmount(amountText));
    if (amountUsd <= 0) {
      Alert.alert('Amount', 'Enter an amount greater than zero.');
      return;
    }

    if (!category) {
      Alert.alert('Category', 'Please choose a category.');
      return;
    }
    if (category === OTHER_CATEGORY_LABEL && !customCategory.trim()) {
      Alert.alert('Category', 'Please type a name for “Other”.');
      return;
    }

    if (!wallet) {
      Alert.alert('Wallet', 'Please choose a wallet or payment method.');
      return;
    }
    if (wallet === OTHER_CATEGORY_LABEL && !customWallet.trim()) {
      Alert.alert('Wallet', 'Please type a name for “Other”.');
      return;
    }

    const walletLabel = wallet === OTHER_CATEGORY_LABEL ? customWallet.trim() : (wallet || '');
    const categoryLabel = category || '';

    const payload = createTransactionPayload({
      amount: amountUsd,
      type,
      category: categoryLabel,
      customCategory,
      note: description,
      wallet: walletLabel,
    });

    setSubmitting(true);
    try {
      await addTransaction(payload);
      setTimeout(() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)');
        }
      }, 0);
    } catch {
      Alert.alert('Could not save', 'Please try again.');
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
            {type === 'income' ? 'Income' : 'Expense'}
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
          title="Continue"
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
