import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PrimaryButton from '@/components/ui/primary-button';
import { Colors, Fonts } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import {
  BIOMETRIC_ENABLE_AUTH_CANCELLED,
  getBiometricLabel,
  isBiometricHardwareReady,
  saveBiometricSession,
  setBiometricSetupOutcome,
} from '@/lib/biometric-auth';
import { supabase } from '@/lib/supabase';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function SetupBiometricScreen() {
  const router = useRouter();
  const { satisfyBiometricAppLock } = useAuth();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';
  const [label, setLabel] = useState('biometrics');
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [available, setAvailable] = useState(false);

  const goTabs = useCallback(() => {
    satisfyBiometricAppLock();
    router.replace('/(tabs)');
  }, [router, satisfyBiometricAppLock]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (Platform.OS === 'web') {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) await setBiometricSetupOutcome(user.id, 'unavailable');
        if (!cancelled) goTabs();
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        if (!cancelled) router.replace('/(auth)/login');
        return;
      }

      const ready = await isBiometricHardwareReady();
      const name = await getBiometricLabel();
      if (cancelled) return;
      setLabel(name);
      setAvailable(ready);
      setChecking(false);

      if (!ready) {
        await setBiometricSetupOutcome(session.user.id, 'unavailable');
        goTabs();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [goTabs, router]);

  const onEnable = useCallback(async () => {
    setBusy(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || !session.access_token || !session.refresh_token) {
        goTabs();
        return;
      }

      await saveBiometricSession(session.access_token, session.refresh_token);
      await setBiometricSetupOutcome(session.user.id, 'enabled');
      goTabs();
    } catch (e) {
      if (e instanceof Error && e.message === BIOMETRIC_ENABLE_AUTH_CANCELLED) return;
    } finally {
      setBusy(false);
    }
  }, [goTabs, label]);

  const onSkip = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) await setBiometricSetupOutcome(user.id, 'skipped');
    goTabs();
  }, [goTabs]);

  if (checking || !available) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.inner}>
        <View style={[styles.iconWrap, { backgroundColor: isDark ? 'rgba(139,124,255,0.18)' : 'rgba(127,61,255,0.12)' }]}>
          <Ionicons name="finger-print-outline" size={40} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Faster sign-in next time?</Text>
        <Text style={[styles.body, { color: colors.muted }]}>
          Use {label} to unlock FinTrack on this device instead of typing your password every time.
        </Text>

        <View style={styles.actions}>
          <PrimaryButton title={`Turn on ${label}`} onPress={onEnable} loading={busy} disabled={busy} />
          <Pressable onPress={onSkip} disabled={busy} style={styles.skipBtn} hitSlop={12}>
            <Text style={[styles.skipText, { color: colors.muted }]}>Not now</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
    justifyContent: 'center',
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 28,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 26,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 36,
  },
  actions: { gap: 16 },
  skipBtn: { alignItems: 'center', paddingVertical: 12 },
  skipText: { fontFamily: Fonts.semiBold, fontSize: 16 },
});
