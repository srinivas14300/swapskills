import { RateLimiter } from '../utils/rateLimiter';

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    // Reset the singleton instance before each test
    (RateLimiter as any).instances = {};
    rateLimiter = RateLimiter.getInstance('test', 3, 1000);
  });

  it('should allow attempts within limit', () => {
    expect(rateLimiter.attempt()).toBe(true);
    expect(rateLimiter.attempt()).toBe(true);
    expect(rateLimiter.attempt()).toBe(true);
  });

  it('should block attempts after reaching limit', () => {
    // Exhaust attempts
    rateLimiter.attempt();
    rateLimiter.attempt();
    rateLimiter.attempt();

    // Fourth attempt should be blocked
    expect(rateLimiter.attempt()).toBe(false);
  });

  it('should reset attempts after window', async () => {
    // Exhaust attempts
    rateLimiter.attempt();
    rateLimiter.attempt();
    rateLimiter.attempt();

    // Fourth attempt should be blocked
    expect(rateLimiter.attempt()).toBe(false);

    // Wait for reset
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Should allow attempts again
    expect(rateLimiter.attempt()).toBe(true);
  });

  it('should track remaining attempts', () => {
    expect(rateLimiter.getRemainingAttempts()).toBe(3);
    
    rateLimiter.attempt();
    expect(rateLimiter.getRemainingAttempts()).toBe(2);
    
    rateLimiter.attempt();
    rateLimiter.attempt();
    expect(rateLimiter.getRemainingAttempts()).toBe(0);
  });

  it('should support multiple instances', () => {
    const loginLimiter = RateLimiter.getInstance('login', 2);
    const signupLimiter = RateLimiter.getInstance('signup', 3);

    // Login limiter has 2 attempts
    loginLimiter.attempt();
    loginLimiter.attempt();
    expect(loginLimiter.attempt()).toBe(false);

    // Signup limiter has 3 attempts
    signupLimiter.attempt();
    signupLimiter.attempt();
    signupLimiter.attempt();
    expect(signupLimiter.attempt()).toBe(false);
  });
});
