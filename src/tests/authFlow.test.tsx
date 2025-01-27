import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import { ErrorHandler } from '../utils/errorHandler';
import { RateLimiter } from '../utils/rateLimiter';
import { PerformanceMonitor } from '../utils/performanceMonitor';

// Mock Firebase Authentication
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: jest.fn()
}));

describe('Authentication Flow Integration', () => {
  let loginRateLimiter: RateLimiter;
  let performanceMonitorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Reset rate limiter
    (RateLimiter as any).instances = {};
    loginRateLimiter = RateLimiter.getInstance('login', 3, 1000);

    // Spy on performance monitor
    performanceMonitorSpy = jest.spyOn(PerformanceMonitor, 'start');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Login Component', () => {
    it('should handle successful login', async () => {
      const { getByTestId } = render(
        <AuthProvider>
          <Login />
        </AuthProvider>
      );

      // Fill login form
      fireEvent.change(getByTestId('email-input'), { 
        target: { value: 'test@example.com' } 
      });
      fireEvent.change(getByTestId('password-input'), { 
        target: { value: 'validpassword' } 
      });

      // Submit login
      fireEvent.click(getByTestId('login-button'));

      await waitFor(() => {
        // Check performance tracking was initiated
        expect(performanceMonitorSpy).toHaveBeenCalledWith('signIn');
      });
    });

    it('should enforce rate limiting', async () => {
      const { getByTestId } = render(
        <AuthProvider>
          <Login />
        </AuthProvider>
      );

      // Exhaust login attempts
      for (let i = 0; i < 3; i++) {
        fireEvent.change(getByTestId('email-input'), { 
          target: { value: `attempt${i}@example.com` } 
        });
        fireEvent.change(getByTestId('password-input'), { 
          target: { value: 'wrongpassword' } 
        });
        fireEvent.click(getByTestId('login-button'));
      }

      // Fourth attempt should be blocked
      await waitFor(() => {
        expect(loginRateLimiter.attempt()).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors gracefully', async () => {
      const errorHandlerSpy = jest.spyOn(ErrorHandler, 'handleAuthError');

      const { getByTestId } = render(
        <AuthProvider>
          <Login />
        </AuthProvider>
      );

      // Simulate invalid login
      fireEvent.change(getByTestId('email-input'), { 
        target: { value: 'invalid@example.com' } 
      });
      fireEvent.change(getByTestId('password-input'), { 
        target: { value: 'wrongpassword' } 
      });
      fireEvent.click(getByTestId('login-button'));

      await waitFor(() => {
        // Check that error handler was called
        expect(errorHandlerSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Performance Monitoring', () => {
    it('should track authentication performance', async () => {
      const performanceReportSpy = jest.spyOn(PerformanceMonitor, 'generatePerformanceReport');

      const { getByTestId } = render(
        <AuthProvider>
          <Login />
        </AuthProvider>
      );

      // Perform login
      fireEvent.change(getByTestId('email-input'), { 
        target: { value: 'test@example.com' } 
      });
      fireEvent.change(getByTestId('password-input'), { 
        target: { value: 'validpassword' } 
      });
      fireEvent.click(getByTestId('login-button'));

      await waitFor(() => {
        // Generate performance report
        const report = PerformanceMonitor.generatePerformanceReport();
        
        // Check that performance metrics were collected
        expect(Object.keys(report)).toContain('signIn');
      });
    });
  });
});
