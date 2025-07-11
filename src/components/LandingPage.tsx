// Landing Page Component for NTC
// Visually stunning hero section that brands "Nyota Translation Center"

import React from 'react';

interface LandingPageProps {
  onNavigate: (page: 'landing' | 'login' | 'register' | 'dashboard') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Navigation Header */}
      <nav className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <img
              src="/log.PNG"
              alt="Nyota Translation Center Logo"
              className="h-12 w-auto rounded-lg shadow-md"
            />
            <h1 className="text-xl font-heading font-bold text-gray-900">
              Nyota Translation Center
            </h1>
          </div>
          <div className="flex space-x-2 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('login')}
              className="btn-secondary flex-1 sm:flex-none"
            >
              Login
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="btn-primary flex-1 sm:flex-none"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Content */}
          <div className="mb-12">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-heading font-bold text-gray-900 mb-6 leading-tight">
              Transform French
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-600">
                {' '}School Bulletins
              </span>
              <br className="hidden sm:block" />
              Into English Reports
            </h2>
            <p className="text-base sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Upload your French school bulletin and get an instant, professionally
              translated English report card powered by advanced AI technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('register')}
                className="btn-primary text-lg px-8 py-3"
              >
                Start Translation
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="btn-secondary text-lg px-8 py-3"
              >
                Already have an account?
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-heading font-semibold text-gray-900 mb-2">
                Easy Upload
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Simply upload your French bulletin as an image or PDF file
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-heading font-semibold text-gray-900 mb-2">
                AI-Powered Translation
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Advanced AI extracts and translates content with high accuracy
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-heading font-semibold text-gray-900 mb-2">
                Professional Report
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Get a clean, formatted English report card ready to use
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">Trusted by families worldwide</p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8 opacity-60 mb-2">
              <div className="text-xs text-gray-400">🔒 Secure & Private</div>
              <div className="text-xs text-gray-400">⚡ Fast Processing</div>
              <div className="text-xs text-gray-400">✨ High Accuracy</div>
            </div>
            <div className="flex justify-center items-center">
              <span className="text-xs text-gray-400 italic">Powered by Nyota Innovations</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
