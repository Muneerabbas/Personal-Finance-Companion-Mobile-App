import { Redirect } from 'expo-router';

import { useAuth } from '@/context/auth-context';

/** Initial route: send users to onboarding, login, or tabs based on AuthContext. */
export default function Index() {
  const { isReady, hasCompletedOnboarding, session } = useAuth();

  if (!isReady || hasCompletedOnboarding === null) {
    return null;
  }

  if (!hasCompletedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  if (!session?.user) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
