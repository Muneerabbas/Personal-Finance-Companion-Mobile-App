import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { OTHER_CATEGORY_LABEL } from '@/constants/transaction-category-styles';
import { Colors, Fonts } from '@/constants/theme';
import { BottomSheetScrollView, renderSheetBackdrop } from '@/context/bottom-sheet-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

type CategoryDropdownProps = {
  options: string[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Sheet header title (e.g. "Category", "Wallet"). */
  sheetTitle?: string;
  /** When this option is selected, a text field is shown below the trigger. */
  otherOptionValue?: string;
  otherFieldValue?: string;
  onOtherFieldChange?: (text: string) => void;
  otherFieldPlaceholder?: string;
};

export default function CategoryDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select category',
  sheetTitle = 'Category',
  otherOptionValue = OTHER_CATEGORY_LABEL,
  otherFieldValue = '',
  onOtherFieldChange,
  otherFieldPlaceholder = 'Type a category name',
}: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<BottomSheetModal>(null);
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  const snapPoints = useMemo(() => ['58%', '88%'], []);
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
  }, []);

  const select = (item: string) => {
    onChange(item);
    sheetRef.current?.dismiss();
  };

  const showOtherField = value === otherOptionValue && onOtherFieldChange != null;

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityHint={`Opens list: ${sheetTitle}`}
        onPress={() => setOpen(true)}
        style={[
          styles.trigger,
          {
            borderColor: theme.border,
            backgroundColor: theme.background,
          },
        ]}>
        <Text
          style={[
            styles.triggerText,
            { color: value ? theme.text : theme.muted, fontFamily: Fonts.sans },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail">
          {value ?? placeholder}
        </Text>
        <MaterialCommunityIcons name={open ? 'chevron-up' : 'chevron-down'} size={22} color={theme.muted} />
      </Pressable>

      {showOtherField ? (
        <TextInput
          value={otherFieldValue}
          onChangeText={onOtherFieldChange}
          placeholder={otherFieldPlaceholder}
          placeholderTextColor={theme.muted}
          style={[
            styles.otherInput,
            {
              color: theme.text,
              borderColor: theme.border,
              backgroundColor: theme.background,
              fontFamily: Fonts.sans,
            },
          ]}
        />
      ) : null}

      <BottomSheetModal
        ref={sheetRef}
        name="categoryDropdown"
        snapPoints={snapPoints}
        enablePanDownToClose
        onDismiss={handleDismiss}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: theme.card }}
        handleIndicatorStyle={{ backgroundColor: theme.border }}>
        <View style={[styles.sheetHeader, { borderBottomColor: theme.border }]}>
          <ThemedText style={[styles.sheetTitleText, { color: theme.text }]}>{sheetTitle}</ThemedText>
          <Pressable onPress={() => sheetRef.current?.dismiss()} hitSlop={10} accessibilityLabel="Close">
            <MaterialCommunityIcons name="close" size={24} color={theme.muted} />
          </Pressable>
        </View>
        <BottomSheetScrollView
          keyboardShouldPersistTaps="handled"
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {options.map((item) => {
            const selected = item === value;
            return (
              <Pressable
                key={item}
                onPress={() => select(item)}
                style={[
                  styles.option,
                  {
                    backgroundColor: selected
                      ? isDark
                        ? 'rgba(127, 61, 255, 0.2)'
                        : 'rgba(127, 61, 255, 0.1)'
                      : 'transparent',
                  },
                ]}>
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: selected ? theme.primary : theme.text,
                      fontFamily: selected ? Fonts.semiBold : Fonts.sans,
                    },
                  ]}
                  numberOfLines={2}
                  ellipsizeMode="tail">
                  {item}
                </Text>
                {selected ? <MaterialCommunityIcons name="check" size={20} color={theme.primary} /> : null}
              </Pressable>
            );
          })}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  triggerText: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    ...Platform.select({
      android: {
        includeFontPadding: false,
        textAlignVertical: 'center',
      },
      default: {},
    }),
  },
  otherInput: {
    marginTop: 10,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetTitleText: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
  },
  scroll: {
    maxHeight: 360,
  },
  scrollContent: {
    paddingVertical: 8,
    paddingBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 12,
  },
  optionText: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
  },
});
