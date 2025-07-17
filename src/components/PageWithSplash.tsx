import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthProvider';
import SplashScreen from './SplashScreen';
import type { PageType } from '../App';

interface PageWithSplashProps {
  currentPage: PageType;
  children: React.ReactNode;
}

const PageWithSplash: React.FC<PageWithSplashProps> = ({ 
  currentPage, 
  children 
}) => {
  const { currentUser } = useAuth();
  const [showSplash, setShowSplash] = useState(false);

  // Only show splash screen for landing and dashboard pages
  const shouldHaveSplash = currentPage === 'landing' || currentPage === 'dashboard';

  useEffect(() => {
    if (!shouldHaveSplash) {
      setShowSplash(false);
      return;
    }

    // Show splash screen immediately for 10 seconds
    setShowSplash(true);
    
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 10000); // 10 seconds display time

    return () => clearTimeout(splashTimer);
  }, [currentPage, shouldHaveSplash]);

  // Show splash screen only for landing and dashboard pages
  if (shouldHaveSplash && showSplash) {
    const getMessage = () => {
      switch (currentPage) {
        case 'dashboard':
          return currentUser ? 'Welcome back! Preparing your workspace...' : 'Welcome! Setting up your experience...';
        case 'landing':
          return 'Welcome to the Future of Academic Translation';
        default:
          return 'Welcome to Nyota Translation Center';
      }
    };

    return <SplashScreen message={getMessage()} />;
  }

  return <>{children}</>;
};

export default PageWithSplash;
