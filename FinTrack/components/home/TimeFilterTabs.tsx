import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';

const FILTERS = ['Today', 'Week', 'Month', 'Year'] as const;

export type TimeFilter = (typeof FILTERS)[number];

type TimeFilterTabsProps = {
  onChange?: (value: TimeFilter) => void;
};

export default function TimeFilterTabs({ onChange }: TimeFilterTabsProps) {
  const [selected, setSelected] = useState<TimeFilter>('Today');

  const onSelect = (value: TimeFilter) => {
    setSelected(value);
    onChange?.(value);
  };

  return (
    <View style={styles.container}>
      {FILTERS.map((filter) => {
        const isActive = filter === selected;

        return (
          <Pressable
            key={filter}
            onPress={() => onSelect(filter)}
            style={[styles.tab, isActive && styles.tabActive]}>
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{filter}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 4,
    justifyContent: 'space-between',
    gap: 6,
  },
  tab: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#FFF4D8',
  },
  tabText: {
    fontFamily: Fonts.rounded,
    color: '#9CA3AF',
    fontSize: 14,
  },
  tabTextActive: {
    fontFamily: Fonts.bold,
    color: '#D4A82C',
  },
});
