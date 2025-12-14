// Partner Table Component for NTC Admin Dashboard
// Displays list of partner organizations

import React from 'react';
import type { Partner } from '../../services/adminService';

interface PartnerTableProps {
  partners: Partner[];
  loading: boolean;
  onEdit: (partner: Partner) => void;
  onViewDetails: (partner: Partner) => void;
}

const getTypeBadgeColor = (type: string): string => {
  const colors: Record<string, string> = {
    university: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    highschool: 'bg-green-500/20 text-green-400 border-green-500/30',
    organization: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  };
  return colors[type] || colors.organization;
};

const PartnerTable: React.FC<PartnerTableProps> = ({
  partners,
  loading,
  onEdit,
  onViewDetails,
}) => {
  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="space-y-4 animate-pulse">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4 bg-slate-900/40 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-700" />
                <div>
                  <div className="h-3 w-28 bg-slate-700 rounded" />
                  <div className="h-3 w-20 bg-slate-800 rounded mt-2" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-16 bg-slate-700 rounded-full" />
                <div className="h-6 w-12 bg-slate-700 rounded-full" />
                <div className="h-6 w-20 bg-slate-700 rounded" />
                <div className="h-6 w-20 bg-slate-700 rounded" />
                <div className="h-6 w-16 bg-slate-700 rounded" />
                <div className="flex gap-2">
                  <div className="h-9 w-9 bg-slate-700 rounded" />
                  <div className="h-9 w-9 bg-slate-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (partners.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
        <div className="text-center">
          <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-slate-400">No partners found</p>
          <p className="text-sm text-slate-500 mt-1">Create a partner to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Partner
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Students
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Documents
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Commission
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {partners.map((partner) => (
              <tr key={partner.partnerId} className="hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white"
                      style={{ backgroundColor: partner.primaryColor || '#3B82F6' }}
                    >
                      {partner.shortCode?.[0] || partner.name?.[0]?.toUpperCase() || 'P'}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-white">{partner.name}</p>
                      <p className="text-sm text-slate-400">{partner.shortCode}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border capitalize ${getTypeBadgeColor(partner.type)}`}>
                    {partner.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-white font-medium">
                    {partner.stats?.totalStudents || 0}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <span className="text-white font-medium">{partner.stats?.documentsTotal || 0}</span>
                    <span className="text-slate-400"> total</span>
                    <br />
                    <span className="text-green-400 text-xs">{partner.stats?.documentsThisMonth || 0} this month</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {partner.commissionEnabled ? (
                    <div className="text-sm">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Enabled
                      </span>
                      <div className="mt-1 text-xs text-slate-400">
                        {partner.commissionTiers?.map((tier, i) => (
                          <span key={i} className="block">
                            {tier.minStudents}-{tier.maxStudents ?? '∞'}: {tier.percentage}%
                          </span>
                        )).slice(0, 2)}
                        {(partner.commissionTiers?.length || 0) > 2 && (
                          <span className="text-slate-500">+{(partner.commissionTiers?.length || 0) - 2} more</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">Not enabled</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    partner.isActive 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      partner.isActive ? 'bg-green-400' : 'bg-red-400'
                    }`}></span>
                    {partner.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onViewDetails(partner)}
                      className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      aria-label="View details"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onEdit(partner)}
                      className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      aria-label="Edit partner"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PartnerTable;
