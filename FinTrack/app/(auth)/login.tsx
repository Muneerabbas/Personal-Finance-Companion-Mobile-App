import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AuthFormField } from '@/components/auth/AuthFormField';
import { AuthKeyboardScreen } from '@/components/auth/AuthKeyboardScreen';
import { useAppAlert } from '@/context/app-alert-context';
import {
  canSubmitLogin,
  loginEmailError,
  loginPasswordError,
} from '@/lib/auth-field-validation';
import {
  clearBiometricLoginData,
  getBiometricLabel,
  isBiometricUnlockConfigured,
  unlockBiometricSession,
} from '@/lib/biometric-auth';
import { supabase } from '@/lib/supabase';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import PrimaryButton from '@/components/ui/primary-button';

export default function Login() {
  const { showAlert } = useAppAlert();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailTyped, setEmailTyped] = useState(false);
  const [passwordTyped, setPasswordTyped] = useState(false);
  const [biometricOffered, setBiometricOffered] = useState(false);
  const [bioLabel, setBioLabel] = useState('Biometrics');
  const [bioLoading, setBioLoading] = useState(false);
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';

  const errorColor = isDark ? '#F87171' : '#DC2626';
  const emailError = useMemo(() => loginEmailError(email, emailTyped), [email, emailTyped]);
  const passwordError = useMemo(() => loginPasswordError(password, passwordTyped), [password, passwordTyped]);
  const formValid = canSubmitLogin(email, password);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'web') {
        setBiometricOffered(false);
        return;
      }
      let cancelled = false;
      (async () => {
        const [configured, label] = await Promise.all([isBiometricUnlockConfigured(), getBiometricLabel()]);
        if (!cancelled) {
          setBiometricOffered(configured);
          setBioLabel(label);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, []),
  );

  async function signInWithBiometric() {
    setBioLoading(true);
    try {
      const tokens = await unlockBiometricSession();
      if (!tokens) {
        showAlert({
          title: 'Sign-in cancelled',
          message: 'Biometric unlock did not complete. Try your password instead.',
        });
        return;
      }
      const { error } = await supabase.auth.setSession({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });
      if (error) {
        await clearBiometricLoginData();
        showAlert({
          title: 'Session expired',
          message: 'Sign in again with your email and password. You can re-enable biometric login after that.',
        });
      }
    } finally {
      setBioLoading(false);
    }
  }

  async function signInWithEmail() {
    if (!formValid) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      showAlert({ title: 'Sign In Failed', message: error.message });
      setLoading(false);
    }
    // Success: root `_layout` sends user to setup-biometric or (tabs).
  }

  return (
    <AuthKeyboardScreen backgroundColor={colors.background}>
      <View style={styles.page}>
        <View style={[styles.heroBadge, { backgroundColor: isDark ? 'rgba(139,124,255,0.15)' : 'rgba(127,61,255,0.1)' }]}>
          <Ionicons name="wallet-outline" size={28} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Sign in to keep tracking your money with clarity.
        </Text>

        {biometricOffered ? (
          <Pressable
            onPress={signInWithBiometric}
            disabled={bioLoading}
            style={({ pressed }) => [
              styles.biometricCard,
              {
                borderColor: colors.primary,
                backgroundColor: isDark ? 'rgba(139,124,255,0.12)' : 'rgba(127,61,255,0.08)',
                opacity: pressed ? 0.92 : bioLoading ? 0.7 : 1,
              },
            ]}>
            {bioLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Ionicons name="finger-print-outline" size={26} color={colors.primary} />
                <Text style={[styles.biometricTitle, { color: colors.text }]}>Sign in with {bioLabel}</Text>
                <Text style={[styles.biometricHint, { color: colors.muted }]}>Faster unlock on this device</Text>
              </>
            )}
          </Pressable>
        ) : null}

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              shadowColor: isDark ? '#000' : '#1F1B2F',
            },
          ]}>
          {biometricOffered ? (
            <Text style={[styles.dividerLabel, { color: colors.muted }]}>or use email</Text>
          ) : null}
          <AuthFormField
            label="Email"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              setEmailTyped(true);
            }}
            error={emailError}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
            textColor={colors.text}
            mutedColor={colors.muted}
            borderColor={colors.border}
            backgroundColor={isDark ? '#131827' : '#FAFAFA'}
            errorColor={errorColor}
          />

          <View style={styles.fieldGap}>
            <AuthFormField
              label="Password"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setPasswordTyped(true);
              }}
              error={passwordError}
              placeholder="Your password"
              secureTextEntry
              autoCapitalize="none"
              textContentType="password"
              textColor={colors.text}
              mutedColor={colors.muted}
              borderColor={colors.border}
              backgroundColor={isDark ? '#131827' : '#FAFAFA'}
              errorColor={errorColor}
            />
          </View>

          <View style={styles.cta}>
            <PrimaryButton
              title="Sign in"
              onPress={signInWithEmail}
              disabled={loading || !formValid}
              loading={loading}
            />
          </View>
        </View>

        <Pressable style={styles.linkWrap} onPress={() => router.push('/sign-up')} hitSlop={12}>
          <Text style={[styles.linkMuted, { color: colors.muted }]}>New here? </Text>
          <Text style={[styles.linkAccent, { color: colors.primary }]}>Create an account</Text>
        </Pressable>
      </View>
    </AuthKeyboardScreen>
  );
}

const styles = StyleSheet.create({
  page: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  heroBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 30,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  biometricCard: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 18,
    alignItems: 'center',
    gap: 4,
  },
  biometricTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    marginTop: 6,
  },
  biometricHint: {
    fontFamily: Fonts.sans,
    fontSize: 13,
  },
  dividerLabel: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    marginBottom: 8,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  fieldGap: {
    marginTop: 4,
  },
  cta: {
    marginTop: 12,
  },
  linkWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
    paddingVertical: 8,
  },
  linkMuted: {
    fontFamily: Fonts.sans,
    fontSize: 15,
  },
  linkAccent: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
  },
});
