// Document Verification Page Component for NTC
// Displays document authenticity verification with blockchain-powered trust

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import SEOHead from './SEOHead';
import LanguageSwitcher from './LanguageSwitcher';
import Footer from './Footer';
// Import verification utilities
import { getVerificationData } from '../utils/documentVerification';
import type { VerificationData } from '../utils/documentVerification';

interface DocumentVerificationPageProps {
  onNavigate?: (page: 'landing' | 'login' | 'register' | 'dashboard' | 'privacy' | 'terms') => void;
  documentId?: string;
}

const DocumentVerificationPage: React.FC<DocumentVerificationPageProps> = ({ 
  onNavigate = () => {} 
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [documentData, setDocumentData] = useState<VerificationData | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const documentId = params.get('doc');
    
    if (!documentId) {
      setError(t('verification.error.invalidUrl'));
      setIsLoading(false);
      return;
    }

    const fetchVerificationData = async () => {
      try {
        const data = await getVerificationData(documentId);
        
        if (data) {
          setDocumentData(data);
          setIsVerified(true);
        } else {
          setError(t('verification.error.notFound'));
        }
      } catch (err) {
        console.error('❌ Verification error:', err);
        setError(t('verification.error.generic'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchVerificationData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get documentId for display purposes
  const params = new URLSearchParams(window.location.search);
  const displayDocumentId = params.get('doc') || 'Document';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <SEOHead 
        title={`Document Verification - ${displayDocumentId} | Nyota Translation Center`}
        description="Verify the authenticity of academic documents generated through Nyota Translation Center's blockchain-powered platform."
        keywords="document verification, blockchain, academic documents, IUEA, authenticity"
        url={`https://nyotatranslate.com/verify/${displayDocumentId}`}
      />
      
      {/* Sticky Navigation Header - Same as Landing Page */}
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
              {/* Back to Home Button */}
              <button
                onClick={() => onNavigate('landing')}
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                {t('verification.navigation.backToHome')}
              </button>
              
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

      {/* Main Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 sm:px-6 py-8 lg:py-16"
      >
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <motion.div 
            className="text-center mb-8 lg:mb-12"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div 
              className="inline-flex items-center justify-center w-20 h-20 bg-primary-100/50 backdrop-blur-sm rounded-2xl mb-6 relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-primary-400/20 to-secondary-400/20"
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <svg className="w-10 h-10 text-primary-600 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.40A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </motion.div>
            <motion.h1 
              className="text-4xl lg:text-5xl font-heading font-bold text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {t('verification.pageTitle')}
            </motion.h1>
            <motion.p 
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {t('verification.pageSubtitle')}
            </motion.p>
          </motion.div>

          {/* Verification Content */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8 text-center"
              >
                <motion.div 
                  className="relative w-16 h-16 mx-auto mb-6"
                  animate={{ 
                    rotate: 360,
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  <div className="absolute inset-0 rounded-full border-t-2 border-primary-600/30" />
                  <div className="absolute inset-0 rounded-full border-t-2 border-primary-600" 
                       style={{ clipPath: 'inset(0 0 50% 50%)' }} />
                </motion.div>
                <motion.h3 
                  className="text-xl font-semibold text-gray-900 mb-2"
                  animate={{ 
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {t('verification.loading.title')}
                </motion.h3>
                <p className="text-gray-600">{t('verification.loading.description')}</p>
              </motion.div>
            ) : error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-red-200/50 p-8 text-center"
              >
                <motion.div 
                  className="inline-flex items-center justify-center w-16 h-16 bg-red-100/50 backdrop-blur-sm rounded-2xl mb-4"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, -5, 5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </motion.div>
                <h3 className="text-xl font-semibold text-red-900 mb-2">{t('verification.error.title')}</h3>
                <p className="text-red-600 mb-6">{error}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.reload()}
                  className="btn-primary"
                >
                  {t('verification.error.tryAgain')}
                </motion.button>
              </motion.div>
            ) : isVerified && documentData ? (
              <motion.div
                key="verified" 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="max-w-2xl mx-auto space-y-6"
              >
                {/* Success Status */}
                <motion.div 
                  className="bg-white rounded-xl shadow-lg border border-green-200/30 p-6"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <div className="flex items-center justify-center mb-4">
                    <motion.div 
                      className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"
                      animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        rotate: { duration: 0.6, ease: "easeInOut" },
                        scale: { duration: 1, repeat: Infinity, repeatType: "reverse" }
                      }}
                    >
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('verification.success.title')}</h2>
                    <p className="text-gray-600">{t('verification.success.description')}</p>
                  </div>
                </motion.div>

                {/* Document Details */}
                <motion.div 
                  className="bg-white rounded-xl shadow-lg border border-gray-200/30 p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="space-y-4">
                    <div className="text-center pb-4 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('verification.documentInfo.title')}</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">{t('verification.documentInfo.studentName')}:</span>
                        <span className="font-semibold text-gray-900">{documentData.studentName}</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">{t('verification.documentInfo.generationDate')}:</span>
                        <span className="font-semibold text-gray-900">{formatDate(documentData.generationDate)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Institution Info */}
                <motion.div 
                  className="bg-white rounded-xl shadow-lg border border-gray-200/30 p-6 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <motion.img 
                    src="/iuea-Logo.png" 
                    alt="IUEA Logo" 
                    className="w-32 h-32 object-contain mx-auto mb-6"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('verification.institution.title')}
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    {t('verification.institution.description')}
                  </p>
                </motion.div>

                {/* Contact Information */}
                <motion.div 
                  className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-200/30 p-6 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">{t('verification.contact.title')}</h4>
                  <p className="text-gray-600 mb-6">
                    {t('verification.contact.description')}
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">{t('verification.contact.email')}</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-700">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="font-medium">{t('verification.contact.phone')}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <motion.a 
                      href={`mailto:${t('verification.contact.email')}`}
                      className="btn-secondary text-sm px-6 py-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {t('verification.contact.sendEmail')}
                    </motion.a>
                    <motion.a 
                      href={`tel:${t('verification.contact.phone')}`}
                      className="btn-secondary text-sm px-6 py-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {t('verification.contact.callUs')}
                    </motion.a>
                    <motion.button 
                      onClick={() => window.location.href = 'https://nyotatranslate.com'}
                      className="btn-primary text-sm px-6 py-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {t('verification.contact.backHome')}
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="invalid"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-red-200/50 p-8 text-center"
              >
                <motion.div 
                  className="inline-flex items-center justify-center w-16 h-16 bg-red-100/50 backdrop-blur-sm rounded-2xl mb-4"
                  animate={{ 
                    x: [0, -10, 10, -5, 5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.div>
                <h3 className="text-xl font-semibold text-red-900 mb-2">{t('verification.invalid.title')}</h3>
                <p className="text-red-600 mb-6">{t('verification.invalid.description')}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onNavigate('landing')}
                  className="btn-primary"
                >
                  {t('verification.invalid.backHome')}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <Footer onNavigate={onNavigate} />
    </div>
  );
};

export default DocumentVerificationPage;