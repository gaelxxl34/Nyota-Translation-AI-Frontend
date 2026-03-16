// Email Verification Pending Page Component for NTC
// Shown when a logged-in user hasn't verified their email yet

import React, { useState } from 'react';
import { useAuth } from '../AuthProvider';
import { AuthNavigation } from '../components/common';
import type { NavigateToPage } from '../App';

interface EmailVerificationPendingPageProps {
  onNavigate: NavigateToPage;
  email: string;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const EmailVerificationPendingPage: React.FC<EmailVerificationPendingPageProps> = ({ onNavigate, email }) => {
  const { logout } = useAuth();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(0);

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
      // Silent fail
    } finally {
      setResending(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onNavigate('login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <AuthNavigation onNavigate={onNavigate} />
      
      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-10 px-6 shadow-2xl rounded-xl border border-gray-100 sm:px-10 text-center">
            {/* Email Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-6">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-3">
              Verify your email
            </h2>
            <p className="text-gray-600 mb-2">
              We sent a verification link to:
            </p>
            <p className="text-primary-700 font-semibold mb-6">
              {email}
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Please click the link in the email to verify your account. 
              Once verified, refresh this page or sign in again.
            </p>

            {/* Resend button */}
            <button
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="text-sm text-primary-600 hover:text-primary-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors mb-6 block mx-auto"
            >
              {resending
                ? 'Sending...'
                : resent
                ? `Email sent! Resend in ${cooldown}s`
                : "Didn't receive the email? Resend"}
            </button>

            <div className="space-y-3 border-t border-gray-200 pt-6">
              <button
                onClick={() => window.location.reload()}
                className="w-full btn-primary text-center justify-center"
              >
                I've verified — Refresh
              </button>
              <button
                onClick={handleLogout}
                className="w-full btn-secondary text-center justify-center"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPendingPage;
