// Reusable Navigation Component for Authentication Pages
// Matches the LandingPage navigation design with mobile-first responsive layout

import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import type { NavigateToPage } from '../../App';

interface AuthNavigationProps {
  onNavigate: NavigateToPage;
}

const AuthNavigation: React.FC<AuthNavigationProps> = ({ onNavigate }) => {
  useTranslation();

  return (
    <nav className="container mx-auto px-4 sm:px-6 py-4 lg:py-6">
      <div className="max-w-6xl mx-auto">
      {/* Mobile Layout - Optimized Two-Row Design */}
      <div className="sm:hidden">
        {/* Top Row: Brand Identity and Language */}
        <div className="flex items-center justify-between mb-4">
          {/* Left: Logo and Brand */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center hover:opacity-80 transition-opacity duration-200"
          >
            <img
              src="/logo-wide.png"
              alt="Nyota Translation Center Logo"
              className="h-12 w-auto"
            />
          </button>
          
          {/* Right: Language Switcher */}
          <LanguageSwitcher />
        </div>
      </div>

      {/* Desktop Layout - Two-Block Design */}
      <div className="hidden sm:flex items-center justify-between">
        {/* Left Block: Logo and Brand */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center hover:opacity-80 transition-opacity duration-200"
          >
            <img
              src="/logo-wide.png"
              alt="Nyota Translation Center Logo"
              className="h-14 lg:h-16 w-auto"
            />
          </button>
        </div>

        {/* Right Block: Language Switcher */}
        <div className="flex items-center">
          <LanguageSwitcher />
        </div>
      </div>
      </div>
    </nav>
  );
};

export default AuthNavigation;
