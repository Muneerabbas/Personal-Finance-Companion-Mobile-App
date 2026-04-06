import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { Fonts } from '@/constants/theme';

type AuthFormFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error: string | null;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  autoCorrect?: boolean;
  textContentType?: TextInputProps['textContentType'];
  /** Theme tokens */
  textColor: string;
  mutedColor: string;
  borderColor: string;
  backgroundColor: string;
  errorColor: string;
};

export function AuthFormField({
  label,
  value,
  onChangeText,
  error,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  textContentType,
  textColor,
  mutedColor,
  borderColor,
  backgroundColor,
  errorColor,
}: AuthFormFieldProps) {
  const [showSecret, setShowSecret] = useState(false);
  const isPassword = Boolean(secureTextEntry);
  const effectiveSecure = isPassword && !showSecret;

  const borderActive = error ? errorColor : borderColor;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          {
            backgroundColor,
            borderColor: borderActive,
          },
          error && styles.inputRowError,
        ]}>
        <TextInput
          style={[styles.input, { color: textColor }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={mutedColor}
          secureTextEntry={effectiveSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          textContentType={textContentType}
          underlineColorAndroid="transparent"
        />
        {isPassword ? (
          <Pressable
            onPress={() => setShowSecret((s) => !s)}
            style={styles.eyeBtn}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={showSecret ? 'Hide password' : 'Show password'}>
            <Ionicons
              name={showSecret ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={mutedColor}
            />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.errorSlot}>
        {error ? (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle" size={16} color={errorColor} style={styles.errorIcon} />
            <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  label: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    minHeight: 54,
    paddingHorizontal: 16,
  },
  inputRowError: {
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 16,
    paddingVertical: Platform.OS === 'android' ? 12 : 14,
    ...Platform.select({
      android: { textAlignVertical: 'center', includeFontPadding: false },
      default: {},
    }),
  },
  eyeBtn: {
    padding: 4,
    marginLeft: 4,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 2,
    gap: 6,
  },
  errorIcon: {
    marginTop: 1,
  },
  errorText: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 18,
  },
  errorSlot: {
    minHeight: 26,
    marginTop: 6,
  },
});
