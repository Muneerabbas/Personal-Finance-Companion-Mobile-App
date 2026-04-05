import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors, Fonts } from '@/constants/theme';
import {
  BottomSheetFlatList,
  BottomSheetTextInput,
  renderSheetBackdrop,
} from '@/context/bottom-sheet-context';
import { useCurrency } from '@/context/currency-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Row = { code: string; name: string };

type CurrencyPickerButtonProps = {
  variant?: 'default' | 'header';
};

export default function CurrencyPickerButton({ variant = 'default' }: CurrencyPickerButtonProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme];
  const { selectedCode, setSelectedCode, currencyNames, loading, currencySymbol } = useCurrency();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const sheetRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ['78%', '94%'], []);
  const renderBackdrop = useCallback(renderSheetBackdrop, []);

  useEffect(() => {
    if (open) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [open]);

  const handleDismiss = useCallback(() => {
    setOpen(false);
    setQuery('');
  }, []);

  const rows = useMemo<Row[]>(() => {
    if (!currencyNames) return [];
    const q = query.trim().toLowerCase();
    const list = Object.entries(currencyNames).map(([code, name]) => ({
      code: code.toLowerCase(),
      name,
    }));
    list.sort((a, b) => a.code.localeCompare(b.code));
    if (!q) return list;
    return list.filter((r) => r.code.includes(q) || r.name.toLowerCase().includes(q));
  }, [currencyNames, query]);

  const label = loading ? '…' : selectedCode.toUpperCase();

  const sheetBg = isDark ? '#171B2B' : '#FFFFFF';
  const searchBg = isDark ? '#232A40' : '#F4F5F8';
  const searchBorder = isDark ? '#343D59' : '#E5E7EB';
  const searchColor = isDark ? '#F5F7FF' : '#111827';
  const placeholderColor = isDark ? '#6B7280' : '#9CA3AF';

  return (
    <>
      <TouchableOpacity
        style={
          variant === 'header'
            ? [
                styles.triggerHeaderPill,
                {
                  backgroundColor: isDark ? '#1E2436' : theme.secondary,
                  borderColor: theme.border,
                },
              ]
            : [styles.trigger, { backgroundColor: isDark ? '#20263B' : '#F7F8FC' }]
        }
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Currency"
        accessibilityHint="Opens a list to change display currency">
        {variant === 'header' ? (
          <>
            <ThemedText style={[styles.pillSymbol, { color: theme.primary }]}>
              {loading ? '…' : currencySymbol}
            </ThemedText>
            <ThemedText style={[styles.pillCode, { color: theme.text }]}>{label}</ThemedText>
            <Ionicons name="chevron-down" size={18} color={theme.muted} />
          </>
        ) : (
          <>
            <ThemedText style={[styles.triggerText, { color: isDark ? '#EEF2FF' : '#2A3147' }]}>
              {label}
            </ThemedText>
            <Ionicons name="chevron-down" size={16} color={theme.primary} />
          </>
        )}
      </TouchableOpacity>

      <BottomSheetModal
        ref={sheetRef}
        name="currencyPicker"
        snapPoints={snapPoints}
        enablePanDownToClose
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        onDismiss={handleDismiss}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: sheetBg }}
        handleIndicatorStyle={{ backgroundColor: isDark ? '#3A3F55' : '#D1D5DB' }}>
        <View style={[styles.sheetInner, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.sheetHeader}>
            <ThemedText style={[styles.sheetTitle, { color: isDark ? '#F5F7FF' : '#202430' }]}>
              Currency
            </ThemedText>
            <TouchableOpacity onPress={() => sheetRef.current?.dismiss()} hitSlop={12}>
              <Ionicons name="close" size={26} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>
          <BottomSheetTextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search code or name"
            placeholderTextColor={placeholderColor}
            style={[
              styles.search,
              {
                backgroundColor: searchBg,
                color: searchColor,
                borderColor: searchBorder,
              },
            ]}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <BottomSheetFlatList<Row>
            data={rows}
            keyExtractor={(item: Row) => item.code}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={24}
            windowSize={10}
            style={styles.flatList}
            renderItem={({ item }: { item: Row }) => {
              const active = item.code === selectedCode.toLowerCase();
              return (
                <TouchableOpacity
                  style={[
                    styles.row,
                    {
                      backgroundColor: active ? (isDark ? '#2A3148' : '#EEF2FF') : 'transparent',
                    },
                  ]}
                  onPress={() => {
                    setSelectedCode(item.code);
                    sheetRef.current?.dismiss();
                  }}>
                  <ThemedText style={[styles.rowCode, { color: isDark ? '#F5F7FF' : '#111827' }]}>
                    {item.code.toUpperCase()}
                  </ThemedText>
                  <ThemedText
                    style={[styles.rowName, { color: isDark ? '#9CA3AF' : '#6B7280' }]}
                    numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  {active ? <Ionicons name="checkmark-circle" size={22} color={theme.primary} /> : null}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <ThemedText style={[styles.empty, { color: isDark ? '#6B7280' : '#9CA3AF' }]}>
                {currencyNames ? 'No matches' : 'Loading currencies…'}
              </ThemedText>
            }
          />
        </View>
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 19,
    minWidth: 72,
    justifyContent: 'center',
  },
  triggerHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 44,
  },
  pillSymbol: {
    fontFamily: Fonts.bold,
    fontSize: 16,
    lineHeight: 20,
  },
  pillCode: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.4,
  },
  triggerText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
  },
  sheetInner: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 4,
    minHeight: 120,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sheetTitle: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
  },
  search: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  rowCode: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 15,
    width: 56,
  },
  rowName: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    flex: 1,
  },
  empty: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
  },
  flatList: {
    flex: 1,
  },
});
