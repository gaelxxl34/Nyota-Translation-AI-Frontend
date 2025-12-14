// Landing Page Component for NTC - Redesigned for multi-language translation service
// Nyota Translation Center - Professional Document Translation Platform

import React from 'react';
import { useTranslation } from 'react-i18next';
import { SEOHead, LanguageSwitcher, Footer } from '../components/common';
import {
  HeroSection,
  ServicesSection,
  LanguagesSection,
  PartnersSection,
  FeaturesSection,
  HowItWorks,
  TemplatePreviewCarousel,
  PricingSection
} from '../components/landing';

interface LandingPageProps {
  onNavigate: (page: 'landing' | 'login' | 'register' | 'dashboard' | 'privacy' | 'terms') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Nyota Translation Center - AI-Powered Document Translation Service"
        description="Professional AI-powered translation for academic transcripts, official documents, and more. Expert human review ensures accuracy. French to English and more languages coming soon."
        keywords="Nyota Translation Center, AI translation, document translation, academic transcripts, French to English, professional translation, expert review, multilingual, translation service"
        url="https://nyotatranslate.com/"
      />
      
      {/* Sticky Navigation Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <nav className="container mx-auto px-4 sm:px-6 py-4">
          {/* Mobile Layout */}
          <div className="sm:hidden space-y-3">
            {/* Logo centered on its own line */}
            <div className="flex justify-center">
              <img
                src="/logo-wide.png"
                alt="Nyota Translation Center Logo"
                className="h-12 w-auto"
              />
            </div>
            {/* Buttons and language switcher on same line */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onNavigate('login')}
                className="btn-secondary text-sm px-4 py-2 flex-1"
              >
                {t('navigation.login')}
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="btn-primary text-sm px-4 py-2 flex-1"
              >
                {t('navigation.getStarted')}
              </button>
              <LanguageSwitcher />
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden sm:flex items-center justify-between">
            <div className="flex items-center">
              <img
                src="/logo-wide.png"
                alt="Nyota Translation Center Logo"
                className="h-14 lg:h-16 w-auto"
              />
            </div>

            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="flex-shrink-0">
                <LanguageSwitcher />
              </div>
              <div className="flex items-center space-x-2 lg:space-x-3">
                <button
                  onClick={() => onNavigate('login')}
                  className="btn-secondary text-sm lg:text-base px-4 lg:px-5 py-2 lg:py-2.5"
                >
                  {t('navigation.login')}
                </button>
                <button
                  onClick={() => onNavigate('register')}
                  className="btn-primary text-sm lg:text-base px-4 lg:px-5 py-2 lg:py-2.5"
                >
                  {t('navigation.getStarted')}
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <HeroSection onNavigate={onNavigate} />

      {/* Services Section - What we offer */}
      <ServicesSection />

      {/* Features Section - Why choose us */}
      <FeaturesSection />

      {/* How It Works - with Expert Review step */}
      <HowItWorks />

      {/* Languages Section - Supported language pairs */}
      <LanguagesSection />

      {/* Template Preview - Academic transcript templates */}
      <TemplatePreviewCarousel />

      {/* Partners Section - Trusted by */}
      <PartnersSection />

      {/* Pricing Section */}
      <PricingSection onGetStarted={() => onNavigate('register')} />

      {/* Footer */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default LandingPage;
