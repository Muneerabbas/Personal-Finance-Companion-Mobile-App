import { Redirect } from 'expo-router';

import { useAuth } from '@/context/auth-context';

/** Initial route: send users to onboarding, login, or tabs based on AuthContext. */
export default function Index() {
  const {
    isReady,
    hasCompletedOnboarding,
    session,
    biometricAppLockCheckComplete,
    needsBiometricAppLock,
    biometricAppLockSatisfied,
  } = useAuth();

  if (!isReady || hasCompletedOnboarding === null || !biometricAppLockCheckComplete) {
    return null;
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  if (!session?.user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (needsBiometricAppLock && !biometricAppLockSatisfied) {
    return <Redirect href="/unlock-app" />;
  }

  return <Redirect href="/(tabs)" />;
}
