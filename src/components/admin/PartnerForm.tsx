// Partner Form Modal Component for NTC Admin Dashboard
// Create or edit partner organization with commission settings

import React, { useState, useEffect } from 'react';
import type { Partner, CreatePartnerData, CommissionTier } from '../../services/adminService';

interface PartnerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePartnerData) => Promise<void>;
  editPartner?: Partner | null;
}

const PARTNER_TYPES = [
  { value: 'university', label: 'University', icon: '🎓' },
  { value: 'highschool', label: 'High School', icon: '🏫' },
  { value: 'organization', label: 'Organization', icon: '🏢' },
];

// Default commission tiers
const DEFAULT_COMMISSION_TIERS: CommissionTier[] = [
  { minStudents: 1, maxStudents: 100, percentage: 10 },
  { minStudents: 101, maxStudents: null, percentage: 15 },
];

const PartnerForm: React.FC<PartnerFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editPartner,
}) => {
  const [formData, setFormData] = useState<CreatePartnerData>({
    name: '',
    shortCode: '',
    type: 'university',
    email: '',
    phone: '',
    address: '',
    commissionEnabled: false,
    commissionTiers: DEFAULT_COMMISSION_TIERS,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes or editPartner changes
  useEffect(() => {
    if (isOpen) {
      if (editPartner) {
        setFormData({
          name: editPartner.name,
          shortCode: editPartner.shortCode,
          type: editPartner.type,
          email: editPartner.email || '',
          phone: editPartner.phone || '',
          address: editPartner.address || '',
          commissionEnabled: editPartner.commissionEnabled || false,
          commissionTiers: editPartner.commissionTiers?.length 
            ? editPartner.commissionTiers 
            : DEFAULT_COMMISSION_TIERS,
        });
      } else {
        setFormData({
          name: '',
          shortCode: '',
          type: 'university',
          email: '',
          phone: '',
          address: '',
          commissionEnabled: false,
          commissionTiers: DEFAULT_COMMISSION_TIERS,
        });
      }
      setError(null);
    }
  }, [isOpen, editPartner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate short code from name
  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      // Auto-generate short code if empty
      shortCode: formData.shortCode || name
        .split(' ')
        .map(word => word[0]?.toUpperCase())
        .join('')
        .slice(0, 6),
    });
  };

  // Commission tier management
  const updateTier = (index: number, field: keyof CommissionTier, value: number | null) => {
    const newTiers = [...(formData.commissionTiers || [])];
    newTiers[index] = { ...newTiers[index], [field]: value };
    
    // Auto-adjust next tier's minStudents if we change maxStudents
    if (field === 'maxStudents' && value !== null && index < newTiers.length - 1) {
      newTiers[index + 1] = { ...newTiers[index + 1], minStudents: value + 1 };
    }
    
    setFormData({ ...formData, commissionTiers: newTiers });
  };

  const addTier = () => {
    const tiers = formData.commissionTiers || [];
    const lastTier = tiers[tiers.length - 1];
    const newMinStudents = lastTier?.maxStudents ? lastTier.maxStudents + 1 : 1;
    
    // Update last tier to have a maxStudents value
    const updatedTiers = tiers.map((tier, i) => 
      i === tiers.length - 1 && tier.maxStudents === null 
        ? { ...tier, maxStudents: newMinStudents - 1 }
        : tier
    );
    
    setFormData({
      ...formData,
      commissionTiers: [
        ...updatedTiers,
        { minStudents: newMinStudents, maxStudents: null, percentage: 15 }
      ]
    });
  };

  const removeTier = (index: number) => {
    const tiers = formData.commissionTiers || [];
    if (tiers.length <= 1) return; // Keep at least one tier
    
    const newTiers = tiers.filter((_, i) => i !== index);
    
    // If we removed the last tier, make the new last tier unlimited
    if (index === tiers.length - 1) {
      newTiers[newTiers.length - 1] = { 
        ...newTiers[newTiers.length - 1], 
        maxStudents: null 
      };
    }
    
    setFormData({ ...formData, commissionTiers: newTiers });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-700">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {editPartner ? 'Edit Partner' : 'Create New Partner'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Organization Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="University of Kinshasa"
              />
            </div>

            {/* Short Code */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Short Code *
              </label>
              <input
                type="text"
                required
                maxLength={10}
                value={formData.shortCode}
                onChange={(e) => setFormData({ ...formData, shortCode: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                placeholder="UNIKIN"
              />
              <p className="mt-1 text-xs text-slate-500">
                A short identifier for the organization (max 10 characters)
              </p>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Organization Type *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {PARTNER_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.type === type.value
                        ? 'bg-blue-500/10 border-blue-500'
                        : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={formData.type === type.value}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'university' | 'highschool' | 'organization' })}
                      className="sr-only"
                    />
                    <span className="text-2xl mb-1">{type.icon}</span>
                    <span className="text-xs text-slate-300">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="registrar@university.cd"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+243 000 000 000"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Address
              </label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Kinshasa, DRC"
              />
            </div>

            {/* Commission Settings Section */}
            <div className="border-t border-slate-700 pt-5 mt-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-white">Referral Commission</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enable to pay partner a percentage per document based on student volume
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.commissionEnabled || false}
                    onChange={(e) => setFormData({ ...formData, commissionEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {formData.commissionEnabled && (
                <div className="space-y-4 bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                      💡 Define percentage tiers based on number of students referred
                    </p>
                    <button
                      type="button"
                      onClick={addTier}
                      className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                    >
                      + Add Tier
                    </button>
                  </div>

                  {/* Commission Tiers */}
                  <div className="space-y-3">
                    {(formData.commissionTiers || []).map((tier, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          {/* Min Students */}
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">From</label>
                            <input
                              type="number"
                              min="1"
                              value={tier.minStudents}
                              onChange={(e) => updateTier(index, 'minStudents', parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              disabled={index > 0} // First tier min is always editable, others auto-set
                            />
                          </div>

                          {/* Max Students */}
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">
                              To {tier.maxStudents === null && <span className="text-green-400">(∞)</span>}
                            </label>
                            <input
                              type="number"
                              min={tier.minStudents}
                              value={tier.maxStudents ?? ''}
                              onChange={(e) => updateTier(index, 'maxStudents', e.target.value ? parseInt(e.target.value) : null)}
                              placeholder="∞"
                              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
                            />
                          </div>

                          {/* Percentage */}
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Commission %</label>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.5"
                                value={tier.percentage}
                                onChange={(e) => updateTier(index, 'percentage', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-1.5 pr-8 bg-slate-900 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                            </div>
                          </div>
                        </div>

                        {/* Remove button */}
                        {(formData.commissionTiers || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTier(index)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                            title="Remove tier"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Preview */}
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-dashed border-slate-600">
                    <p className="text-xs font-medium text-slate-400 mb-2">📊 Commission Preview:</p>
                    <div className="text-xs text-slate-300 space-y-1">
                      {(formData.commissionTiers || []).map((tier, index) => (
                        <p key={index}>
                          {tier.minStudents} - {tier.maxStudents ?? '∞'} students → <span className="text-green-400 font-medium">{tier.percentage}%</span> per document
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium"
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
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {editPartner ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editPartner ? 'Update Partner' : 'Create Partner'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PartnerForm;
