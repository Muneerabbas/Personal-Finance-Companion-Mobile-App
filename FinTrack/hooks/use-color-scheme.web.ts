import { useEffect, useState } from 'react';

import { useThemePreference } from '@/context/theme-preference-context';

/**
 * Web: avoid hydration mismatch by matching server render, then use stored preference.
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const { colorScheme } = useThemePreference();

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
