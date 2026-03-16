// Register Page Component for NTC
// Self-service registration with email verification

import React, { useState } from 'react';
import { SEOHead, AuthNavigation } from '../components/common';
import type { NavigateToPage } from '../App';

interface RegisterPageProps {
  onNavigate: NavigateToPage;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (formData.displayName.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          displayName: formData.displayName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        switch (data.code) {
          case 'EMAIL_EXISTS':
            setError('An account with this email already exists.');
            break;
          case 'WEAK_PASSWORD':
            setError('Password must be at least 6 characters.');
            break;
          case 'INVALID_EMAIL':
            setError('Please enter a valid email address.');
            break;
          default:
            setError(data.error || 'Registration failed. Please try again.');
        }
        return;
      }

      // Success — show verification pending
      setSuccess(true);
    } catch {
      setError('Unable to reach the server. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // After successful registration, show the "check your email" screen
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <AuthNavigation onNavigate={onNavigate} />
        <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-10 px-6 shadow-2xl rounded-xl border border-gray-100 sm:px-10 text-center">
              {/* Email Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-3">
                Check your email
              </h2>
              <p className="text-gray-600 mb-2">
                We sent a verification link to:
              </p>
              <p className="text-primary-700 font-semibold mb-6">
                {formData.email}
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Click the link in the email to verify your account, then come back to sign in.
              </p>

              {/* Resend button */}
              <ResendButton email={formData.email} />

              <div className="mt-6 border-t border-gray-200 pt-6">
                <button
                  onClick={() => onNavigate('login')}
                  className="w-full btn-secondary text-center justify-center"
                >
                  Go to Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <SEOHead
        title="Create Account - Nyota Translation Center"
        description="Create your Nyota Translation Center account to translate academic documents powered by AI."
        keywords="register, create account, academic translation, Nyota Translation Center"
        url="https://nyotatranslate.com/register"
      />

      <AuthNavigation onNavigate={onNavigate} />

      <div className="flex flex-col justify-center py-8 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="text-center text-3xl font-heading font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Start translating your academic documents
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

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div>
                <label htmlFor="displayName" className="form-label">
                  Full Name
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g. Juan García López"
                  disabled={isSubmitting}
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="form-label">
                  Email Address
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
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="form-label">
                  Password
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
                  placeholder="At least 6 characters"
                  disabled={isSubmitting}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password
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
                  placeholder="Re-enter your password"
                  disabled={isSubmitting}
                />
              </div>

              {/* Terms */}
              <p className="text-xs text-gray-500">
                By creating an account, you agree to our{' '}
                <button type="button" onClick={() => onNavigate('terms')} className="text-primary-600 hover:underline">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" onClick={() => onNavigate('privacy')} className="text-primary-600 hover:underline">
                  Privacy Policy
                </button>.
              </p>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary text-center justify-center flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => onNavigate('login')}
                  disabled={isSubmitting}
                  className="w-full btn-secondary text-center justify-center"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Resend verification email button with cooldown
 */
const ResendButton: React.FC<{ email: string }> = ({ email }) => {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    try {
      setResending(true);
      await fetch(`${API_BASE}/api/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setResent(true);
      setCooldown(60);

      // Countdown timer
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setResent(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      // Silent fail — don't reveal email existence
    } finally {
      setResending(false);
    }
  };

  return (
    <button
      onClick={handleResend}
      disabled={resending || cooldown > 0}
      className="text-sm text-primary-600 hover:text-primary-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
    >
      {resending
        ? 'Sending...'
        : resent
        ? `Email sent! Resend in ${cooldown}s`
        : "Didn't receive the email? Resend"}
    </button>
  );
};

export default RegisterPage;
