import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthError, Session, User } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { AUTH_STORAGE_KEYS, type SessionSnapshot } from '@/constants/auth-storage';
import { clearBiometricLoginData, isBiometricLoginEnabledForUser } from '@/lib/biometric-auth';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';

type AuthContextValue = {
  isReady: boolean;
  session: Session | null;
  user: User | null;
  /** `null` until AsyncStorage has been read. */
  hasCompletedOnboarding: boolean | null;
  /** Resolved for the current user: whether opening the app should require biometric before the main UI. */
  biometricAppLockCheckComplete: boolean;
  needsBiometricAppLock: boolean;
  /** In-memory only; resets on process restart. Cleared on sign-out. */
  biometricAppLockSatisfied: boolean;
  /** Call after password / biometric sign-in or successful app unlock so the user can reach the main UI. */
  satisfyBiometricAppLock: () => void;
  /** Re-read preference from storage (e.g. after toggling biometric in Profile). */
  refreshBiometricAppLockRequirement: () => Promise<void>;
  /** Mark onboarding done and persist (then navigate to login from the caller). */
  completeOnboarding: () => Promise<void>;
  signOut: () => Promise<{ error: AuthError | null }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function readOnboardingFlag(): Promise<boolean> {
  const v = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.ONBOARDING_COMPLETE);
  return v === 'true';
}

async function persistSessionSnapshot(session: Session | null) {
  if (session?.user && session.access_token) {
    const snap: SessionSnapshot = {
      userId: session.user.id,
      expiresAt: session.expires_at,
      accessToken: session.access_token,
    };
    await AsyncStorage.setItem(AUTH_STORAGE_KEYS.SESSION_SNAPSHOT, JSON.stringify(snap));
  } else {
    await AsyncStorage.removeItem(AUTH_STORAGE_KEYS.SESSION_SNAPSHOT);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [biometricAppLockCheckComplete, setBiometricAppLockCheckComplete] = useState(false);
  const [needsBiometricAppLock, setNeedsBiometricAppLock] = useState(false);
  const [biometricAppLockSatisfied, setBiometricAppLockSatisfied] = useState(false);

  const satisfyBiometricAppLock = useCallback(() => {
    setBiometricAppLockSatisfied(true);
  }, []);

  const refreshBiometricAppLockRequirement = useCallback(async () => {
    if (Platform.OS === 'web' || !session?.user) {
      setNeedsBiometricAppLock(false);
      return;
    }
    const enabled = await isBiometricLoginEnabledForUser(session.user.id);
    setNeedsBiometricAppLock(enabled);
  }, [session?.user]);

  useEffect(() => {
    if (Platform.OS === 'web' || !session?.user) {
      setNeedsBiometricAppLock(false);
      setBiometricAppLockCheckComplete(true);
      return;
    }

    let cancelled = false;
    setBiometricAppLockCheckComplete(false);
    (async () => {
      try {
        const enabled = await isBiometricLoginEnabledForUser(session.user.id);
        if (!cancelled) {
          setNeedsBiometricAppLock(enabled);
          setBiometricAppLockCheckComplete(true);
        }
      } catch {
        if (!cancelled) {
          setNeedsBiometricAppLock(false);
          setBiometricAppLockCheckComplete(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [done, { data }] = await Promise.all([readOnboardingFlag(), supabase.auth.getSession()]);
        if (cancelled) return;
        const nextSession = data.session ?? null;
        setSession(nextSession);
        useStore.setState({ user: nextSession?.user ?? null });
        setHasCompletedOnboarding(done);
        await persistSessionSnapshot(nextSession);
      } finally {
        if (!cancelled) setIsReady(true);
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      useStore.setState({ user: nextSession?.user ?? null });
      void persistSessionSnapshot(nextSession);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(AUTH_STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
    setHasCompletedOnboarding(true);
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    await clearBiometricLoginData();
    await persistSessionSnapshot(null);
    setBiometricAppLockSatisfied(false);
    setNeedsBiometricAppLock(false);
    setBiometricAppLockCheckComplete(true);
    useStore.setState({
      user: null,
      transactions: [],
      goals: [],
      monthlyBudget: null,
      isInitialSyncComplete: false,
      syncInProgress: false,
    });
    return { error };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      session,
      user: session?.user ?? null,
      hasCompletedOnboarding,
      biometricAppLockCheckComplete,
      needsBiometricAppLock,
      biometricAppLockSatisfied,
      satisfyBiometricAppLock,
      refreshBiometricAppLockRequirement,
      completeOnboarding,
      signOut,
    }),
    [
      isReady,
      session,
      hasCompletedOnboarding,
      biometricAppLockCheckComplete,
      needsBiometricAppLock,
      biometricAppLockSatisfied,
      satisfyBiometricAppLock,
      refreshBiometricAppLockRequirement,
      completeOnboarding,
      signOut,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
