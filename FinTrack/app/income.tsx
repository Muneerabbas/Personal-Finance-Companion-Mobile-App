import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PrimaryButton from '@/components/ui/primary-button';
import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function IncomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const [repeat, setRepeat] = useState(false);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#10432F' : '#11A86C' }]}>
      <View style={styles.headerArea}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <MaterialCommunityIcons name="arrow-left" size={26} color="#FFFFFF" />
          </Pressable>
          <ThemedText style={styles.headerTitle}>Income</ThemedText>
          <View style={styles.headerRightSpacer} />
        </View>
        <ThemedText style={styles.howMuch}>How much?</ThemedText>
        <ThemedText style={styles.amount}>$0</ThemedText>
      </View>

      <View style={[styles.formSheet, { backgroundColor: theme.card }]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
          <TextInput
            placeholder="Category"
            placeholderTextColor={theme.muted}
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
          />
          <TextInput
            placeholder="Description"
            placeholderTextColor={theme.muted}
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
          />
          <TextInput
            placeholder="Wallet"
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
  repeatRow: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  repeatTitle: { fontFamily: Fonts.semiBold, fontSize: 18 },
  repeatSubtitle: { fontFamily: Fonts.sans, fontSize: 14, marginTop: 2 },
  continueButton: {
    margin: 16,
  },
});
