import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PrimaryButton from '@/components/ui/primary-button';
import { Colors, Fonts } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useAppAlert } from '@/context/app-alert-context';
import { authenticateWithBiometric, getBiometricLabel } from '@/lib/biometric-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function UnlockAppScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';
  const { satisfyBiometricAppLock, signOut } = useAuth();
  const { showAlert } = useAppAlert();
  const [label, setLabel] = useState('Biometrics');
  const [busy, setBusy] = useState(false);
  const autoPrompted = useRef(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      satisfyBiometricAppLock();
      router.replace('/(tabs)');
    }
  }, [router, satisfyBiometricAppLock]);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    let cancelled = false;
    void getBiometricLabel().then((name) => {
      if (!cancelled) setLabel(name);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const tryUnlock = useCallback(async () => {
    setBusy(true);
    try {
      const ok = await authenticateWithBiometric('Unlock FinTrack');
      if (ok) {
        satisfyBiometricAppLock();
        router.replace('/(tabs)');
      }
    } finally {
      setBusy(false);
    }
  }, [router, satisfyBiometricAppLock]);

  useEffect(() => {
    if (Platform.OS === 'web' || autoPrompted.current) return;
    autoPrompted.current = true;
    void tryUnlock();
  }, [tryUnlock]);

  const onSignOut = useCallback(async () => {
    setBusy(true);
    try {
      const { error } = await signOut();
      if (error) {
        showAlert({ title: 'Sign out failed', message: error.message });
      }
    } finally {
      setBusy(false);
    }
  }, [showAlert, signOut]);

  if (Platform.OS === 'web') {
    return null;
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.inner}>
        <View style={[styles.iconWrap, { backgroundColor: isDark ? 'rgba(139,124,255,0.18)' : 'rgba(127,61,255,0.12)' }]}>
          <Ionicons name="finger-print-outline" size={40} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Unlock FinTrack</Text>
        <Text style={[styles.body, { color: colors.muted }]}>
          Use {label} to continue. Your session stays on this device until you sign out.
        </Text>

        <PrimaryButton
          title={`Use ${label}`}
          onPress={() => void tryUnlock()}
          loading={busy}
          disabled={busy}
        />

        <Pressable onPress={onSignOut} disabled={busy} style={styles.signOutBtn} hitSlop={12}>
          {busy ? (
            <ActivityIndicator color={colors.muted} />
          ) : (
            <Text style={[styles.signOutText, { color: colors.muted }]}>Sign out</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
    justifyContent: 'center',
    gap: 20,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 26,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  body: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 8,
  },
  signOutBtn: { alignItems: 'center', paddingVertical: 16 },
  signOutText: { fontFamily: Fonts.semiBold, fontSize: 16 },
});
