// Login Page Component for NTC
// Login form with Firebase Authentication integration and i18n support

import React, { useState } from 'react';
import { useAuth } from '../AuthProvider';
import { useTranslation } from 'react-i18next';
import { SEOHead, AuthNavigation } from '../components/common';
import type { NavigateToPage } from '../App';

interface LoginPageProps {
  onNavigate: NavigateToPage;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, error, clearError, loading } = useAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifiedBanner, setVerifiedBanner] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('verified') === 'true';
  });
  const [emailNotVerified, setEmailNotVerified] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      clearError();
    }
    if (verifiedBanner) {
      setVerifiedBanner(false);
    }
    if (emailNotVerified) {
      setEmailNotVerified(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailNotVerified(false);
    
    try {
      setIsSubmitting(true);
      await login(formData.email, formData.password);
      // Don't manually navigate - let the AuthAwareRouter handle it
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if backend returns EMAIL_NOT_VERIFIED on any API call after login
  // This is handled via the AuthProvider error state
  // We also watch for the specific error message
  const showEmailNotVerified = emailNotVerified;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <SEOHead 
        title="Login - Nyota Translation Center | Access Your Account"
        description="Login to your Nyota Translation Center account to access your academic document translations. Secure authentication for IUEA students and institutions."
        keywords="login, account access, Nyota Translation Center, IUEA, academic documents, secure login, authentication"
        url="https://nyotatranslate.com/login"
      />
      
      {/* Navigation Header */}
      <AuthNavigation onNavigate={onNavigate} />
      
      {/* Main Content */}
      <div className="flex flex-col justify-center py-8 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-heading font-bold text-gray-900">
            {t('auth.login.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth.login.subtitle')}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-2xl rounded-xl border border-gray-100 sm:px-10">
          {/* Email Verified Success Banner */}
          {verifiedBanner && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700 font-medium">Email verified successfully! You can now sign in.</p>
                </div>
              </div>
            </div>
          )}

          {/* Email Not Verified Warning */}
          {showEmailNotVerified && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">Please verify your email address before signing in. Check your inbox for a verification link.</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="form-label">
                {t('auth.login.emailLabel')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder={t('auth.login.emailPlaceholder')}
                disabled={isSubmitting}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="form-label">
                {t('auth.login.passwordLabel')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder={t('auth.login.passwordPlaceholder')}
                disabled={isSubmitting}
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  disabled={isSubmitting}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  {t('auth.login.rememberMe')}
                </label>
              </div>

              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => onNavigate('forgot-password')}
                  className="font-medium text-primary-600 hover:text-primary-500"
                  disabled={isSubmitting}
                >
                  {t('auth.login.forgotPassword')}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full btn-primary text-center justify-center flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('auth.login.signingIn')}
                  </>
                ) : (
                  t('auth.login.signInButton')
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t('auth.login.noAccount')}</span>
              </div>
            </div>

            {/* Register Link */}
            <div className="mt-6">
              <button
                onClick={() => onNavigate('register')}
                disabled={isSubmitting}
                className="w-full btn-secondary text-center justify-center"
              >
                {t('auth.login.createAccount')}
              </button>
            </div>            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
