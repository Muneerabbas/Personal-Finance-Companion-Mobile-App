import { Colors } from '@/constants/theme';

/**
 * Onboarding illustration tokens derived from app theme (light / dark).
 */
export function getOnboardingColors(scheme: 'light' | 'dark') {
  const t = Colors[scheme];
  const isDark = scheme === 'dark';
  return {
    background: t.background,
    card: t.card,
    text: t.text,
    muted: t.muted,
    border: t.border,
    primary: t.primary,
    /** Large tinted surfaces (chart circle, soft bars). */
    primaryTint: isDark ? 'rgba(167, 139, 255, 0.14)' : '#F3E8FF',
    /** Mid purple for inactive chart / bar fills. */
    primaryTintMedium: isDark ? 'rgba(167, 139, 255, 0.32)' : '#D8B4FE',
    /** Neutral bar / divider fills in mock UI. */
    barMuted: isDark ? t.border : '#E5E7EB',
    docAccentIcon: isDark ? 'rgba(167, 139, 255, 0.45)' : '#C4B5FD',
    lockIcon: isDark ? t.muted : '#D1D5DB',
    guestBg: isDark ? 'rgba(167, 139, 255, 0.14)' : '#F3E8FF',
    badgeSurface: isDark ? t.card : '#FFFFFF',
    dotInactive: isDark ? '#4B5568' : '#D1D5DB',
    shadow: isDark ? 'rgba(0,0,0,0.45)' : '#000000',
    shadowOpacity: isDark ? 0.35 : 0.1,
  };
}

export type OnboardingColors = ReturnType<typeof getOnboardingColors>;
