// Stripe Payment Checkout Component
// Handles the payment flow with Stripe Elements, error recovery, and network resilience

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useAuth } from '../../AuthProvider';
import * as paymentService from '../../services/paymentService';

// Cache the Stripe promise so we don't re-load for the same key
let cachedStripePromise: Promise<Stripe | null> | null = null;
let cachedPublishableKey = '';

const getStripePromise = (publishableKey: string) => {
  if (cachedStripePromise && cachedPublishableKey === publishableKey) {
    return cachedStripePromise;
  }
  cachedPublishableKey = publishableKey;
  cachedStripePromise = loadStripe(publishableKey);
  return cachedStripePromise;
};

// ============================================
// Inner Payment Form (inside Stripe Elements)
// ============================================

interface PaymentFormProps {
  amount: number;
  currency: string;
  speedTier: string;
  paymentIntentId: string;
  onSuccess: (paymentIntentId: string, invoiceId?: string) => void;
  onFailure: (error: string) => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  currency,
  speedTier,
  paymentIntentId,
  onSuccess,
  onFailure,
  onCancel,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { getFreshToken } = useAuth();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Warn user about refreshing during payment processing
  useEffect(() => {
    if (!processing) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [processing]);

  // Cancel: clean up the Stripe intent and Firestore record, then navigate back
  const handleCancel = useCallback(async () => {
    if (paymentIntentId) {
      try {
        const token = await getFreshToken();
        await paymentService.cancelPayment(token, paymentIntentId);
      } catch {
        // Best-effort — don't block user from going back
      }
    }
    onCancel();
  }, [paymentIntentId, getFreshToken, onCancel]);

  /**
   * Poll payment intent status via Stripe — handles cases where:
   * 1. Webhook is delayed
   * 2. Network drops after Stripe confirms but before our backend responds
   */
  const pollPaymentStatus = useCallback(
    async (maxAttempts = 10) => {
      let attempts = 0;

      return new Promise<void>((resolve, reject) => {
        pollIntervalRef.current = setInterval(async () => {
          attempts++;
          try {
            const token = await getFreshToken();
            const result = await paymentService.checkIntentStatus(
              token,
              paymentIntentId
            );

            if (result.success) {
              if (result.status === 'succeeded') {
                if (pollIntervalRef.current)
                  clearInterval(pollIntervalRef.current);
                resolve();
                onSuccess(paymentIntentId, result.invoiceId);
              } else if (result.status === 'failed') {
                if (pollIntervalRef.current)
                  clearInterval(pollIntervalRef.current);
                reject(
                  new Error(
                    result.failureReason || 'Payment failed'
                  )
                );
              }
              // else still processing — continue polling
            }
          } catch {
            // Network error — continue polling silently
          }

          if (attempts >= maxAttempts) {
            if (pollIntervalRef.current)
              clearInterval(pollIntervalRef.current);
            reject(
              new Error(
                'Payment verification timed out. If you were charged, your payment will be processed automatically. Please check your payment history.'
              )
            );
          }
        }, 3000); // Poll every 3 seconds
      });
    },
    [getFreshToken, paymentIntentId, onSuccess]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      // 1. Confirm payment with Stripe
      const { error: stripeError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: window.location.href, // Fallback for 3D Secure redirects
          },
          redirect: 'if_required',
        });

      if (stripeError) {
        // Card declined, insufficient funds, etc.
        const msg = stripeError.message || 'Payment failed';
        setError(msg);
        onFailure(msg);
        setProcessing(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        // 2. Confirm with our backend (backup to webhook)
        try {
          const token = await getFreshToken();
          const confirmResult = await paymentService.confirmPayment(
            token,
            paymentIntent.id
          );

          if (confirmResult.success && confirmResult.status === 'succeeded') {
            onSuccess(paymentIntent.id, confirmResult.invoiceId);
            setProcessing(false);
            return;
          }
        } catch {
          // Backend confirm failed — fall through to polling
          console.warn('⚠️ Backend confirm failed, falling back to polling');
        }

        // 3. If backend confirm fails (network issue), poll for status
        try {
          await pollPaymentStatus(15);
        } catch (pollErr) {
          // Even polling failed, but Stripe confirmed — notify user
          onSuccess(
            paymentIntent.id,
            undefined
          );
        }
      } else if (paymentIntent?.status === 'requires_action') {
        // 3D Secure or similar — Stripe handles this automatically
        setError(
          'Additional authentication required. Please complete the verification.'
        );
      } else {
        setError('Payment was not completed. Please try again.');
      }
    } catch (err) {
      // Network error during Stripe confirmation
      const errorMsg =
        err instanceof Error ? err.message : 'An unexpected error occurred';

      if (
        errorMsg.includes('network') ||
        errorMsg.includes('Failed to fetch')
      ) {
        setError(
          'Network error — please check your connection and try again. If you were charged, do not retry — check your payment history instead.'
        );

        // Start polling in case payment went through on Stripe's end
        try {
          await pollPaymentStatus(10);
        } catch {
          // Polling also failed — user should check payment history
        }
      } else {
        setError(errorMsg);
      }
    }

