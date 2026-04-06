const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

const MIN_PASSWORD_LEN = 6;

export function loginEmailError(email: string, hasInteracted: boolean): string | null {
  if (!hasInteracted) return null;
  const t = email.trim();
  if (!t) return 'Email is required';
  if (!isValidEmail(t)) return 'Enter a valid email address';
  return null;
}

export function loginPasswordError(password: string, hasInteracted: boolean): string | null {
  if (!hasInteracted) return null;
  if (!password) return 'Password is required';
  return null;
}

export function signUpNameError(name: string, hasInteracted: boolean): string | null {
  if (!hasInteracted) return null;
  if (!name.trim()) return 'Name is required';
  if (name.trim().length < 2) return 'Use at least 2 characters';
  return null;
}

export function signUpEmailError(email: string, hasInteracted: boolean): string | null {
  if (!hasInteracted) return null;
  const t = email.trim();
  if (!t) return 'Email is required';
  if (!isValidEmail(t)) return 'Enter a valid email address';
  return null;
}

export function signUpPasswordError(password: string, hasInteracted: boolean): string | null {
  if (!hasInteracted) return null;
  if (!password) return 'Password is required';
  if (password.length < MIN_PASSWORD_LEN) return `Use at least ${MIN_PASSWORD_LEN} characters`;
  return null;
}

export function canSubmitLogin(email: string, password: string): boolean {
  return Boolean(email.trim() && isValidEmail(email) && password.length > 0);
}

export function canSubmitSignUp(name: string, email: string, password: string): boolean {
  return Boolean(
    name.trim().length >= 2 && email.trim() && isValidEmail(email) && password.length >= MIN_PASSWORD_LEN,
  );
}
