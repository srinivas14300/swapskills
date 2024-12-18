import { UserProfile, Skill } from '../types';
import type { Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import React, { Suspense, ComponentType, ReactNode, ErrorInfo } from 'react';

// Debounce utility function with cancel method
export function debounce<F extends (...args: unknown[]) => any>(func: F, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debouncedFn = (...args: Parameters<F>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };

  // Add method to manually cancel the debounced call
  debouncedFn.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debouncedFn;
}

// Memoization utility with configurable cache size and custom key generation
export function memoize<T extends (...args: unknown[]) => any>(
  fn: T,
  options: {
    maxSize?: number;
    keyGenerator?: (...args: unknown[]) => string;
  } = {}
): T {
  const cache = new Map<string, any>();
  const { maxSize = 100, keyGenerator = (args) => JSON.stringify(args) } = options;

  return ((...args: unknown[]) => {
    const key = keyGenerator(...args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);

    // Implement LRU cache eviction if max size is reached
    if (cache.size >= maxSize) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }

    cache.set(key, result);
    return result;
  }) as T;
}

// Error Boundary Class
class ErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback: React.ReactNode;
  },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Lazy loading utility for components with error boundary and more flexible loading
export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: {
    fallback?: ReactNode;
    errorFallback?: ReactNode;
  } = {}
) {
  const LazyComponent = React.lazy(importFn);

  function WrappedComponent(props: React.ComponentProps<T>) {
    const defaultFallback = React.createElement(
      'div',
      { className: 'text-center p-4 text-gray-500' },
      'Loading component...'
    );

    const defaultErrorFallback = React.createElement(
      'div',
      { className: 'text-center p-4 text-red-500' },
      'Failed to load component'
    );

    return React.createElement(
      React.Suspense,
      { fallback: options.fallback || defaultFallback },
      React.createElement(
        ErrorBoundary,
        { fallback: options.errorFallback || defaultErrorFallback },
        React.createElement(LazyComponent, props)
      )
    );
  }

  return WrappedComponent;
}