    setProcessing(false);
  };

  const tierLabels: Record<string, string> = {
    standard: '📋 Standard (Up to 24 hrs)',
    rush: '⚡ Rush (Up to 12 hrs)',
    express: '🚀 Express (1–5 hrs)',
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Order Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">
          Order Summary
        </h4>
        <div className="flex justify-between items-center">
          <span className="text-sm text-blue-700">
            {tierLabels[speedTier] || speedTier}
          </span>
          <span className="text-lg font-bold text-blue-900">
            {paymentService.formatAmount(amount, currency)}
          </span>
        </div>
      </div>

      {/* Stripe Payment Element */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <PaymentElement
          onReady={() => setReady(true)}
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700 flex items-start gap-2">
            <span className="text-red-500 mt-0.5">⚠️</span>
            {error}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleCancel}
          disabled={processing}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || !ready || processing}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Processing...
            </>
          ) : (
            `Pay ${paymentService.formatAmount(amount, currency)}`
          )}
        </button>
      </div>

      {/* Security Note */}
      <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
        🔒 Secured by Stripe. Your card details are never stored on our
        servers.
      </p>
    </form>
  );
};

// ============================================
// Outer Checkout Component (wraps Stripe Elements)
// ============================================

interface StripeCheckoutProps {
  certDocId: string;
  speedTier: string;
  formType?: string;
  documentTitle?: string;
  onSuccess: (paymentIntentId: string, invoiceId?: string) => void;
  onFailure: (error: string) => void;
  onCancel: () => void;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  certDocId,
  speedTier,
  formType,
  documentTitle,
  onSuccess,
  onFailure,
  onCancel,
}) => {
  const { getFreshToken } = useAuth();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState('usd');
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const initAttemptRef = useRef(0);
  const initInFlightRef = useRef(false);
  const getFreshTokenRef = useRef(getFreshToken);
  getFreshTokenRef.current = getFreshToken;

  const initializePayment = useCallback(async () => {
    // Prevent concurrent/duplicate initialization
    if (initInFlightRef.current) return;
    initInFlightRef.current = true;

    setLoading(true);
    setInitError(null);
    initAttemptRef.current++;

    try {
      // Fetch payment config (publishable key) from backend
      const configRes = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/payments/config`
      );
      const config = await configRes.json();

      if (!config.success || !config.publishableKey) {
        throw new Error('Stripe is not configured. Ask your admin to set up payment keys in Settings.');
      }
      if (!config.paymentsEnabled) {
        throw new Error('Payments are currently disabled by the administrator.');
      }

      setStripePromise(getStripePromise(config.publishableKey));

      const token = await getFreshTokenRef.current();
      const result = await paymentService.createPaymentIntent(token, {
        certDocId,
        speedTier,
        formType,
        documentTitle,
      });

      if (!result.success || !result.clientSecret) {
        throw new Error(result.error || 'Failed to initialize payment');
      }

      setClientSecret(result.clientSecret);
      // Use stripePaymentIntentId from backend or extract from client secret
      const intentId = result.stripePaymentIntentId || result.clientSecret?.split('_secret_')[0] || '';
      setPaymentIntentId(intentId);
      setAmount(result.amount || 0);
      setCurrency(result.currency || 'usd');
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to initialize payment';
      setInitError(errorMsg);

      // Don't auto-retry more than 2 times
      if (initAttemptRef.current < 3 && errorMsg.includes('Network')) {
        setTimeout(() => {
          initInFlightRef.current = false;
          initializePayment();
        }, 2000);
        return; // Don't reset initInFlightRef yet
      }
    } finally {
      setLoading(false);
      initInFlightRef.current = false;
    }
  }, [certDocId, speedTier, formType, documentTitle]);

  useEffect(() => {
    initializePayment();
  }, [initializePayment]);

  // Cancel handler for the outer component — cleans up intent before navigating away
  const handleOuterCancel = useCallback(async () => {
    if (paymentIntentId) {
      try {
        const token = await getFreshTokenRef.current();
        await paymentService.cancelPayment(token, paymentIntentId);
      } catch {
        // Best-effort
      }
    }
    onCancel();
  }, [paymentIntentId, onCancel]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <svg
          className="animate-spin h-8 w-8 text-blue-600"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <p className="text-sm text-gray-500">Setting up secure payment...</p>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700">⚠️ {initError}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleOuterCancel}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={initializePayment}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!clientSecret || !stripePromise) return null;

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#2563eb',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#ef4444',
            fontFamily: 'Inter, system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
          },
        },
      }}
    >
      <PaymentForm
        amount={amount}
        currency={currency}
        speedTier={speedTier}
        paymentIntentId={paymentIntentId || ''}
        onSuccess={onSuccess}
        onFailure={onFailure}
        onCancel={onCancel}
      />
    </Elements>
  );
};

export default StripeCheckout;
