import { analytics } from '../firebase';
import { logEvent } from 'firebase/analytics';

export class AuthMonitoring {
  private static instance: AuthMonitoring;
  private loginAttempts: number = 0;
  private successfulLogins: number = 0;
  private failedLogins: number = 0;

  private constructor() {}

  public static getInstance(): AuthMonitoring {
    if (!AuthMonitoring.instance) {
      AuthMonitoring.instance = new AuthMonitoring();
    }
    return AuthMonitoring.instance;
  }

  public recordLoginAttempt(success: boolean, method: 'email' | 'google' = 'email') {
    this.loginAttempts++;
    
    if (success) {
      this.successfulLogins++;
      this.trackAnalytics('login_success', { method });
    } else {
      this.failedLogins++;
      this.trackAnalytics('login_failure', { method });
    }
  }

  private trackAnalytics(eventName: string, params?: { [key: string]: any }) {
    try {
      logEvent(analytics, eventName, params);
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  public getAuthStats() {
    return {
      totalAttempts: this.loginAttempts,
      successfulLogins: this.successfulLogins,
      failedLogins: this.failedLogins,
      successRate: this.loginAttempts > 0 
        ? (this.successfulLogins / this.loginAttempts) * 100 
        : 0
    };
  }

  public generateSecurityReport() {
    const stats = this.getAuthStats();
    
    return {
      ...stats,
      securityLevel: this.assessSecurityLevel(stats)
    };
  }

  private assessSecurityLevel(stats: ReturnType<typeof this.getAuthStats>) {
    if (stats.successRate < 50) return 'HIGH_RISK';
    if (stats.successRate < 75) return 'MODERATE_RISK';
    return 'LOW_RISK';
  }

  public resetStats() {
    this.loginAttempts = 0;
    this.successfulLogins = 0;
    this.failedLogins = 0;
  }
}

// Singleton export
export const authMonitoring = AuthMonitoring.getInstance();
