import { ErrorHandler } from '../utils/errorHandler';
import toast from 'react-hot-toast';
import { logger } from '../utils/logger';
import { shallow } from 'enzyme';
import React from 'react';

jest.mock('react-hot-toast');
jest.mock('../utils/logger');

describe('ErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleAuthError', () => {
    it('should handle user not found error', () => {
      const mockError = { code: 'auth/user-not-found' };
      
      ErrorHandler.handleAuthError(mockError);

      expect(toast.error).toHaveBeenCalledWith(
        'No account found with this email.',
        expect.objectContaining({ duration: 4000 })
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Authentication Error', 
        expect.objectContaining({ errorCode: 'auth/user-not-found' })
      );
    });

    it('should handle wrong password error', () => {
      const mockError = { code: 'auth/wrong-password' };
      
      ErrorHandler.handleAuthError(mockError);

      expect(toast.error).toHaveBeenCalledWith(
        'Incorrect password. Please try again.',
        expect.objectContaining({ duration: 4000 })
      );
    });

    it('should use default message for unknown error', () => {
      const mockError = { code: 'unknown-error' };
      
      ErrorHandler.handleAuthError(mockError);

      expect(toast.error).toHaveBeenCalledWith(
        'An unexpected error occurred.',
        expect.objectContaining({ duration: 4000 })
      );
    });
  });

  describe('createErrorBoundary', () => {
    const ErrorBoundary = ErrorHandler.createErrorBoundary();
    
    it('should render children when no error', () => {
      const TestComponent = () => <div>Test</div>;
      const wrapper = shallow(
        <ErrorBoundary>
          <TestComponent />
        </ErrorBoundary>
      );

      expect(wrapper.find(TestComponent)).toHaveLength(1);
    });

    it('should handle error and log it', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const ThrowingComponent = () => {
        throw new Error('Test Error');
      };

      const wrapper = shallow(
        <ErrorBoundary>
          <ThrowingComponent />
        </ErrorBoundary>
      );

      expect(logger.error).toHaveBeenCalledWith(
        'Unhandled Error', 
        expect.objectContaining({ error: expect.any(Error) })
      );
      expect(wrapper.find('h1').text()).toBe('Something went wrong.');

      consoleErrorSpy.mockRestore();
    });
  });
});
