import { useThemePreference } from '@/context/theme-preference-context';

/** App color scheme (light/dark), honoring Profile → Appearance when not set to System. */
export function useColorScheme() {
  return useThemePreference().colorScheme;
}
