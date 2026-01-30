// Main App Component for Nyota Translation Center (NTC)
// Handles routing and main application shell

import React, { useState, useEffect, useRef } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './AuthProvider';
import { LanguageProvider } from './contexts/LanguageContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { LoadingScreen } from './components/common';
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  FirestoreOnlyDashboardPage,
  TermsAndConditionsPage,
  PrivacyPolicyPage,
  ForgotPasswordPage,
  CardOnlyPage,
  DocumentVerificationPage,
  AdminDashboardPage,
  TranslatorDashboardPage,
  PartnerDashboardPage,
  SupportDashboardPage
} from './pages';

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
  | 'admin'
  | 'translator'
  | 'partner'
  | 'support';

/**
 * Navigation function type for all pages
 */
type NavigateToPage = (page: PageType) => void;

// Helper function to get page from pathname
const getPageFromPath = (pathname: string): PageType => {
  if (pathname === '/login') return 'login';
  if (pathname === '/register') return 'register';
  if (pathname === '/dashboard') return 'dashboard';
  if (pathname === '/stats') return 'admin'; // Redirect stats to admin (will load /admin/statistics)
  if (pathname === '/terms') return 'terms';
  if (pathname === '/privacy') return 'privacy';
  if (pathname === '/forgot-password') return 'forgot-password';
  if (pathname === '/card-only') return 'card-only';
  if (pathname === '/verify' || pathname.startsWith('/verify?')) return 'verify';
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/translator')) return 'translator';
  if (pathname.startsWith('/partner')) return 'partner';
  if (pathname.startsWith('/support')) return 'support';
  return 'landing';
};

// Helper function to get admin sub-page from pathname
export const getAdminSubPage = (pathname: string): string => {
  const match = pathname.match(/^\/admin\/?(\w*)/);
  return match?.[1] || 'overview';
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
    'admin': '/admin',
    'translator': '/translator',
    'partner': '/partner',
    'support': '/support',
  };
  return paths[page] || '/';
};

// Auth-aware routing component
const AuthAwareRouter: React.FC = () => {
  const { currentUser, loading, userRole } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    return getPageFromPath(window.location.pathname);
  });
  
  // Keep track of auth state to handle auth changes without losing page state
  const previousAuthState = useRef<boolean | null>(null);
  const hasRedirected = useRef<boolean>(false);
  const isAuthenticated = !!currentUser;

  // Navigation function that properly updates both state and URL
  const navigateToPage: NavigateToPage = (page) => {
    const newPath = getPathFromPage(page);
    
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
    }
    
    setCurrentPage(page);
  };

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
        // User just logged in - will redirect once role is available
        hasRedirected.current = false;
      } else {
        // User just logged out - redirect to landing if on protected pages
        if (['dashboard', 'admin', 'translator', 'partner', 'support'].includes(currentPage)) {
          navigateToPage('landing');
        }
        hasRedirected.current = false;
      }
      previousAuthState.current = isAuthenticated;
    }
  }, [isAuthenticated, currentPage]);

  // Handle role-based redirection after login or on page load
  useEffect(() => {
    // Only redirect if authenticated, role is loaded, and haven't redirected yet
    if (isAuthenticated && userRole && !hasRedirected.current) {
      console.log(`🔍 Checking redirect - Page: ${currentPage}, Role: ${userRole}`);
      
      // Redirect from auth pages
      if (['login', 'register', 'forgot-password'].includes(currentPage)) {
        hasRedirected.current = true;
        console.log(`🔀 Redirecting from auth page - Role: ${userRole}`);
        performRoleRedirect(userRole);
      }
      // Also redirect from /dashboard if user has a staff role
      else if (currentPage === 'dashboard' && userRole !== 'user') {
        hasRedirected.current = true;
        console.log(`🔀 Redirecting staff user from dashboard - Role: ${userRole}`);
        performRoleRedirect(userRole);
      }
    }
    
    // Helper function to perform redirect based on role
    function performRoleRedirect(role: string) {
      switch (role) {
        case 'superadmin':
          navigateToPage('admin');
          break;
        case 'translator':
          navigateToPage('translator');
          break;
        case 'partner':
          navigateToPage('partner');
          break;
        case 'support':
          navigateToPage('support');
          break;
        default:
          navigateToPage('dashboard');
      }
    }
  }, [isAuthenticated, userRole, currentPage]);

  // Public pages that don't need auth check
  const isPublicRoute = (page: PageType): boolean => {
    return ['landing', 'terms', 'privacy', 'verify'].includes(page);
  };

  // Show branded loading screen for protected routes during initial auth check
  if (loading && previousAuthState.current === null && !isPublicRoute(currentPage)) {
    return <LoadingScreen message="Authenticating..." />;
  }

  // Route protection logic
  const isProtectedRoute = (page: PageType): boolean => {
    return ['dashboard', 'admin', 'translator', 'partner', 'support'].includes(page);
  };

  // If user is authenticated but role not yet resolved, show branded loader to avoid flicker
  if (isAuthenticated && !userRole) {
    return <LoadingScreen message="Authenticating..." />;
  }

  const isAuthRoute = (page: PageType): boolean => {
    return ['login', 'register', 'forgot-password'].includes(page);
  };

  // Handle protected routes
  if (isProtectedRoute(currentPage) && !isAuthenticated) {
    return <LoginPage onNavigate={navigateToPage} />;
  }

  // Handle auth routes when already authenticated - redirect to role-based dashboard
  if (isAuthRoute(currentPage) && isAuthenticated) {
    switch (userRole) {
      case 'superadmin':
        return <AdminDashboardPage />;
      case 'translator':
        return <TranslatorDashboardPage />;
      case 'partner':
        return <PartnerDashboardPage />;
      case 'support':
        return <SupportDashboardPage />;
      default:
        return <FirestoreOnlyDashboardPage />;
    }
  }

  // Render the appropriate page
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
      case 'card-only':
        return <CardOnlyPage />;
      case 'admin':
        return <AdminDashboardPage />;
      case 'translator':
        return <TranslatorDashboardPage />;
      case 'partner':
        return <PartnerDashboardPage />;
      case 'support':
        return <SupportDashboardPage />;
      case 'landing':
      default:
        return <LandingPage onNavigate={navigateToPage} />;
    }
  };

  return (
    <div className={currentPage === 'card-only' || currentPage === 'verify' ? "min-h-screen bg-white" : "min-h-screen bg-gray-50"}>
      {renderCurrentPage()}
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