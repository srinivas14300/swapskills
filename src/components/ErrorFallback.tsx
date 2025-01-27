import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface ErrorFallbackProps {
  error?: Error;
  componentName?: string;
  resetErrorBoundary?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  componentName = 'Component',
  resetErrorBoundary
}) => {
  return (
    <div 
      role="alert" 
      className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4"
    >
      <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
        <AlertTriangle 
          className="mx-auto mb-4 text-red-500" 
          size={64} 
        />
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Oops! {componentName} Failed to Load
        </h2>
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-4">
            <p className="text-sm text-red-700 break-words">
              {error.message}
            </p>
          </div>
        )}
        
        <div className="flex justify-center space-x-4">
          {resetErrorBoundary && (
            <button 
              onClick={resetErrorBoundary}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              <RefreshCw className="mr-2" size={16} />
              Retry
            </button>
          )}
          
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
          >
            <RefreshCw className="mr-2" size={16} />
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
};
