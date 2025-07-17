// Landing Page Component for NTC
// Visually stunning hero section that brands "Nyota Translation Center"

import React from 'react';
import { useTranslation } from 'react-i18next';
import SEOHead from './SEOHead';
import LanguageSwitcher from './LanguageSwitcher';
import FeaturesSection from './FeaturesSection';
import SpeedComparison from './SpeedComparison';
import HowItWorks from './HowItWorks';
import TemplatePreviewCarousel from './TemplatePreviewCarousel';
import PricingSection from './PricingSection';
import Footer from './Footer';

interface LandingPageProps {
  onNavigate: (page: 'landing' | 'login' | 'register' | 'dashboard' | 'privacy' | 'terms') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <SEOHead 
        title="Nyota Translation Center - AI-Powered Academic Document Translation | IUEA Innovations"
        description="Transform your French school bulletins and academic documents into professional English reports with AI. Trusted by International University of East Africa (IUEA). Fast, accurate, and secure translation services."
        keywords="IUEA, International University of East Africa, Nyota Translation Center, AI translation, academic documents, school bulletin translation, French to English, education technology, IUEA innovations, academic transcripts, report cards, document conversion"
        image="https://nyotatranslate.com/hero%20seo.png"
        url="https://nyotatranslate.com/"
      />
      
      {/* Sticky Navigation Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <nav className="container mx-auto px-4 sm:px-6 py-4">
            {/* Mobile Layout - Optimized Stacked Design */}
            <div className="sm:hidden">
              {/* Top Row: Brand Identity and Language */}
              <div className="flex items-center justify-between mb-4">
                {/* Left: Logo and Brand */}
                <div className="flex items-center space-x-2">
                  <img
                    src="/log.PNG"
                    alt="Nyota Translation Center Logo"
                    className="h-8 w-auto rounded-lg shadow-md"
                  />
                  <h1 className="text-sm font-heading font-bold text-gray-900">
                    {t('navigation.brandName')}
                  </h1>
                </div>
                
                {/* Right: Language Switcher */}
                <LanguageSwitcher />
              </div>
              
              {/* Bottom Row: Authentication Actions */}
              <div className="flex items-center space-x-3">
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
              </div>
            </div>

            {/* Desktop Layout - Optimized Two-Block Design */}
            <div className="hidden sm:flex items-center justify-between">
              {/* Left Block: Brand Identity */}
              <div className="flex items-center space-x-3 lg:space-x-4">
                <img
                  src="/log.PNG"
                  alt="Nyota Translation Center Logo"
                  className="h-10 lg:h-12 w-auto rounded-lg shadow-md"
                />
                <h1 className="text-lg lg:text-xl font-heading font-bold text-gray-900">
                  {t('navigation.brandName')}
                </h1>
              </div>

              {/* Right Block: User Actions */}
              <div className="flex items-center space-x-3 lg:space-x-4">
                {/* Language Switcher */}
                <div className="flex-shrink-0">
                  <LanguageSwitcher />
                </div>
                
                {/* Authentication Buttons */}
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

      {/* Hero Section - Full width */}
      <section className="w-full">
        {/* Hero Image - Full Screen Width */}
        <div className="w-full">
          <img
            src="/hero.png"
            alt="Nyota Translation Center - Transform French School Bulletins Into English Reports"
            className="w-full h-auto"
            style={{
              maxHeight: '80vh',
              objectFit: 'cover',
            }}
          />
        </div>
        
        {/* Call-to-Action Buttons below image */}
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={() => onNavigate('register')}
              className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3"
            >
              {t('hero.startTranslation')}
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="btn-secondary text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3"
            >
              {t('hero.alreadyHaveAccount')}
            </button>
          </div>
        </div>
      </section>

      {/* New Landing Page Sections */}
      <FeaturesSection />
      <SpeedComparison />
      <HowItWorks />
      <TemplatePreviewCarousel />
      <PricingSection onGetStarted={() => onNavigate('register')} />
      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default LandingPage;
