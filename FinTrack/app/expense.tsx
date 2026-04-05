import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
import { useTransactions } from '@/context/transactions-context';
import { dashboardMock } from '@/data/dashboard-mock';
import { useColorScheme } from '@/hooks/use-color-scheme';

function parseAmount(raw: string) {
  const cleaned = raw.replace(/[^0-9.]/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export default function ExpenseScreen() {
  const router = useRouter();
  const { addTransaction } = useTransactions();
  const { currencySymbol, convertDisplayToUsd } = useCurrency();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const [repeat, setRepeat] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [customCategory, setCustomCategory] = useState('');
  const [amountText, setAmountText] = useState('');
  const [description, setDescription] = useState('');
  const [wallet, setWallet] = useState<string | null>(null);
  const [customWallet, setCustomWallet] = useState('');

  const onCategoryChange = (c: string) => {
    setCategory(c);
    if (c !== OTHER_CATEGORY_LABEL) setCustomCategory('');
  };

  const onWalletChange = (w: string) => {
    setWallet(w);
    if (w !== OTHER_CATEGORY_LABEL) setCustomWallet('');
  };

  const submit = () => {
    const amountUsd = convertDisplayToUsd(parseAmount(amountText));
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
    if (amountUsd <= 0) {
      Alert.alert('Amount', 'Enter an amount greater than zero.');
      return;
    }
    const walletLabel = wallet === OTHER_CATEGORY_LABEL ? customWallet.trim() : wallet;
    addTransaction({
      kind: 'expense',
      categorySelection: category,
      customCategory,
      description,
      amount: amountUsd,
      wallet: walletLabel,
    });
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#3A0E16' : '#FF3B4E' }]}>
      <View style={styles.headerArea}>
        <View style={styles.headerRow}>
          <View style={styles.headerSide}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <MaterialCommunityIcons name="arrow-left" size={26} color="#FFFFFF" />
            </Pressable>
          </View>
          <ThemedText style={styles.headerTitle} numberOfLines={1}>
            Expense
          </ThemedText>
          <View style={styles.headerSide} />
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
            />
          </View>
        </View>
      </View>

      <View style={[styles.formSheet, { backgroundColor: theme.card }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
          <CategoryDropdown
            sheetTitle="Category"
            options={dashboardMock.transactionCategories}
            value={category}
            onChange={onCategoryChange}
            placeholder="Category"
            otherFieldValue={customCategory}
            onOtherFieldChange={setCustomCategory}
          />
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Description"
            placeholderTextColor={theme.muted}
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
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

        <PrimaryButton title="Continue" onPress={submit} style={styles.continueButton} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  headerArea: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  headerSide: { width: 40, justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: Fonts.semiBold,
    fontSize: 20,
    textAlign: 'center',
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
