import React, { useState, useEffect } from 'react';
import type { Partner, PromoCode, CreatePromoCodeData } from '../../services/adminService';

interface PromoCodeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePromoCodeData) => Promise<void>;
  onUpdate?: (id: string, updates: Partial<PromoCode>) => Promise<void>;
  editPromoCode?: PromoCode | null;
  partners: Partner[];
}

const PromoCodeForm: React.FC<PromoCodeFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  editPromoCode,
  partners,
}) => {
  const [formData, setFormData] = useState<CreatePromoCodeData>({
    code: '',
    partnerId: '',
    type: 'percentage',
    value: 10,
    maxUses: null,
    validFrom: null,
    validUntil: null,
    applicableTo: ['all'],
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editPromoCode) {
        setFormData({
          code: editPromoCode.code,
          partnerId: editPromoCode.partnerId,
          type: editPromoCode.type,
          value: editPromoCode.value,
          maxUses: editPromoCode.maxUses,
          validFrom: editPromoCode.validFrom
            ? new Date(editPromoCode.validFrom).toISOString().split('T')[0]
            : null,
          validUntil: editPromoCode.validUntil
            ? new Date(editPromoCode.validUntil).toISOString().split('T')[0]
            : null,
          applicableTo: editPromoCode.applicableTo || ['all'],
          description: editPromoCode.description || '',
        });
      } else {
        setFormData({
          code: '',
          partnerId: '',
          type: 'percentage',
          value: 10,
          maxUses: null,
          validFrom: null,
          validUntil: null,
          applicableTo: ['all'],
          description: '',
        });
      }
      setError(null);
    }
  }, [isOpen, editPromoCode]);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const arr = new Uint32Array(8);
    crypto.getRandomValues(arr);
    const code = Array.from(arr, (v) => chars[v % chars.length]).join('');
    setFormData((prev) => ({ ...prev, code }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editPromoCode && onUpdate) {
        await onUpdate(editPromoCode.id, {
          type: formData.type,
          value: formData.value,
          maxUses: formData.maxUses,
          validFrom: formData.validFrom,
          validUntil: formData.validUntil,
          applicableTo: formData.applicableTo,
          description: formData.description,
        } as Partial<PromoCode>);
      } else {
        await onSubmit(formData);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {editPromoCode ? 'Edit Promo Code' : 'Create Promo Code'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Promo Code *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  maxLength={20}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
                  disabled={!!editPromoCode}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono uppercase tracking-wider disabled:bg-gray-100 disabled:text-gray-500"
                  placeholder="SUMMER25"
                />
                {!editPromoCode && (
                  <button
                    type="button"
                    onClick={generateCode}
                    className="px-3 py-2.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    title="Generate random code"
                  >
                    🎲
                  </button>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-400">3-20 alphanumeric characters</p>
            </div>

            {/* Partner */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Partner *
              </label>
              <select
                required
                value={formData.partnerId}
                onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
                disabled={!!editPromoCode}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="">Select a partner...</option>
                {partners.filter((p) => p.isActive).map((partner) => (
                  <option key={partner.partnerId} value={partner.partnerId}>
                    {partner.name} ({partner.shortCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Type & Value */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'flat' })}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount ($)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Value *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="0"
                    max={formData.type === 'percentage' ? 100 : undefined}
                    step={formData.type === 'percentage' ? 1 : 0.01}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    {formData.type === 'percentage' ? '%' : '$'}
                  </span>
                </div>
              </div>
            </div>

            {/* Max Uses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Uses
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxUses ?? ''}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value ? parseInt(e.target.value, 10) : null })}
                placeholder="Unlimited"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-400">Leave empty for unlimited uses</p>
            </div>

            {/* Valid Period */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid From
                </label>
                <input
                  type="date"
                  value={formData.validFrom || ''}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value || null })}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid Until
                </label>
                <input
                  type="date"
                  value={formData.validUntil || ''}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value || null })}
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Summer 2026 promotion"
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Preview */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-2">Preview</p>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-900 text-white font-mono text-sm font-semibold tracking-wider">
                  {formData.code || 'CODE'}
                </span>
                <span className="text-sm text-gray-600">
                  → {formData.type === 'percentage' ? `${formData.value}% off` : `$${formData.value} off`}
                  {formData.maxUses ? ` (max ${formData.maxUses} uses)` : ' (unlimited)'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {editPromoCode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editPromoCode ? 'Update Code' : 'Create Code'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PromoCodeForm;
