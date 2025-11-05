// Main App Component for Nyota Translation Center (NTC)
// Handles routing and main application shell

import React, { useState, useEffect, useRef } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './AuthProvider';
import { LanguageProvider } from './contexts/LanguageContext';
import { LoadingProvider } from './contexts/LoadingContext';
import PageWithSplash from './components/PageWithSplash';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import FirestoreOnlyDashboardPage from './components/FirestoreOnlyDashboardPage';
import TermsAndConditionsPage from './components/TermsAndConditionsPage';
import PrivacyPolicyPage from './components/PrivacyPolicyPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import CardOnlyPage from './components/CardOnlyPage';
import DocumentVerificationPage from './components/DocumentVerificationPage';
import HighSchoolAttestationTestPage from './components/HighSchoolAttestationTestPage';

// Simple page routing state
/**
 * PageType: All valid page keys for navigation and routing
 */
type PageType =
  | 'landing'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'terms'
  | 'privacy'
  | 'forgot-password'
  | 'card-only'
  | 'verify'
  | 'highschool-attestation-test';

/**
 * Navigation function type for all pages
 */
type NavigateToPage = (page: PageType) => void;

// Helper function to get page from pathname
const getPageFromPath = (pathname: string): PageType => {
  if (pathname === '/login') return 'login';
  if (pathname === '/register') return 'register';
  if (pathname === '/dashboard') return 'dashboard';
  if (pathname === '/terms') return 'terms';
  if (pathname === '/privacy') return 'privacy';
  if (pathname === '/forgot-password') return 'forgot-password';
  if (pathname === '/card-only') return 'card-only';
  if (pathname === '/verify' || pathname.startsWith('/verify?')) return 'verify';
  if (pathname === '/highschool-attestation-test') return 'highschool-attestation-test';
  return 'landing';
};

// Helper function to get path from page
const getPathFromPage = (page: PageType): string => {
  const paths: Record<PageType, string> = {
    'landing': '/',
    'login': '/login',
    'register': '/register',
    'dashboard': '/dashboard',
    'terms': '/terms',
    'privacy': '/privacy',
    'forgot-password': '/forgot-password',
    'card-only': '/card-only',
    'verify': '/verify',
    'highschool-attestation-test': '/highschool-attestation-test',
  };
  return paths[page] || '/';
};

// Auth-aware routing component
const AuthAwareRouter: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    return getPageFromPath(window.location.pathname);
  });
  
  // Keep track of auth state to handle auth changes without losing page state
  const previousAuthState = useRef<boolean | null>(null);
  const isAuthenticated = !!currentUser;

  // Handle browser navigation (back/forward buttons, direct URL access)
  useEffect(() => {
    const handlePopState = () => {
      const newPage = getPageFromPath(window.location.pathname);
      setCurrentPage(newPage);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle auth state changes intelligently
  useEffect(() => {
    // Skip on initial load
    if (previousAuthState.current === null) {
      previousAuthState.current = isAuthenticated;
      return;
    }

    // Only handle auth state changes after initial load
    if (previousAuthState.current !== isAuthenticated) {
      if (isAuthenticated) {
        // User just logged in - redirect to dashboard if on auth pages
        if (['login', 'register', 'forgot-password'].includes(currentPage)) {
          navigateToPage('dashboard');
        }
      } else {
        // User just logged out - redirect to landing if on protected pages
        if (['dashboard'].includes(currentPage)) {
          navigateToPage('landing');
        }
      }
      previousAuthState.current = isAuthenticated;
    }
  }, [isAuthenticated, currentPage]);

  // Navigation function that properly updates both state and URL
  const navigateToPage: NavigateToPage = (page) => {
    const newPath = getPathFromPage(page);
    
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
    }
    
    setCurrentPage(page);
  };

  // Show loading spinner only on initial auth check
  if (loading && previousAuthState.current === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Route protection logic
  const isProtectedRoute = (page: PageType): boolean => {
  return ['dashboard'].includes(page);
  };

  const isAuthRoute = (page: PageType): boolean => {
    return ['login', 'register', 'forgot-password'].includes(page);
  };

  // Handle protected routes
  if (isProtectedRoute(currentPage) && !isAuthenticated) {
    return <LoginPage onNavigate={navigateToPage} />;
  }

  // Handle auth routes when already authenticated
  if (isAuthRoute(currentPage) && isAuthenticated) {
    return <FirestoreOnlyDashboardPage />;
  }

  // Render the appropriate page (excluding card-only which is handled separately)
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onNavigate={navigateToPage} />;
      case 'register':
        return <RegisterPage onNavigate={navigateToPage} />;
      case 'dashboard':
        return <FirestoreOnlyDashboardPage />;
      case 'terms':
        return <TermsAndConditionsPage onNavigate={navigateToPage} />;
      case 'privacy':
        return <PrivacyPolicyPage onNavigate={navigateToPage} />;
      case 'forgot-password':
        return <ForgotPasswordPage onNavigate={navigateToPage} />;
      case 'verify':
        return <DocumentVerificationPage onNavigate={navigateToPage} />;
      case 'highschool-attestation-test':
        return <HighSchoolAttestationTestPage />;
      case 'landing':
      default:
        return <LandingPage onNavigate={navigateToPage} />;
    }
  };

  return (
    <div className={currentPage === 'card-only' || currentPage === 'verify' || currentPage === 'highschool-attestation-test' ? "min-h-screen bg-white" : "min-h-screen bg-gray-50"}>
      {currentPage === 'card-only' ? (
        // Card-only page doesn't need splash screen
        <CardOnlyPage />
      ) : currentPage === 'verify' ? (
        // Verification page doesn't need splash screen
        <DocumentVerificationPage onNavigate={navigateToPage} />
      ) : currentPage === 'highschool-attestation-test' ? (
        // Test page doesn't need splash screen
        <HighSchoolAttestationTestPage />
      ) : (
        // All other pages get splash screen
        <PageWithSplash currentPage={currentPage}>
          {renderCurrentPage()}
        </PageWithSplash>
      )}
    </div>
  );
};

// Main App component with AuthProvider and LanguageProvider wrappers
const App: React.FC = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <LanguageProvider>
          <LoadingProvider>
            <AuthAwareRouter />
          </LoadingProvider>
        </LanguageProvider>
      </AuthProvider>
    </HelmetProvider>
  );
};

// Export PageType and NavigateToPage for use in other components
export type { PageType, NavigateToPage };

export default App;