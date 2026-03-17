// Document Verification Page — Enhanced with hash check, agent info, tamper detection
// Supports both legacy ?doc= (bulletin) and ?cert=NTC-YYYY-XXXXXX (certified)

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { SEOHead, LanguageSwitcher, Footer } from '../components/common';
import {
  getVerificationData,
  verifyCertifiedDocument,
  isCertificationId,
} from '../utils/documentVerification';
import type {
  VerificationData,
  CertifiedVerificationData,
} from '../utils/documentVerification';

interface DocumentVerificationPageProps {
  onNavigate?: (page: 'landing' | 'login' | 'register' | 'dashboard' | 'privacy' | 'terms' | 'verify') => void;
}

type VerifyMode = 'idle' | 'loading' | 'legacy' | 'certified' | 'not-found' | 'error';

const LANG_LABELS: Record<string, string> = {
  fr: 'French', ar: 'Arabic', es: 'Spanish', en: 'English',
};

const DocumentVerificationPage: React.FC<DocumentVerificationPageProps> = ({
  onNavigate = () => {},
}) => {
  const { t } = useTranslation();

  // State
  const [mode, setMode] = useState<VerifyMode>('idle');
  const [certIdInput, setCertIdInput] = useState('');
  const [legacyData, setLegacyData] = useState<VerificationData | null>(null);
  const [certData, setCertData] = useState<CertifiedVerificationData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');



  // ── Auto-verify from URL params on mount ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const certParam = params.get('cert');
    const docParam = params.get('doc');

    if (certParam) {
      lookupCertified(certParam);
    } else if (docParam) {
      // Legacy: could be a certification ID passed as doc=
      if (isCertificationId(docParam)) {
        lookupCertified(docParam);
      } else {
        lookupLegacy(docParam);
      }
    }
    // If no params, stay in idle (manual input mode)
  }, []);

  // ── Lookup functions ──
  const lookupCertified = useCallback(async (certId: string) => {
    setMode('loading');
    setErrorMsg('');
    setCertIdInput(certId);

    try {
      const result = await verifyCertifiedDocument(certId);
      if (result) {
        setCertData(result);
        setMode('certified');
      } else {
        setMode('not-found');
      }
    } catch {
      setMode('error');
      setErrorMsg(t('verification.error.generic'));
    }
  }, [t]);

  const lookupLegacy = useCallback(async (docId: string) => {
    setMode('loading');
    setErrorMsg('');

    try {
      const result = await getVerificationData(docId);
      if (result) {
        setLegacyData(result);
        setMode('legacy');
      } else {
        setMode('not-found');
      }
    } catch {
      setMode('error');
      setErrorMsg(t('verification.error.generic'));
    }
  }, [t]);

  // ── Manual cert ID submit ──
  const handleManualLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = certIdInput.trim().toUpperCase();
    if (!trimmed) return;

    if (isCertificationId(trimmed)) {
      lookupCertified(trimmed);
    } else {
      // Try as legacy Firestore ID
      lookupLegacy(trimmed);
    }
  };

  // ── Helpers ──
  const formatCertDate = (certifiedAt: CertifiedVerificationData['certifiedAt']): string => {
    if (!certifiedAt) return 'N/A';
    let date: Date;
    if (typeof certifiedAt === 'string') {
      date = new Date(certifiedAt);
    } else if (certifiedAt._seconds) {
      date = new Date(certifiedAt._seconds * 1000);
    } else {
      return 'N/A';
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const formatLegacyDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  // ── Info Row component ──
  const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[180px_1fr] items-start">
      <span className="px-5 py-3 text-sm font-medium text-gray-500 bg-gray-50/50">{label}</span>
      <span className="px-5 py-3 text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <SEOHead
        title="Document Verification | Nyota Translation Center"
        description="Verify the authenticity and integrity of certified translations from Nyota Translation Center."
        keywords="document verification, certification, tamper detection, NTC"
        url="https://nyotatranslate.com/verify"
      />

      {/* Nav header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <nav className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => onNavigate('landing')} className="flex-shrink-0">
              <img src="/logo-wide.png" alt="Nyota Translation Center" className="h-8 sm:h-10 w-auto rounded-lg" />
            </button>
            <LanguageSwitcher />
          </div>
        </nav>
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 sm:px-6 py-8 lg:py-16"
      >
        <div className="max-w-2xl mx-auto">
          {/* Page header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100/60 rounded-2xl mb-5">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-3">
              {t('verification.pageTitle')}
            </h1>
            <p className="text-gray-600 max-w-lg mx-auto">
              {t('verification.pageSubtitle')}
            </p>
          </div>

          {/* Certification ID Input — always visible when in idle or after result */}
          {(mode === 'idle' || mode === 'certified' || mode === 'legacy' || mode === 'not-found' || mode === 'error') && (
            <motion.form
              onSubmit={handleManualLookup}
              className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6 mb-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('verification.certInput.label', 'Certification ID')}
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={certIdInput}
                  onChange={(e) => setCertIdInput(e.target.value.toUpperCase())}
                  placeholder={t('verification.certInput.placeholder', 'e.g. NTC-2026-A7K9F2')}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono tracking-wide"
                  maxLength={17}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button
                  type="submit"
                  disabled={!certIdInput.trim()}
                  className="px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t('verification.certInput.verify', 'Verify')}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {t('verification.certInput.hint', 'Enter the certification ID printed on your document (format: NTC-YYYY-XXXXXX)')}
              </p>
            </motion.form>
          )}

          <AnimatePresence mode="wait">
            {/* Loading */}
            {mode === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-8 text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('verification.loading.title')}</h3>
                <p className="text-sm text-gray-500">{t('verification.loading.description')}</p>
              </motion.div>
            )}

            {/* ── CERTIFIED DOCUMENT RESULT ── */}
            {mode === 'certified' && certData && (
              <motion.div
                key="certified"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-5"
              >
                {/* Verified badge */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-green-900">
                      {t('verification.certified.title', 'Certified Translation Verified')}
                    </h2>
                    <p className="text-sm text-green-700">
                      {t('verification.certified.description', 'This document has been professionally reviewed and certified by Nyota Translation Center.')}
                    </p>
                  </div>
                </div>

                {/* Certificate details */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
                  <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-800">{t('verification.documentInfo.title')}</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    <InfoRow
                      label={t('verification.certified.certId', 'Certification ID')}
                      value={
                        <span className="font-mono text-primary-700 bg-primary-50 px-2 py-0.5 rounded text-xs">
                          {certData.certificationId}
                        </span>
                      }
                    />
                    {certData.documentTitle && (
                      <InfoRow label={t('verification.documentInfo.documentTitle', 'Document Title')} value={certData.documentTitle} />
                    )}
                    {certData.studentName && (
                      <InfoRow label={t('verification.documentInfo.studentName')} value={certData.studentName} />
                    )}
                    <InfoRow
                      label={t('verification.documentInfo.translation', 'Translation')}
                      value={`${LANG_LABELS[certData.sourceLanguage] || certData.sourceLanguage} → ${LANG_LABELS[certData.targetLanguage] || certData.targetLanguage}`}
                    />
                    <InfoRow
                      label={t('verification.certified.certifiedAt', 'Certified On')}
                      value={formatCertDate(certData.certifiedAt)}
                    />
                    {certData.certifiedByName && (
                      <InfoRow
                        label={t('verification.certified.agent', 'Reviewed By')}
                        value={
                          <span className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {certData.certifiedByName}
                          </span>
                        }
                      />
                    )}
                  </div>
                </div>

                {/* NTC attribution */}
                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border border-primary-200/30 p-5 text-center">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">{t('verification.institution.title')}</h4>
                  <p className="text-xs text-gray-600 mb-4">{t('verification.institution.description')}</p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <a
                      href={`mailto:${t('verification.contact.email')}`}
                      className="btn-secondary text-xs px-4 py-2"
                    >
                      {t('verification.contact.sendEmail')}
                    </a>
                    <button
                      onClick={() => onNavigate('landing')}
                      className="btn-primary text-xs px-4 py-2"
                    >
                      {t('verification.contact.backHome')}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── LEGACY DOCUMENT RESULT (AI-generated draft) ── */}
            {mode === 'legacy' && legacyData && (
              <motion.div
                key="legacy"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-5"
              >
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-amber-900">
                      {t('verification.draft.title', 'AI-Generated Draft')}
                    </h2>
                    <p className="text-sm text-amber-700">
                      {t('verification.draft.description', 'This document was generated by AI and has NOT been reviewed or certified by a professional translator. It should not be used as an official translation.')}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
                  <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-800">{t('verification.documentInfo.title')}</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {legacyData.documentTitle && (
                      <InfoRow label={t('verification.documentInfo.documentTitle', 'Document Title')} value={legacyData.documentTitle} />
                    )}
                    {legacyData.studentName && (
                      <InfoRow label={t('verification.documentInfo.studentName')} value={legacyData.studentName} />
                    )}
                    {legacyData.sourceLanguage && legacyData.targetLanguage && (
                      <InfoRow
                        label={t('verification.documentInfo.translation', 'Translation')}
                        value={`${LANG_LABELS[legacyData.sourceLanguage] || legacyData.sourceLanguage} → ${LANG_LABELS[legacyData.targetLanguage] || legacyData.targetLanguage}`}
                      />
                    )}
                    <InfoRow
                      label={t('verification.documentInfo.generationDate')}
                      value={formatLegacyDate(legacyData.generationDate)}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <button onClick={() => onNavigate('landing')} className="btn-primary text-sm px-6 py-2">
                    {t('verification.contact.backHome')}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── NOT FOUND ── */}
            {mode === 'not-found' && (
              <motion.div
                key="not-found"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-xl shadow-lg border border-amber-200/50 p-8 text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('verification.error.notFoundTitle', 'Certificate Not Found')}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {t('verification.error.notFoundDescription', 'No certified document matches this ID. Please check the certification ID and try again.')}
                </p>
              </motion.div>
            )}

            {/* ── ERROR ── */}
            {mode === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-xl shadow-lg border border-red-200/50 p-8 text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">{t('verification.error.title')}</h3>
                <p className="text-sm text-red-600 mb-4">{errorMsg || t('verification.error.generic')}</p>
                <button
                  onClick={() => { setMode('idle'); setErrorMsg(''); }}
                  className="btn-primary text-sm"
                >
                  {t('verification.error.tryAgain')}
                </button>
              </motion.div>
            )}

            {/* ── IDLE — instructions ── */}
            {mode === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6 text-center"
              >
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  {t('verification.idle.title', 'How to verify your document')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-600 max-w-md mx-auto">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-bold text-sm">1</span>
                    </div>
                    <p>{t('verification.idle.step1', 'Find the Certification ID on your document (e.g. NTC-2026-A7K9F2)')}</p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-bold text-sm">2</span>
                    </div>
                    <p>{t('verification.idle.step2', 'Enter the ID above and click Verify')}</p>
                  </div>
                </div>
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