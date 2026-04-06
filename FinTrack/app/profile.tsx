import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/auth-context';
import { useThemePreference, type ThemePreference } from '@/context/theme-preference-context';
import { useStore } from '@/store/useStore';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePullRefresh } from '@/hooks/use-pull-refresh';
import PrimaryButton from '@/components/ui/primary-button';

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
];

export default function ProfileScreen() {
  const user = useStore((state) => state.user);
  const fetchUser = useStore((state) => state.fetchUser);
  const refreshAllData = useStore((state) => state.refreshAllData);
  const { signOut } = useAuth();
  const { preference, setPreference } = useThemePreference();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const refreshProfile = useCallback(async () => {
    await Promise.all([fetchUser(), refreshAllData()]);
  }, [fetchUser, refreshAllData]);
  const { refreshing, onRefresh } = usePullRefresh(refreshProfile);

  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await signOut();
    setLoading(false);
    if (error) {
      Alert.alert('Error signing out', error.message);
    } else {
      router.replace('/(auth)/login');
    }
  };

  const name =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.user_metadata?.first_name ||
    user?.email?.split('@')[0] ||
    'User';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={15}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, styles.scrollContentGrow]}
        alwaysBounceVertical
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
            progressBackgroundColor={theme.card}
          />
        }>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="person" size={48} color={theme.primary} />
          </View>
          <Text style={[styles.name, { color: theme.text }]}>{name}</Text>
          <Text style={[styles.email, { color: theme.muted }]}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.muted }]}>Appearance</Text>
          <Text style={[styles.sectionHint, { color: theme.muted }]}>
            Choose how FinTrack looks. System follows your device setting.
          </Text>
          {THEME_OPTIONS.map((opt, index) => {
            const selected = preference === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setPreference(opt.value)}
                style={[
                  styles.row,
                  {
                    borderBottomColor: theme.border,
                    borderBottomWidth: index < THEME_OPTIONS.length - 1 ? StyleSheet.hairlineWidth : 0,
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${opt.label} theme`}
                accessibilityHint={selected ? 'Selected' : `Switch to ${opt.label} theme`}>
                <Ionicons name={opt.icon} size={22} color={theme.text} />
                <Text style={[styles.rowText, { color: theme.text }]}>{opt.label}</Text>
                {selected ? (
                  <Ionicons name="checkmark-circle" size={22} color={theme.primary} />
                ) : (
                  <View style={styles.rowTrailingSpacer} />
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.buttonContainer}>
          <PrimaryButton title="Sign Out" onPress={handleSignOut} loading={loading} disabled={loading} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
  },
  content: {
    padding: 24,
  },
  scrollContentGrow: { flexGrow: 1 },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    marginBottom: 4,
  },
  email: {
    fontFamily: Fonts.sans,
    fontSize: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
    marginLeft: 4,
  },
  sectionHint: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    marginLeft: 4,
    marginRight: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 4,
  },
  rowText: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 16,
    marginLeft: 12,
  },
  rowTrailingSpacer: {
    width: 22,
    height: 22,
  },
  buttonContainer: {
    marginTop: 20,
  },
});
