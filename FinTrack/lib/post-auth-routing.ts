import type { Href } from 'expo-router';

import { getBiometricSetupOutcome, isBiometricUnlockConfigured } from '@/lib/biometric-auth';
import { supabase } from '@/lib/supabase';

type ReplaceFn = (href: Href) => void;

export type PostAuthRoutingOptions = {
  /** Marks app biometric gate satisfied for this process (user just proved identity on the sign-in screen). */
  satisfyBiometricAppLock?: () => void;
};

/**
 * After the user has a session while still inside `(auth)` (e.g. email/password or biometric restore),
 * send them to biometric setup once, or straight home if they already completed or skipped it.
 */
export async function replaceAfterSuccessfulAuth(
  router: { replace: ReplaceFn },
  options?: PostAuthRoutingOptions,
) {
  const { data: { session } } = await supabase.auth.getSession();
  const uid = session?.user?.id;
  const outcome = uid ? await getBiometricSetupOutcome(uid) : null;
  const biometricConfigured = await isBiometricUnlockConfigured();

  if (outcome === 'skipped' || outcome === 'unavailable') {
    options?.satisfyBiometricAppLock?.();
    router.replace('/(tabs)');
    return;
  }
  if (outcome === 'enabled' && biometricConfigured) {
    options?.satisfyBiometricAppLock?.();
    router.replace('/(tabs)');
    return;
  }
  router.replace('/setup-biometric');
}
