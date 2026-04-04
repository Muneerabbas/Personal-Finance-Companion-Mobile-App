import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CurrencyText } from '@/components/currency-text';
import PrimaryButton from '@/components/ui/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TransferScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const [direction, setDirection] = useState<'from' | 'to'>('from');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#14315C' : '#1A73E8' }]}>
      <View style={styles.headerArea}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={26} color="#FFFFFF" />
          </Pressable>
          <ThemedText style={styles.headerTitle}>Transfer</ThemedText>
          <View style={styles.headerRightSpacer} />
        </View>
        <ThemedText style={styles.howMuch}>How much?</ThemedText>
        <CurrencyText amountUsd={0} style={styles.amount} />
      </View>

      <View style={[styles.formSheet, { backgroundColor: theme.card }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
          <View style={[styles.segment, { borderColor: theme.border, backgroundColor: theme.background }]}>
            <Pressable
              style={[
                styles.segmentButton,
                direction === 'from' && { backgroundColor: isDark ? '#24243A' : '#F0F0F5' },
              ]}
              onPress={() => setDirection('from')}>
              <ThemedText style={{ color: direction === 'from' ? theme.text : theme.muted }}>From</ThemedText>
            </Pressable>
            <View style={[styles.segmentSwap, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <MaterialCommunityIcons name="swap-horizontal" size={16} color={theme.primary} />
            </View>
            <Pressable
              style={[
                styles.segmentButton,
                direction === 'to' && { backgroundColor: isDark ? '#24243A' : '#F0F0F5' },
              ]}
              onPress={() => setDirection('to')}>
              <ThemedText style={{ color: direction === 'to' ? theme.text : theme.muted }}>To</ThemedText>
            </Pressable>
          </View>

          <TextInput
            placeholder="Description"
            placeholderTextColor={theme.muted}
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
          />

          <Pressable style={[styles.attachment, { borderColor: theme.border, backgroundColor: theme.background }]}>
            <MaterialCommunityIcons name="paperclip" size={20} color={theme.muted} />
            <ThemedText style={{ color: theme.muted }}>Add attachment</ThemedText>
          </Pressable>
        </ScrollView>

        <PrimaryButton title="Continue" onPress={() => {}} style={styles.continueButton} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  headerArea: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  headerTitle: { color: '#FFFFFF', fontFamily: Fonts.semiBold, fontSize: 20 },
  headerRightSpacer: { width: 26 },
  howMuch: { color: 'rgba(255,255,255,0.85)', fontSize: 18, marginBottom: 10, fontFamily: Fonts.sans },
  amount: {
    color: '#FFFFFF',
    fontSize: 56,
    lineHeight: 64,
    fontFamily: Fonts.bold,
    includeFontPadding: false,
  },
  formSheet: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  formContent: { padding: 16, gap: 12 },
  segment: {
    borderWidth: 1,
    borderRadius: 16,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    position: 'relative',
  },
  segmentButton: {
    flex: 1,
    height: '100%',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentSwap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  input: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontFamily: Fonts.sans,
    fontSize: 16,
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
  continueButton: {
    margin: 16,
  },
});
