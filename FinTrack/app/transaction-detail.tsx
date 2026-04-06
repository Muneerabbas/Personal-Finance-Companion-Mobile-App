import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { TransactionDetailBodyContent } from '@/components/home/TransactionDetailBody';
import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts } from '@/constants/theme';
import { isGoalAllocationCategory } from '@/constants/transaction-category-styles';
import { useAppAlert } from '@/context/app-alert-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStore } from '@/store/useStore';

function paramToString(v: string | string[] | undefined): string | undefined {
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && v[0]) return v[0];
  return undefined;
}

export default function TransactionDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const txId = paramToString(params.id);
  const transactions = useStore((s) => s.transactions);
  const isInitialSyncComplete = useStore((s) => s.isInitialSyncComplete);
  const syncInProgress = useStore((s) => s.syncInProgress);
  const removeTransaction = useStore((s) => s.removeTransaction);
  const { showAlert } = useAppAlert();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme];
  const [deleting, setDeleting] = useState(false);
  const notFoundHandledRef = useRef(false);

  const transaction = useMemo(
    () => (txId ? transactions.find((t) => String(t.id) === String(txId)) : undefined),
    [transactions, txId],
  );

  useEffect(() => {
    notFoundHandledRef.current = false;
  }, [txId]);

  useEffect(() => {
    if (!txId) {
      router.back();
    }
  }, [txId, router]);

  useEffect(() => {
    if (!txId || !isInitialSyncComplete || syncInProgress || notFoundHandledRef.current) return;
    const found = transactions.some((t) => String(t.id) === String(txId));
    if (!found) {
      notFoundHandledRef.current = true;
      showAlert({ title: 'Not found', message: 'This transaction is no longer available.' });
      router.back();
    }
  }, [txId, isInitialSyncComplete, syncInProgress, transactions, router, showAlert]);

  const canMutate = Boolean(transaction && !isGoalAllocationCategory(transaction.category));

  const openEdit = useCallback(() => {
    if (!transaction) return;
    const type = transaction.amount < 0 ? 'expense' : 'income';
    router.push({
      pathname: '/add-transaction',
      params: { type, editId: transaction.id },
    });
  }, [transaction, router]);

  const confirmDelete = useCallback(() => {
    if (!transaction) return;
    showAlert({
      title: 'Delete transaction',
      message: 'This removes the transaction from your history. This cannot be undone.',
      buttons: [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await removeTransaction(transaction.id);
              router.back();
            } catch {
              showAlert({ title: 'Could not delete', message: 'Please try again.' });
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    });
  }, [transaction, removeTransaction, router, showAlert]);

  const bg = isDark ? '#0E1220' : theme.background;

  if (!txId) {
    return null;
  }

  if (!isInitialSyncComplete || !transaction) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12} accessibilityRole="button" accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <ThemedText style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
            Transaction
          </ThemedText>
          <View style={styles.headerSide} />
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <ThemedText style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
          Transaction
        </ThemedText>
        <View style={styles.headerSide} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <TransactionDetailBodyContent transaction={transaction} />
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: Math.max(insets.bottom, 12),
            borderTopColor: theme.border,
            backgroundColor: bg,
          },
        ]}>
        {!canMutate ? (
          <ThemedText style={[styles.mutateHint, { color: theme.muted }]}>
            Goal transfers can't be edited or deleted here.
          </ThemedText>
        ) : (
          <View style={styles.actionsRow}>
            <Pressable
              onPress={openEdit}
              disabled={deleting}
              style={({ pressed }) => [
                styles.actionBtn,
                styles.actionEdit,
                {
                  borderColor: theme.primary,
                  opacity: pressed ? 0.85 : deleting ? 0.5 : 1,
                },
              ]}>
              <Ionicons name="pencil" size={18} color={theme.primary} />
              <ThemedText style={[styles.actionEditText, { color: theme.primary }]}>Edit</ThemedText>
            </Pressable>
            <Pressable
              onPress={confirmDelete}
              disabled={deleting}
              style={({ pressed }) => [
                styles.actionBtn,
                styles.actionDelete,
                {
                  backgroundColor: isDark ? 'rgba(248,113,113,0.18)' : '#FEE2E2',
                  opacity: pressed ? 0.88 : deleting ? 0.5 : 1,
                },
              ]}>
              {deleting ? (
                <ActivityIndicator color={isDark ? '#F87171' : '#DC2626'} />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={18} color={isDark ? '#F87171' : '#DC2626'} />
                  <ThemedText style={[styles.actionDeleteText, { color: isDark ? '#F87171' : '#DC2626' }]}>Delete</ThemedText>
                </>
              )}
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    textAlign: 'center',
  },
  headerSide: {
    width: 44,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  mutateHint: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingVertical: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  actionEdit: {
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  actionEditText: {
    fontFamily: Fonts.bold,
    fontSize: 15,
  },
  actionDelete: {},
  actionDeleteText: {
    fontFamily: Fonts.bold,
    fontSize: 15,
  },
});
