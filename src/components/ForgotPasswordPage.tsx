import React, { useState } from "react";
import type { NavigateToPage } from '../App';
import { useAuth } from '../AuthProvider';

/**
 * ForgotPasswordPage: Allows users to request a password reset email.
 * Styled to match the look and feel of other authentication pages.
 */
const ForgotPasswordPage: React.FC<{ onNavigate: NavigateToPage }> = ({ onNavigate }) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { sendPasswordReset, error, clearError } = useAuth();
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex flex-row items-center mb-6 w-full gap-4">
          <img
            src="/log.PNG"
            alt="Nyota Translation Center Logo"
            className="h-14 w-auto rounded-lg shadow-md"
          />
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Nyota Translation Center</h1>
        </div>
        <div className="mb-6 w-full">
          <h2 className="text-lg font-semibold text-gray-700 mb-1">Forgot Password</h2>
          <p className="text-gray-500 text-sm">Enter your email address and we'll send you a link to reset your password.</p>
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
            &larr; Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
