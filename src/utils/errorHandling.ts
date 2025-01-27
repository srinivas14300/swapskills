export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  // Firebase Authentication Errors
  'auth/invalid-email': 'Invalid email address format.',
  'auth/user-disabled': 'This user account has been disabled.',
  'auth/user-not-found': 'No user found with this email address.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/email-already-in-use': 'Email is already registered. Try logging in instead.',
  'auth/weak-password': 'Password is too weak. Use a stronger password.',
  'auth/network-request-failed': 'Network error. Check your internet connection.',
  'auth/too-many-requests': 'Too many login attempts. Please try again later.',

  // Custom Validation Errors
  'validation/display-name-required': 'Display name is required.',
  'validation/password-mismatch': 'Passwords do not match.',
  'validation/password-too-short': 'Password must be at least 8 characters long.',
};

export function getErrorMessage(errorCode: string): string {
  return AUTH_ERROR_MESSAGES[errorCode] || 'An unexpected error occurred. Please try again.';
}
