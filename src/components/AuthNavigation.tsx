// Reusable Navigation Component for Authentication Pages
// Matches the LandingPage navigation design with mobile-first responsive layout

import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import type { NavigateToPage } from '../App';

interface AuthNavigationProps {
  onNavigate: NavigateToPage;
}

const AuthNavigation: React.FC<AuthNavigationProps> = ({ onNavigate }) => {
  const { t } = useTranslation();

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
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200"
          >
            <img
              src="/log.PNG"
              alt="Nyota Translation Center Logo"
              className="h-8 w-auto rounded-lg shadow-md"
            />
            <h1 className="text-sm font-heading font-bold text-gray-900">
              {t('navigation.brandName')}
            </h1>
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
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200 group"
          >
            <img
              src="/log.PNG"
              alt="Nyota Translation Center Logo"
              className="h-10 lg:h-12 w-auto rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-200"
            />
            <h1 className="text-lg lg:text-xl font-heading font-bold text-gray-900">
              {t('navigation.brandName')}
            </h1>
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
