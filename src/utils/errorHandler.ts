import React from 'react';
import toast from 'react-hot-toast';

export const ErrorFallback = () => {
  const handleReload = () => window.location.reload();

  return React.createElement('div', null, 
    React.createElement('h1', null, 'Something went wrong.'),
    React.createElement('button', { onClick: handleReload }, 'Reload Page')
  );
};

export const withErrorBoundary = <P extends object>(
  WrappedComponent: React.ComponentType<P>, 
  fallback?: React.ReactNode
) => {
  return class extends React.Component<P, { hasError: boolean }> {
    state = { hasError: false };

    static getDerivedStateFromError() {
      return { hasError: true };
    }

    componentDidCatch(error: Error) {
      toast.error('Something went wrong. Please try again.', {
        duration: 5000,
        position: 'top-center'
      });
      console.error(error);
    }

    render() {
      if (this.state.hasError) {
        return fallback || React.createElement(ErrorFallback);
      }

      return React.createElement(WrappedComponent, this.props);
    }
  };
};
