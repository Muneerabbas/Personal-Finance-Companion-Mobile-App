import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AuthFormField } from '@/components/auth/AuthFormField';
import { AuthKeyboardScreen } from '@/components/auth/AuthKeyboardScreen';
import { useAppAlert } from '@/context/app-alert-context';
import {
  canSubmitLogin,
  loginEmailError,
  loginPasswordError,
} from '@/lib/auth-field-validation';
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
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const isDark = scheme === 'dark';

  const errorColor = isDark ? '#F87171' : '#DC2626';
  const emailError = useMemo(() => loginEmailError(email, emailTyped), [email, emailTyped]);
  const passwordError = useMemo(() => loginPasswordError(password, passwordTyped), [password, passwordTyped]);
  const formValid = canSubmitLogin(email, password);

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
    } else {
      router.replace('/(tabs)');
    }
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

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              shadowColor: isDark ? '#000' : '#1F1B2F',
            },
          ]}>
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
    marginBottom: 28,
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
