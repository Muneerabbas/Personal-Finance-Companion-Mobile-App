import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppAlert } from '@/context/app-alert-context';
import { useAuth } from '@/context/auth-context';
import { useThemePreference, type ThemePreference } from '@/context/theme-preference-context';
import { useStore } from '@/store/useStore';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { usePullRefresh } from '@/hooks/use-pull-refresh';
import PrimaryButton from '@/components/ui/primary-button';
import {
  BIOMETRIC_ENABLE_AUTH_CANCELLED,
  disableBiometricLogin,
  getBiometricLabel,
  getBiometricSetupOutcome,
  isBiometricHardwareReady,
  isBiometricLoginEnabledForUser,
  saveBiometricSession,
  setBiometricSetupOutcome,
} from '@/lib/biometric-auth';
import { supabase } from '@/lib/supabase';

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
];

export default function ProfileScreen() {
  const { showAlert } = useAppAlert();
  const user = useStore((state) => state.user);
  const fetchUser = useStore((state) => state.fetchUser);
  const refreshAllData = useStore((state) => state.refreshAllData);
  const { signOut, refreshBiometricAppLockRequirement } = useAuth();
  const { preference, setPreference } = useThemePreference();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [bioLabel, setBioLabel] = useState('Biometrics');
  const [bioHardwareReady, setBioHardwareReady] = useState(false);
  const [bioUnavailable, setBioUnavailable] = useState(false);
  const [bioEnabled, setBioEnabled] = useState(false);
  const [bioBusy, setBioBusy] = useState(false);

  const userId = user?.id;

  const reloadBiometricState = useCallback(async () => {
    if (Platform.OS === 'web' || !userId) {
      setBioEnabled(false);
      setBioHardwareReady(false);
      setBioUnavailable(false);
      return;
    }
    const [ready, label, enabled, outcome] = await Promise.all([
      isBiometricHardwareReady(),
      getBiometricLabel(),
      isBiometricLoginEnabledForUser(userId),
      getBiometricSetupOutcome(userId),
    ]);
    setBioHardwareReady(ready);
    setBioLabel(label);
    setBioEnabled(enabled);
    setBioUnavailable(outcome === 'unavailable');
  }, [userId]);

  const refreshProfile = useCallback(async () => {
    await Promise.all([fetchUser(), refreshAllData(), reloadBiometricState()]);
  }, [fetchUser, refreshAllData, reloadBiometricState]);
  const { refreshing, onRefresh } = usePullRefresh(refreshProfile);

  useFocusEffect(
    useCallback(() => {
      void reloadBiometricState();
    }, [reloadBiometricState]),
  );

  const onBiometricToggle = async (turnOn: boolean) => {
    if (!userId || Platform.OS === 'web') return;
    if (turnOn) {
      if (!bioHardwareReady) {
        showAlert({
          title: 'Not available',
          message:
            Platform.OS === 'android'
              ? 'Add a fingerprint, face unlock, or screen lock on this device to use biometric login.'
              : 'Add Face ID, Touch ID, or a screen lock on this device to use biometric login.',
        });
        return;
      }
      setBioBusy(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token || !session.refresh_token) {
          showAlert({ title: 'Session missing', message: 'Please sign out and sign in again, then try enabling biometric login.' });
          return;
        }
        await saveBiometricSession(session.access_token, session.refresh_token);
        await setBiometricSetupOutcome(userId, 'enabled');
        setBioEnabled(true);
        await refreshBiometricAppLockRequirement();
      } catch (e) {
        if (e instanceof Error && e.message === BIOMETRIC_ENABLE_AUTH_CANCELLED) return;
        showAlert({ title: 'Could not enable', message: 'Something went wrong saving biometric login. Try again.' });
      } finally {
        setBioBusy(false);
      }
    } else {
      setBioBusy(true);
      try {
        await disableBiometricLogin(userId);
        setBioEnabled(false);
        await refreshBiometricAppLockRequirement();
      } catch {
        showAlert({ title: 'Could not disable', message: 'Try again in a moment.' });
      } finally {
        setBioBusy(false);
      }
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await signOut();
    setLoading(false);
    if (error) {
      showAlert({ title: 'Error signing out', message: error.message });
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

        {Platform.OS !== 'web' ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.muted }]}>Security</Text>
            <Text style={[styles.sectionHint, { color: theme.muted }]}>
              {bioUnavailable
                ? 'Biometric login is not available on this device.'
                : `Use ${bioLabel} to sign in quickly on this device.`}
            </Text>
            <View
              style={[
                styles.row,
                styles.switchRow,
                {
                  borderBottomColor: theme.border,
                  borderBottomWidth: 0,
                },
              ]}>
              <Ionicons name="finger-print-outline" size={22} color={theme.text} />
              <View style={styles.switchLabels}>
                <Text style={[styles.bioRowTitle, { color: theme.text }]}>Biometric login</Text>
                <Text style={[styles.switchSub, { color: theme.muted }]}>{bioLabel}</Text>
              </View>
              {bioBusy ? (
                <ActivityIndicator color={theme.primary} style={{ marginRight: 4 }} />
              ) : (
                <Switch
                  value={bioEnabled}
                  onValueChange={onBiometricToggle}
                  disabled={bioUnavailable || (!bioHardwareReady && !bioEnabled)}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor="#FFFFFF"
                />
              )}
            </View>
            {!bioHardwareReady && !bioUnavailable ? (
              <Text style={[styles.sectionHint, { color: theme.muted, marginTop: 4 }]}>
                Turn on {bioLabel} or a device passcode in system settings to enable this.
              </Text>
            ) : null}
          </View>
        ) : null}

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
  switchRow: {
    justifyContent: 'space-between',
    paddingRight: 0,
  },
  switchLabels: {
    flex: 1,
    marginLeft: 12,
  },
  bioRowTitle: {
    fontFamily: Fonts.sans,
    fontSize: 16,
  },
  switchSub: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    marginTop: 2,
  },
  rowTrailingSpacer: {
    width: 22,
    height: 22,
  },
  buttonContainer: {
    marginTop: 20,
  },
});
