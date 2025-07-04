// Main App Component for Nyota Translation Center (NTC)
// Handles routing and main application shell

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './AuthProvider';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import FirestoreOnlyDashboardPage from './components/FirestoreOnlyDashboardPage';
import BulletinTemplatePage from './components/BulletinTemplatePage';
import CardOnlyPage from './components/CardOnlyPage';

// Simple page routing state
type PageType = 'landing' | 'login' | 'register' | 'dashboard' | 'bulletin-template' | 'card-only';

// Main app content component (inside AuthProvider)
const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    // Initialize page based on URL path
    const path = window.location.pathname;
    if (path === '/card-only') return 'card-only';
    if (path === '/bulletin-template') return 'bulletin-template';
    if (path === '/login') return 'login';
    if (path === '/register') return 'register';
    if (path === '/dashboard') return 'dashboard';
    return 'landing';
  });
  const { currentUser, loading } = useAuth();

  // Update URL when page changes
  React.useEffect(() => {
    const paths = {
      'landing': '/',
      'login': '/login',
      'register': '/register',
      'dashboard': '/dashboard',
      'bulletin-template': '/bulletin-template',
      'card-only': '/card-only'
    };
    
    const newPath = paths[currentPage] || '/';
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
    }
  }, [currentPage]);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show appropriate page
  if (currentUser) {
    // Allow authenticated users to access specific pages
    switch (currentPage) {
      case 'bulletin-template':
        return <BulletinTemplatePage />;
      case 'card-only':
        return <CardOnlyPage />;
      case 'dashboard':
        return <FirestoreOnlyDashboardPage />;
      default:
        // For any other page, redirect to dashboard
        return <FirestoreOnlyDashboardPage />;
    }
  }

  // If user is not authenticated, show public pages
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} />;
      case 'register':
        return <RegisterPage onNavigate={setCurrentPage} />;
      case 'bulletin-template':
        return <BulletinTemplatePage />;
      case 'card-only':
        return <CardOnlyPage />;
      case 'landing':
      default:
        return <LandingPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderCurrentPage()}
    </div>
  );
};

// Main App component with AuthProvider wrapper
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
