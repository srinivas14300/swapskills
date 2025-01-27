export class RateLimiter {
  private static instances: { [key: string]: RateLimiter } = {};
  
  private maxAttempts: number;
  private windowMs: number;
  private attempts: number = 0;
  private resetTimer: NodeJS.Timeout | null = null;

  private constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  public static getInstance(key: string = 'default', maxAttempts?: number, windowMs?: number): RateLimiter {
    if (!this.instances[key]) {
      this.instances[key] = new RateLimiter(maxAttempts, windowMs);
    }
    return this.instances[key];
  }

  public attempt(): boolean {
    // Reset timer if not already set
    if (!this.resetTimer) {
      this.resetTimer = setTimeout(() => {
        this.reset();
      }, this.windowMs);
    }

    // Check if max attempts exceeded
    if (this.attempts >= this.maxAttempts) {
      return false;
    }

    this.attempts++;
    return true;
  }

  public reset(): void {
    this.attempts = 0;
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }
  }

  public getRemainingAttempts(): number {
    return Math.max(0, this.maxAttempts - this.attempts);
  }

  public isLocked(): boolean {
    return this.attempts >= this.maxAttempts;
  }
}

// Usage example in authentication context
export function useAuthRateLimiter() {
  const loginRateLimiter = RateLimiter.getInstance('login');
  const googleSignInRateLimiter = RateLimiter.getInstance('googleSignIn');

  return {
    canAttemptLogin: () => loginRateLimiter.attempt(),
    canAttemptGoogleSignIn: () => googleSignInRateLimiter.attempt(),
    getRemainingLoginAttempts: () => loginRateLimiter.getRemainingAttempts(),
    isLoginLocked: () => loginRateLimiter.isLocked()
  };
}
