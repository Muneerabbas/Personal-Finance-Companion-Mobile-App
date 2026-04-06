import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthKeyboardScreen } from '@/components/auth/AuthKeyboardScreen';
import { supabase } from '@/lib/supabase';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import PrimaryButton from '@/components/ui/primary-button';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];

  async function signUpWithEmail() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Name', 'Please enter your name.');
      return;
    }
    setLoading(true);
    const firstName = trimmedName.split(/\s+/)[0] || trimmedName;
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          full_name: trimmedName,
          first_name: firstName,
          name: trimmedName,
        },
      },
    });

    if (error) {
      Alert.alert('Sign Up Failed', error.message);
      setLoading(false);
    } else {
      if (!session) {
        Alert.alert('Please check your inbox for email verification!');
        setLoading(false);
      } else {
         router.replace('/(tabs)');
      }
    }
  }

  return (
    <AuthKeyboardScreen backgroundColor={colors.background}>
      <View>
        <Text style={[styles.title, { color: colors.text, fontFamily: Fonts.bold }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: colors.muted, fontFamily: Fonts.sans }]}>Sign up to start tracking your finances</Text>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text, fontFamily: Fonts.rounded }]}>Name</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card, fontFamily: Fonts.sans }]}
            onChangeText={setName}
            value={name}
            placeholder="Your name"
            placeholderTextColor={colors.muted}
            autoCapitalize="words"
            autoCorrect={false}
            textContentType="name"
          />
        </View>

        <View style={[styles.inputContainer, styles.mt20]}>
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
          <PrimaryButton title="Sign Up" onPress={signUpWithEmail} disabled={loading} loading={loading} />
        </View>

        <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/login')}>
          <Text style={[styles.linkText, { color: colors.link, fontFamily: Fonts.semiBold }]}>Already have an account? Sign In</Text>
        </TouchableOpacity>
      </View>
    </AuthKeyboardScreen>
  );
}

const styles = StyleSheet.create({
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
