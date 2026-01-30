// Dashboard Header Component
// Header with logo and avatar dropdown menu

import React from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../common';

interface DashboardHeaderProps {
  userEmail: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userEmail }) => {
  const { t } = useTranslation();

  const handleSignOut = () => {
    import('../../firebase').then(({ auth }) => {
      import('firebase/auth').then(({ signOut }) => {
        signOut(auth);
      });
    });
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo only */}
          <div className="flex items-center">
            <img
              src="/logo-wide.png"
              alt="Nyota Translation Center Logo"
              className="h-10 w-auto rounded-lg shadow-md"
            />
          </div>
          
          <div className="flex items-center gap-3">
            {/* Avatar Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                  {userEmail?.charAt(0).toUpperCase()}
                </div>
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{userEmail}</p>
                </div>
                
                {/* Language Switcher */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-2">Language</p>
                  <LanguageSwitcher />
                </div>
                
                {/* Logout */}
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-b-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {t('dashboard.navigation.signOut')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardHeader;
