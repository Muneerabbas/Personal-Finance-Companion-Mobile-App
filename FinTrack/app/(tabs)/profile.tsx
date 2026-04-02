import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <ThemedText type="title" style={styles.title}>
          Profile
        </ThemedText>
        <ThemedText style={{ color: theme.muted }}>
          Manage account settings, notifications, and preferences.
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    marginTop: 12,
  },
  title: {
    marginBottom: 10,
  },
});
