import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import PrimaryButton from '@/components/ui/primary-button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Sign In Failed', error.message);
      setLoading(false);
    } else {
      router.replace('/(tabs)');
    }
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text, fontFamily: Fonts.bold }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: colors.muted, fontFamily: Fonts.sans }]}>Log in to continue to FinTrack</Text>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text, fontFamily: Fonts.rounded }]}>Email</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card, fontFamily: Fonts.sans }]}
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="email@address.com"
            placeholderTextColor={colors.muted}
            autoCapitalize={'none'}
          />
        </View>

        <View style={[styles.inputContainer, styles.mt20]}>
          <Text style={[styles.label, { color: colors.text, fontFamily: Fonts.rounded }]}>Password</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card, fontFamily: Fonts.sans }]}
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            placeholder="Password"
            placeholderTextColor={colors.muted}
            autoCapitalize={'none'}
          />
        </View>

        <View style={[styles.mt20, styles.pt20]}>
          <PrimaryButton title="Sign In" onPress={signInWithEmail} disabled={loading} loading={loading} />
        </View>

        <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/sign-up')}>
          <Text style={[styles.linkText, { color: colors.link, fontFamily: Fonts.semiBold }]}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  mt20: {
    marginTop: 20,
  },
  pt20: {
    paddingTop: 20,
  },
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
  },
});
