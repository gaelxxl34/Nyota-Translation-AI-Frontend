import React from 'react';
import type { PromoCode } from '../../services/adminService';

interface PromoCodeTableProps {
  promoCodes: PromoCode[];
  loading: boolean;
  onEdit: (promoCode: PromoCode) => void;
  onToggleActive: (promoCode: PromoCode) => void;
  onDelete: (promoCode: PromoCode) => void;
}

const PromoCodeTable: React.FC<PromoCodeTableProps> = ({
  promoCodes,
  loading,
  onEdit,
  onToggleActive,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="space-y-4 animate-pulse">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-8 rounded bg-gray-200" />
                <div>
                  <div className="h-3 w-28 bg-gray-200 rounded" />
                  <div className="h-3 w-20 bg-gray-100 rounded mt-2" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-16 bg-gray-200 rounded-full" />
                <div className="h-6 w-16 bg-gray-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (promoCodes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <p className="text-gray-500">No promo codes found</p>
          <p className="text-sm text-gray-400 mt-1">Create a promo code to get started</p>
        </div>
      </div>
    );
  }

  const isExpired = (code: PromoCode) => {
    if (!code.validUntil) return false;
    return new Date(code.validUntil) < new Date();
  };

  const isMaxedOut = (code: PromoCode) => {
    if (!code.maxUses) return false;
    return code.currentUses >= code.maxUses;
  };

  const getStatusInfo = (code: PromoCode) => {
    if (!code.isActive) return { label: 'Inactive', color: 'bg-gray-100 text-gray-500' };
    if (isExpired(code)) return { label: 'Expired', color: 'bg-red-50 text-red-600' };
    if (isMaxedOut(code)) return { label: 'Maxed Out', color: 'bg-amber-50 text-amber-600' };
    return { label: 'Active', color: 'bg-green-50 text-green-600' };
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Partner</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Discount</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usage</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Valid Period</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {promoCodes.map((code) => {
              const status = getStatusInfo(code);
              return (
                <tr key={code.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-900 text-white font-mono text-sm font-semibold tracking-wider">
                        {code.code}
                      </span>
                    </div>
                    {code.description && (
                      <p className="mt-1 text-xs text-gray-400">{code.description}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-medium text-gray-900">{code.partnerName}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">
                      {code.type === 'percentage' ? `${code.value}%` : `$${code.value}`}
                    </span>
                    <span className="text-xs text-gray-400 ml-1">
                      {code.type === 'percentage' ? 'off' : 'off'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">{code.currentUses}</span>
                      <span className="text-gray-400"> / {code.maxUses ?? '∞'}</span>
                    </div>
                    {code.maxUses && (
                      <div className="mt-1 w-20 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, (code.currentUses / code.maxUses) * 100)}%` }}
                        />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-gray-500">
                      <p>{formatDate(code.validFrom)} — {formatDate(code.validUntil)}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onToggleActive(code)}
                        className={`p-2 rounded-lg transition-colors ${
                          code.isActive
                            ? 'text-amber-500 hover:bg-amber-50'
                            : 'text-green-500 hover:bg-green-50'
                        }`}
                        title={code.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {code.isActive ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => onEdit(code)}
                        className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(code)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PromoCodeTable;
