import React, { useState } from "react";
import type { NavigateToPage } from '../App';
import { useAuth } from '../AuthProvider';
import { useTranslation } from 'react-i18next';
import { AuthNavigation } from '../components/common';

/**
 * ForgotPasswordPage: Allows users to request a password reset email.
 * Styled to match the look and feel of other authentication pages.
 */
const ForgotPasswordPage: React.FC<{ onNavigate: NavigateToPage }> = ({ onNavigate }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { sendPasswordReset, error, clearError } = useAuth();
  const { t } = useTranslation();
  const [localError, setLocalError] = useState<string | null>(null);

  // Handle password reset form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    try {
      await sendPasswordReset(email);
      setSubmitted(true);
    } catch (err) {
      setLocalError(error || 'Failed to send reset link.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Navigation Header */}
      <AuthNavigation onNavigate={onNavigate} />
      
      {/* Main Content */}
      <div className="flex items-center justify-center py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 border border-gray-100">
          <div className="mb-6 w-full">
            <h2 className="text-lg font-semibold text-gray-700 mb-1">{t('auth.forgotPassword.title')}</h2>
            <p className="text-gray-500 text-sm">{t('auth.forgotPassword.subtitle')}</p>
          </div>
        {submitted ? (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded p-4 text-center">
            If an account exists for <span className="font-semibold">{email}</span>, a password reset link has been sent.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400"
                value={email}
                onChange={e => { setEmail(e.target.value); setLocalError(null); clearError(); }}
                required
                autoFocus
                autoComplete="email"
                placeholder="you@email.com"
              />
            </div>
            {localError && <p className="text-red-600 text-sm text-center">{localError}</p>}
            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 rounded shadow transition-colors"
            >
              Send Reset Link
            </button>
          </form>
        )}
        <div className="mt-6 flex flex-col items-center">
          <button
            className="text-primary-600 hover:text-primary-700 text-sm font-medium underline"
            onClick={() => onNavigate('login')}
          >
            &larr; {t('auth.forgotPassword.backToLogin')}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
