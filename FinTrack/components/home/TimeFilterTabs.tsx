import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

const FILTERS = ['Today', 'Week', 'Month', 'Year'] as const;

export type TimeFilter = (typeof FILTERS)[number];

type TimeFilterTabsProps = {
  value?: TimeFilter;
  defaultValue?: TimeFilter;
  onChange?: (value: TimeFilter) => void;
  compact?: boolean;
};

export default function TimeFilterTabs({
  value,
  defaultValue = 'Today',
  onChange,
  compact = false,
}: TimeFilterTabsProps) {
  const [uncontrolled, setUncontrolled] = useState<TimeFilter>(defaultValue);
  const isControlled = value !== undefined;
  const selected = isControlled ? value : uncontrolled;
  const isDark = (useColorScheme() ?? 'light') === 'dark';

  const onSelect = (next: TimeFilter) => {
    if (!isControlled) {
      setUncontrolled(next);
    }
    onChange?.(next);
  };

  return (
    <View
      style={[
        styles.container,
        compact ? styles.containerCompact : null,
        { backgroundColor: isDark ? '#20263C' : '#EFF1F5' },
      ]}>
      {FILTERS.map((filter) => {
        const isActive = filter === selected;

        return (
          <Pressable
            key={filter}
            onPress={() => onSelect(filter)}
            style={[
              styles.tab,
              compact ? styles.tabCompact : null,
              isActive && styles.tabActive,
              isActive && { backgroundColor: '#FFFFFF' },
            ]}>
            <ThemedText
              style={[
                styles.tabText,
                compact ? styles.tabTextCompact : null,
                { color: isDark ? '#9AA3C2' : '#7C8296' },
                isActive && styles.tabTextActive,
                isActive && { color: '#6A63E8' },
              ]}>
              {filter}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    justifyContent: 'space-between',
    gap: 4,
    alignSelf: 'flex-start',
  },
  containerCompact: {
    borderRadius: 12,
  },
  tab: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  tabCompact: {
    paddingVertical: 7,
    paddingHorizontal: 11,
  },
  tabActive: {
    shadowColor: '#A9AFC4',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  tabText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
  },
  tabTextCompact: {
    fontSize: 11,
  },
  tabTextActive: {
    fontFamily: 'Poppins_700Bold',
  },
});
