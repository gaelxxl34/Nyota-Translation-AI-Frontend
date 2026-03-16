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
  onNavigate: (page: 'landing' | 'login' | 'register' | 'dashboard' | 'privacy' | 'terms' | 'verify') => void;
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

      {/* Document Verification Section */}
      <section className="py-12 lg:py-16 bg-gradient-to-r from-primary-50 to-secondary-50">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100/60 rounded-2xl mb-4">
              <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-2xl lg:text-3xl font-heading font-bold text-gray-900 mb-3">
              {t('landing.verification.title', 'Verify a Certified Document')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('landing.verification.description', 'Received a certified translation from NTC? Verify its authenticity instantly using the certification ID printed on your document.')}
            </p>
            <button
              onClick={() => onNavigate('verify')}
              className="btn-primary px-6 py-3 text-sm lg:text-base"
            >
              {t('landing.verification.cta', 'Verify Document')}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default LandingPage;
