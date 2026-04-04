import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useCurrency } from '@/context/currency-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Row = { code: string; name: string };

export default function CurrencyPickerButton() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme];
  const { selectedCode, setSelectedCode, currencyNames, loading } = useCurrency();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const rows = useMemo<Row[]>(() => {
    if (!currencyNames) return [];
    const q = query.trim().toLowerCase();
    const list = Object.entries(currencyNames).map(([code, name]) => ({
      code: code.toLowerCase(),
      name,
    }));
    list.sort((a, b) => a.code.localeCompare(b.code));
    if (!q) return list;
    return list.filter(
      (r) => r.code.includes(q) || r.name.toLowerCase().includes(q),
    );
  }, [currencyNames, query]);

  const label = loading ? '…' : selectedCode.toUpperCase();

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, { backgroundColor: isDark ? '#20263B' : '#F7F8FC' }]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Choose display currency">
        <ThemedText style={[styles.triggerText, { color: isDark ? '#EEF2FF' : '#2A3147' }]}>
          {label}
        </ThemedText>
        <Ionicons name="chevron-down" size={16} color={theme.primary} />
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: isDark ? '#171B2B' : '#FFFFFF',
                paddingBottom: Math.max(insets.bottom, 16),
                maxHeight: '88%',
              },
            ]}>
            <View style={styles.sheetHeader}>
              <ThemedText style={[styles.sheetTitle, { color: isDark ? '#F5F7FF' : '#202430' }]}>
                Currency
              </ThemedText>
              <TouchableOpacity onPress={() => setOpen(false)} hitSlop={12}>
                <Ionicons name="close" size={26} color={isDark ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search code or name"
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              style={[
                styles.search,
                {
                  backgroundColor: isDark ? '#232A40' : '#F4F5F8',
                  color: isDark ? '#F5F7FF' : '#111827',
                  borderColor: isDark ? '#343D59' : '#E5E7EB',
                },
              ]}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <FlatList
              data={rows}
              keyExtractor={(item) => item.code}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={24}
              windowSize={10}
              style={styles.list}
              renderItem={({ item }) => {
                const active = item.code === selectedCode.toLowerCase();
                return (
                  <TouchableOpacity
                    style={[
                      styles.row,
                      {
                        backgroundColor: active
                          ? isDark
                            ? '#2A3148'
                            : '#EEF2FF'
                          : 'transparent',
                      },
                    ]}
                    onPress={() => {
                      setSelectedCode(item.code);
                      setOpen(false);
                      setQuery('');
                    }}>
                    <ThemedText
                      style={[styles.rowCode, { color: isDark ? '#F5F7FF' : '#111827' }]}>
                      {item.code.toUpperCase()}
                    </ThemedText>
                    <ThemedText
                      style={[styles.rowName, { color: isDark ? '#9CA3AF' : '#6B7280' }]}
                      numberOfLines={1}>
                      {item.name}
                    </ThemedText>
                    {active ? (
                      <Ionicons name="checkmark-circle" size={22} color={theme.primary} />
                    ) : null}
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
        </View>
      </Modal>
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
  triggerText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    maxWidth: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
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
  list: {
    maxHeight: 420,
  },
});
