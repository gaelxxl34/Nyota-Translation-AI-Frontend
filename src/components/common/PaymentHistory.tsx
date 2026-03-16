// Payment History Component — Displays user's payments and invoices
// Includes payment status, invoice download, and filtering

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../AuthProvider';
import * as paymentService from '../../services/paymentService';
import type { PaymentRecord, InvoiceRecord } from '../../services/paymentService';

type TabType = 'payments' | 'invoices';

const PaymentHistory: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { getFreshToken } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('payments');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getFreshToken();
      const [paymentsResult, invoicesResult] = await Promise.all([
        paymentService.getPaymentHistory(token, 50),
        paymentService.getInvoices(token, 50),
      ]);

      if (paymentsResult.success) setPayments(paymentsResult.payments || []);
      if (invoicesResult.success) setInvoices(invoicesResult.invoices || []);

      if (!paymentsResult.success && !invoicesResult.success) {
        setError('Failed to load payment data');
      }
    } catch {
      setError('Failed to load payment data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [getFreshToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      succeeded: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      failed: 'bg-red-100 text-red-700',
      paid: 'bg-green-100 text-green-700',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}
      >
        {status === 'succeeded' || status === 'paid'
          ? '✅'
          : status === 'pending'
            ? '⏳'
            : status === 'processing'
              ? '🔄'
              : '❌'}{' '}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const tierLabel = (tier: string) => {
    const labels: Record<string, string> = {
      standard: '📋 Standard',
      rush: '⚡ Rush',
      express: '🚀 Express',
    };
    return labels[tier] || tier;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-sky-600 px-6 py-4 flex justify-between items-center">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          💳 Payment History
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-xl font-bold transition-colors"
          >
            ×
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'payments'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Payments ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'invoices'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Invoices ({invoices.length})
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 space-y-3">
            <p className="text-red-600 text-sm">⚠️ {error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
            >
              🔄 Retry
            </button>
          </div>
        ) : activeTab === 'payments' ? (
          payments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">💳</p>
              <p className="text-gray-500 text-sm">No payments yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {payment.documentTitle || payment.formType}
                      </p>
                      <p className="text-xs text-gray-500">
                        {tierLabel(payment.speedTier)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {paymentService.formatAmount(
                          payment.amount,
                          payment.currency
                        )}
                      </p>
                      {statusBadge(payment.status)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>{formatDate(payment.createdAt)}</span>
                    {payment.failureReason && (
                      <span className="text-red-500 max-w-[200px] truncate">
                        {payment.failureReason}
                      </span>
                    )}
                    {payment.invoiceId && (
                      <span className="text-blue-500">
                        Invoice: {payment.invoiceId.slice(0, 15)}...
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : invoices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📄</p>
            <p className="text-gray-500 text-sm">No invoices yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      {invoice.documentTitle || invoice.formType}
                    </p>
                    <p className="text-xs text-gray-400">
                      {tierLabel(invoice.speedTier)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {paymentService.formatAmount(
                        invoice.amount,
                        invoice.currency
                      )}
                    </p>
                    {statusBadge(invoice.status)}
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>{formatDate(invoice.issuedAt)}</span>
                  {invoice.items.map((item, i) => (
                    <span key={i}>{item.description}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {!loading && !error && activeTab === 'payments' && payments.length > 0 && (
        <div className="border-t border-gray-100 px-6 py-3 bg-gray-50">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Total paid ({payments.filter((p) => p.status === 'succeeded').length} transactions)
            </span>
            <span className="text-lg font-bold text-green-600">
              {paymentService.formatAmount(
                payments
                  .filter((p) => p.status === 'succeeded')
                  .reduce((sum, p) => sum + p.amount, 0),
                'usd'
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
