// Register Page Component for NTC
// Registration form with Firebase Authentication integration and i18n support

import React, { useState } from 'react';
import { useAuth } from '../AuthProvider';
import { useTranslation } from 'react-i18next';
import AuthNavigation from './AuthNavigation';
import type { NavigateToPage } from '../App';

interface RegisterPageProps {
  onNavigate: NavigateToPage;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register, error, clearError, loading } = useAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert(t('auth.validation.passwordsNoMatch'));
      return;
    }

    if (formData.password.length < 6) {
      alert(t('auth.validation.passwordTooShort'));
      return;
    }

    if (!formData.name.trim()) {
      alert(t('auth.validation.nameRequired'));
      return;
    }

    try {
      setIsSubmitting(true);
      await register(formData.email, formData.password, formData.name.trim());
      // If successful, user will be automatically redirected to dashboard via App.tsx
      onNavigate('dashboard');
    } catch (error) {
      // Error is handled by AuthProvider and displayed via error state
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Navigation Header */}
      <AuthNavigation onNavigate={onNavigate} />
      
      {/* Main Content */}
      <div className="flex flex-col justify-center py-8 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-heading font-bold text-gray-900">
            {t('auth.register.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth.register.subtitle')}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-2xl rounded-xl border border-gray-100 sm:px-10">
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
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="form-label">
                {t('auth.register.nameLabel')}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                placeholder={t('auth.register.namePlaceholder')}
                disabled={isSubmitting}
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="form-label">
                {t('auth.register.emailLabel')}
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
                placeholder={t('auth.register.emailPlaceholder')}
                disabled={isSubmitting}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="form-label">
                {t('auth.register.passwordLabel')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder={t('auth.register.passwordPlaceholder')}
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('auth.register.passwordHint')}
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="form-label">
                {t('auth.register.confirmPasswordLabel')}
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="form-input"
                placeholder={t('auth.register.confirmPasswordPlaceholder')}
                disabled={isSubmitting}
              />
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                disabled={isSubmitting}
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                {t('auth.register.termsText')}{' '}
                <a
                  href="#"
                  className="text-primary-600 hover:text-primary-500 underline cursor-pointer"
                  onClick={e => { e.preventDefault(); onNavigate && onNavigate('terms'); }}
                >
                  {t('auth.register.termsLink')}
                </a>{' '}
                {t('auth.register.and')}{' '}
                <a
                  href="#"
                  className="text-primary-600 hover:text-primary-500 underline cursor-pointer"
                  onClick={e => { e.preventDefault(); onNavigate && onNavigate('privacy'); }}
                >
                  {t('auth.register.privacyLink')}
                </a>
              </label>
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
                    {t('auth.register.creatingAccount')}
                  </>
                ) : (
                  t('auth.register.createButton')
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
                <span className="px-2 bg-white text-gray-500">{t('auth.register.haveAccount')}</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="mt-6">
              <button
                onClick={() => onNavigate('login')}
                disabled={isSubmitting}
                className="w-full btn-secondary text-center justify-center"
              >
                {t('auth.register.signInInstead')}
              </button>
            </div>            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
