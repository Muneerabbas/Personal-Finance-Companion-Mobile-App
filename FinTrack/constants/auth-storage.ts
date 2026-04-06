/** AsyncStorage keys for auth / onboarding (Supabase still stores the full JWT under its own `sb-*` keys). */
export const AUTH_STORAGE_KEYS = {
  /** Legacy key — keep for existing installs. */
  ONBOARDING_COMPLETE: 'hasFinishedOnboarding',
  /** App-level snapshot after sign-in (for quick checks / debugging). Not a replacement for Supabase session storage. */
  SESSION_SNAPSHOT: '@fintrack/session_snapshot',
  /** Set when user has saved tokens for biometric unlock (cleared on sign-out). */
  BIOMETRIC_UNLOCK_CONFIGURED: '@fintrack/biometric_unlock_configured',
  /** Per-user outcome of the post-login biometric setup flow: enabled | skipped | unavailable */
  BIOMETRIC_SETUP_PREFIX: '@fintrack/biometric_setup_',
} as const;

export type SessionSnapshot = {
  userId: string;
  expiresAt: number | undefined;
  /** Present so you can read a token from our namespace if needed; mirrors current Supabase session. */
  accessToken: string;
};
