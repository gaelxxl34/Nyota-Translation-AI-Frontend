import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  showSplash: (message?: string) => void;
  hideSplash: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');

  const showSplash = (message: string = 'Loading...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  };

  const hideSplash = () => {
    setIsLoading(false);
  };

  return (
    <LoadingContext.Provider value={{
      isLoading,
      loadingMessage,
      showSplash,
      hideSplash
    }}>
      {children}
    </LoadingContext.Provider>
  );
};
