import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { AUTH_STORAGE_KEYS } from '@/constants/auth-storage';

const SECURE_SESSION_KEY = 'fintrack.biometric_session';

/** Thrown when the user dismisses the biometric prompt while enabling login (Android pre-save check). */
export const BIOMETRIC_ENABLE_AUTH_CANCELLED = 'BIOMETRIC_ENABLE_AUTH_CANCELLED';

export type BiometricSetupOutcome = 'enabled' | 'skipped' | 'unavailable';

type StoredBiometricSession = {
  access_token: string;
  refresh_token: string;
};

function setupKeyForUser(userId: string) {
  return `${AUTH_STORAGE_KEYS.BIOMETRIC_SETUP_PREFIX}${userId}`;
}

export async function getBiometricLabel(): Promise<string> {
  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

  if (Platform.OS === 'android') {
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'Fingerprint';
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'Face unlock';
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) return 'Iris';
    return 'Device lock';
  }

  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'Face ID';
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'Touch ID';
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) return 'iris scan';
  return 'device lock';
}

export async function isBiometricHardwareReady(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return false;
  return LocalAuthentication.isEnrolledAsync();
}

export async function authenticateWithBiometric(promptMessage: string): Promise<boolean> {
  const r = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: 'Cancel',
    disableDeviceFallback: false,
  });
  return r.success;
}

export async function saveBiometricSession(access_token: string, refresh_token: string): Promise<void> {
  if (Platform.OS === 'android') {
    const ok = await authenticateWithBiometric('Use your fingerprint to turn on biometric login');
    if (!ok) throw new Error(BIOMETRIC_ENABLE_AUTH_CANCELLED);
  }

  const payload = JSON.stringify({ access_token, refresh_token } satisfies StoredBiometricSession);
  await SecureStore.setItemAsync(SECURE_SESSION_KEY, payload, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    requireAuthentication: Platform.OS !== 'web',
    authenticationPrompt:
      Platform.OS === 'android' ? 'Save login with fingerprint' : 'Save for FinTrack',
  });
  await AsyncStorage.setItem(AUTH_STORAGE_KEYS.BIOMETRIC_UNLOCK_CONFIGURED, 'true');
}

export async function unlockBiometricSession(): Promise<StoredBiometricSession | null> {
  if (Platform.OS === 'web') return null;
  try {
    const raw = await SecureStore.getItemAsync(SECURE_SESSION_KEY, {
      requireAuthentication: true,
      authenticationPrompt: 'Unlock FinTrack',
    });
    if (!raw) return null;
    return JSON.parse(raw) as StoredBiometricSession;
  } catch {
    return null;
  }
}

export async function clearBiometricLoginData(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SECURE_SESSION_KEY);
  } catch {
    /* ignore */
  }
  await AsyncStorage.removeItem(AUTH_STORAGE_KEYS.BIOMETRIC_UNLOCK_CONFIGURED);
}

export async function isBiometricUnlockConfigured(): Promise<boolean> {
  const v = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.BIOMETRIC_UNLOCK_CONFIGURED);
  return v === 'true';
}

export async function getBiometricSetupOutcome(userId: string): Promise<BiometricSetupOutcome | null> {
  const v = await AsyncStorage.getItem(setupKeyForUser(userId));
  if (v === 'enabled' || v === 'skipped' || v === 'unavailable') return v;
  return null;
}

export async function setBiometricSetupOutcome(userId: string, outcome: BiometricSetupOutcome): Promise<void> {
  await AsyncStorage.setItem(setupKeyForUser(userId), outcome);
}

/** Turn off biometric unlock from settings (clears stored tokens and marks preference as skipped). */
export async function disableBiometricLogin(userId: string): Promise<void> {
  await clearBiometricLoginData();
  await setBiometricSetupOutcome(userId, 'skipped');
}

/** Whether the user has biometric login fully enabled (saved session + preference). */
export async function isBiometricLoginEnabledForUser(userId: string): Promise<boolean> {
  const [configured, outcome] = await Promise.all([
    isBiometricUnlockConfigured(),
    getBiometricSetupOutcome(userId),
  ]);
  return configured && outcome === 'enabled';
}
