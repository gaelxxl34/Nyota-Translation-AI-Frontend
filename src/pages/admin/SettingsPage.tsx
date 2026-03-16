import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthProvider';
import type { ActivityLog, SystemSettings, PaymentSettings, StripeTestResult } from '../../services/adminService';
import { getActivityLogs, getSettings, updateSettings, getPaymentSettings, updatePaymentSettings, testStripeConnection } from '../../services/adminService';
import { timeAgo, getActionStyle } from './adminUtils';

const SettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  // Payment settings state
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentSaveSuccess, setPaymentSaveSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<StripeTestResult | null>(null);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  const [paymentForm, setPaymentForm] = useState({
    stripeSecretKey: '',
    stripePublishableKey: '',
    stripeWebhookSecret: '',
    paymentsEnabled: true,
    standardPrice: 30,
    rushPrice: 45,
    expressPrice: 60,
  });

  const [formValues, setFormValues] = useState({
    pricePerDocument: 30,
    aiProvider: 'openai' as 'openai' | 'anthropic',
    aiModel: 'gpt-4o',
    maxFileSize: 10,
    maintenanceMode: false,
    emailNotifications: true,
  });

  useEffect(() => {
    if (!currentUser) return;
    currentUser.getIdToken().then(async (token) => {
      try {
        const s = await getSettings(token);
        setSettings(s);
        setFormValues({
          pricePerDocument: s.pricePerDocument,
          aiProvider: s.aiProvider,
          aiModel: s.aiModel,
          maxFileSize: s.maxFileSize / (1024 * 1024),
          maintenanceMode: s.maintenanceMode,
          emailNotifications: s.emailNotifications,
        });
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }

      // Load payment settings
      try {
        const ps = await getPaymentSettings(token);
        setPaymentSettings(ps);
        setPaymentForm({
          stripeSecretKey: ps.stripeSecretKey || '',
          stripePublishableKey: ps.stripePublishableKey || '',
          stripeWebhookSecret: ps.stripeWebhookSecret || '',
          paymentsEnabled: ps.paymentsEnabled,
          standardPrice: (ps.pricing?.standard?.amount || 3000) / 100,
          rushPrice: (ps.pricing?.rush?.amount || 4500) / 100,
          expressPrice: (ps.pricing?.express?.amount || 6000) / 100,
        });
      } catch (err) {
        console.error('Failed to load payment settings:', err);
      } finally {
        setPaymentLoading(false);
      }

      try {
        const activityLogs = await getActivityLogs(token, { limit: 20 });
        setLogs(activityLogs);
      } catch (err) {
        console.error('Failed to load activity logs:', err);
      } finally {
        setLogsLoading(false);
      }
    });
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser) return;
    try {
      setSaving(true);
      const token = await currentUser.getIdToken();
      const updated = await updateSettings(token, {
        pricePerDocument: formValues.pricePerDocument,
        aiProvider: formValues.aiProvider,
        aiModel: formValues.aiModel,
        maxFileSize: formValues.maxFileSize * 1024 * 1024,
        maintenanceMode: formValues.maintenanceMode,
        emailNotifications: formValues.emailNotifications,
      });
      setSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentSave = async () => {
    if (!currentUser) return;
    setPaymentError('');
    try {
      setPaymentSaving(true);
      const token = await currentUser.getIdToken();

      const updates: Record<string, unknown> = {
        paymentsEnabled: paymentForm.paymentsEnabled,
        pricing: {
          standard: { amount: Math.round(paymentForm.standardPrice * 100), currency: 'usd', label: 'Standard (Up to 24 hrs)' },
          rush: { amount: Math.round(paymentForm.rushPrice * 100), currency: 'usd', label: 'Rush (Up to 12 hrs)' },
          express: { amount: Math.round(paymentForm.expressPrice * 100), currency: 'usd', label: 'Express (1–5 hrs)' },
        },
      };

      // Only send keys if they were changed (not masked values)
      if (paymentForm.stripeSecretKey && !paymentForm.stripeSecretKey.startsWith('••')) {
        updates.stripeSecretKey = paymentForm.stripeSecretKey;
      }
      if (paymentForm.stripePublishableKey) {
        updates.stripePublishableKey = paymentForm.stripePublishableKey;
      }
      if (paymentForm.stripeWebhookSecret && !paymentForm.stripeWebhookSecret.startsWith('••')) {
        updates.stripeWebhookSecret = paymentForm.stripeWebhookSecret;
      }

      await updatePaymentSettings(token, updates);

      // Reload payment settings to get updated masked keys
      const ps = await getPaymentSettings(token);
      setPaymentSettings(ps);
      setPaymentForm(prev => ({
        ...prev,
        stripeSecretKey: ps.stripeSecretKey || '',
        stripePublishableKey: ps.stripePublishableKey || '',
        stripeWebhookSecret: ps.stripeWebhookSecret || '',
      }));

      setPaymentSaveSuccess(true);
      setTestResult(null);
      setTimeout(() => setPaymentSaveSuccess(false), 3000);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : 'Failed to save payment settings');
    } finally {
      setPaymentSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!currentUser) return;
    try {
      setTestingConnection(true);
      setTestResult(null);
      const token = await currentUser.getIdToken();
      const result = await testStripeConnection(token);
      setTestResult(result);
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Connection test failed',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Settings Form Skeleton */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="h-5 w-48 bg-slate-700 rounded" />
            <div className="h-9 w-28 bg-slate-700 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-4 w-32 bg-slate-700 rounded mb-2" />
                <div className="h-10 w-full bg-slate-700 rounded-lg" />
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-slate-700 space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <div className="h-4 w-36 bg-slate-700 rounded" />
                  <div className="h-3 w-56 bg-slate-700/60 rounded mt-2" />
                </div>
                <div className="h-6 w-11 bg-slate-700 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        {/* Activity Logs Skeleton */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="h-5 w-32 bg-slate-700 rounded mb-4" />
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                <div className="w-8 h-8 rounded-lg bg-slate-700 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-24 bg-slate-700 rounded" />
                    <div className="h-3 w-16 bg-slate-700 rounded" />
                  </div>
                  <div className="h-3 w-48 bg-slate-700/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Settings Form */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">System Configuration</h3>
          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-sm text-green-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Price per Page (USD)</label>
            <input
              type="number"
              value={formValues.pricePerDocument}
              onChange={(e) => setFormValues(prev => ({ ...prev, pricePerDocument: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">AI Provider</label>
            <select
              value={formValues.aiProvider}
              onChange={(e) => setFormValues(prev => ({ ...prev, aiProvider: e.target.value as 'openai' | 'anthropic' }))}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">AI Model</label>
            <input
              type="text"
              value={formValues.aiModel}
              onChange={(e) => setFormValues(prev => ({ ...prev, aiModel: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Max File Size (MB)</label>
            <input
              type="number"
              value={formValues.maxFileSize}
              onChange={(e) => setFormValues(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) || 1 }))}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="mt-6 space-y-4 pt-6 border-t border-slate-700">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-sm font-medium text-white">Maintenance Mode</span>
              <p className="text-xs text-slate-400">Disable uploads and processing for all users</p>
            </div>
            <div className={`relative w-11 h-6 rounded-full transition-colors ${formValues.maintenanceMode ? 'bg-red-600' : 'bg-slate-600'}`}
              onClick={() => setFormValues(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${formValues.maintenanceMode ? 'translate-x-5' : ''}`} />
            </div>
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-sm font-medium text-white">Email Notifications</span>
              <p className="text-xs text-slate-400">Send email alerts for new translations and certifications</p>
            </div>
            <div className={`relative w-11 h-6 rounded-full transition-colors ${formValues.emailNotifications ? 'bg-blue-600' : 'bg-slate-600'}`}
              onClick={() => setFormValues(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${formValues.emailNotifications ? 'translate-x-5' : ''}`} />
            </div>
          </label>
        </div>
      </div>

      {/* Payment Settings */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Payment Settings (Stripe)</h3>
          </div>
          <div className="flex items-center gap-3">
            {paymentSaveSuccess && (
              <span className="text-sm text-green-400 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </span>
            )}
            <button
              onClick={handlePaymentSave}
              disabled={paymentSaving || paymentLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm"
            >
              {paymentSaving ? 'Saving...' : 'Save Payment Settings'}
            </button>
          </div>
        </div>

        {paymentError && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {paymentError}
          </div>
        )}

        {paymentLoading ? (
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="h-4 w-32 bg-slate-700 rounded mb-2" />
                <div className="h-10 w-full bg-slate-700 rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Enable/Disable Toggle */}
            <label className="flex items-center justify-between cursor-pointer mb-6 pb-6 border-b border-slate-700">
              <div>
                <span className="text-sm font-medium text-white">Enable Payments</span>
                <p className="text-xs text-slate-400">When disabled, users can submit without payment</p>
              </div>
              <div className={`relative w-11 h-6 rounded-full transition-colors ${paymentForm.paymentsEnabled ? 'bg-purple-600' : 'bg-slate-600'}`}
                onClick={() => setPaymentForm(prev => ({ ...prev, paymentsEnabled: !prev.paymentsEnabled }))}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${paymentForm.paymentsEnabled ? 'translate-x-5' : ''}`} />
              </div>
            </label>

            {/* Stripe API Keys */}
            <div className="space-y-4 mb-6">
              <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Stripe API Keys
              </h4>
              <p className="text-xs text-slate-500">Get your keys from <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline">Stripe Dashboard → Developers → API Keys</a></p>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Publishable Key</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={paymentForm.stripePublishableKey}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, stripePublishableKey: e.target.value }))}
                    placeholder="pk_test_..."
                    className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  />
                  {paymentSettings?.hasPublishableKey && (
                    <span className="flex items-center px-3 text-green-400 text-xs">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Set
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Secret Key</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type={showSecretKey ? 'text' : 'password'}
                      value={paymentForm.stripeSecretKey}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, stripeSecretKey: e.target.value }))}
                      placeholder="sk_test_..."
                      className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecretKey(!showSecretKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showSecretKey ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.5 6.5m3.378 3.378L6.5 6.5m0 0L3 3m3.5 3.5l10 10M17.5 17.5L21 21" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                  {paymentSettings?.hasSecretKey && (
                    <span className="flex items-center px-3 text-green-400 text-xs">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Set
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">This key is stored encrypted and never shown in full after saving</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Webhook Secret <span className="text-slate-500 font-normal">(optional)</span></label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type={showWebhookSecret ? 'text' : 'password'}
                      value={paymentForm.stripeWebhookSecret}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, stripeWebhookSecret: e.target.value }))}
                      placeholder="whsec_..."
                      className="w-full px-4 py-2 pr-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showWebhookSecret ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.5 6.5m3.378 3.378L6.5 6.5m0 0L3 3m3.5 3.5l10 10M17.5 17.5L21 21" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                  {paymentSettings?.hasWebhookSecret && (
                    <span className="flex items-center px-3 text-green-400 text-xs">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Set
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Test Connection */}
            <div className="mb-6 pb-6 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50 transition-colors text-sm flex items-center gap-2"
                >
                  {testingConnection ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Testing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Test Stripe Connection
                    </>
                  )}
                </button>
                {testResult && (
                  <div className={`flex items-center gap-2 text-sm ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
                    {testResult.success ? (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Connected — {testResult.account?.id}
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        {testResult.message}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h4 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Translation Pricing (USD)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📋</span>
                    <span className="text-sm font-medium text-white">Standard</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">Up to 24 hours delivery</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={paymentForm.standardPrice}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, standardPrice: parseFloat(e.target.value) || 0 }))}
                      className="w-full pl-8 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">⚡</span>
                    <span className="text-sm font-medium text-white">Rush</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">Up to 12 hours delivery</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={paymentForm.rushPrice}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, rushPrice: parseFloat(e.target.value) || 0 }))}
                      className="w-full pl-8 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🚀</span>
                    <span className="text-sm font-medium text-white">Express</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">1–5 hours delivery</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={paymentForm.expressPrice}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, expressPrice: parseFloat(e.target.value) || 0 }))}
                      className="w-full pl-8 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Activity Logs */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Activity Logs</h3>
        {logsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-slate-400 text-sm">Loading logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p className="text-sm">No activity logs recorded yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => {
              const style = getActionStyle(log.action);
              return (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                  <div className={`w-8 h-8 rounded-lg ${style.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <div className={`w-2 h-2 rounded-full ${style.color.replace('text-', 'bg-')}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${style.color}`}>{style.label}</span>
                      <span className="text-xs text-slate-500">{timeAgo(log.createdAt)}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{log.description || log.action}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{log.performedByEmail?.split('@')[0] || 'System'}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
