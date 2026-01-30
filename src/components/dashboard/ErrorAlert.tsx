// Error Alert Component
// Dismissible error message display

import React from 'react';

interface ErrorAlertProps {
  error: string | null;
  onDismiss: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-sm sm:text-base">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
        <div className="ml-auto">
          <button onClick={onDismiss} className="text-red-400 hover:text-red-500">
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorAlert;
