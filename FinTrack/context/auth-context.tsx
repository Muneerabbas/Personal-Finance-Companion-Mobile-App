import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthError, Session, User } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { AUTH_STORAGE_KEYS, type SessionSnapshot } from '@/constants/auth-storage';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';

type AuthContextValue = {
  isReady: boolean;
  session: Session | null;
  user: User | null;
  /** `null` until AsyncStorage has been read. */
  hasCompletedOnboarding: boolean | null;
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
    await persistSessionSnapshot(null);
    useStore.setState({
      user: null,
      transactions: [],
      goals: [],
      monthlyBudget: null,
    });
    return { error };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      session,
      user: session?.user ?? null,
      hasCompletedOnboarding,
      completeOnboarding,
      signOut,
    }),
    [isReady, session, hasCompletedOnboarding, completeOnboarding, signOut],
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
