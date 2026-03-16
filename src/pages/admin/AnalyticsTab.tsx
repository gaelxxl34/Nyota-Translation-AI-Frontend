import React from 'react';
import { StatsCard } from '../../components/admin';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getFormTypeLabel, formatCurrency } from './adminUtils';

interface DocumentStats {
  totalDocuments: number;
  totalRevenue: number;
  pricePerDocument: number;
  documentsByUser: Array<{
    userId: string;
    email: string;
    count: number;
    revenue: number;
  }>;
  documentsByFormType: Record<string, number>;
}

interface AnalyticsTabProps {
  analytics: { documents: { total: number; byFormType?: Record<string, number> }; partners: { total: number; active: number }; generatedAt?: string } | null;
  documentStats: DocumentStats | null;
  userStats: { total: number; active: number } | null;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ analytics, documentStats, userStats }) => {
  const isLoading = !analytics && !documentStats;

  const documentTypeData = analytics?.documents.byFormType
    ? Object.entries(analytics.documents.byFormType).map(([type, count]) => ({
        name: getFormTypeLabel(type),
        count,
      }))
    : [];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-700" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-20 bg-slate-700 rounded" />
                  <div className="h-6 w-16 bg-slate-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Chart Skeleton */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="h-5 w-40 bg-slate-700 rounded mb-4" />
          <div className="h-80 bg-slate-700/30 rounded-lg" />
        </div>
        {/* Table Skeleton */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="h-5 w-32 bg-slate-700 rounded mb-4" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-6 py-3 border-t border-slate-700 first:border-t-0">
                <div className="h-4 w-40 bg-slate-700 rounded" />
                <div className="h-4 w-16 bg-slate-700 rounded" />
                <div className="h-4 w-24 bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        </div>
        {/* Type Breakdown Skeleton */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="h-5 w-48 bg-slate-700 rounded mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-700/50 rounded-lg p-4">
                <div className="h-3 w-20 bg-slate-600 rounded mb-2" />
                <div className="h-7 w-10 bg-slate-600 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Documents"
          value={documentStats?.totalDocuments || analytics?.documents.total || 0}
          icon={
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          iconBgColor="bg-blue-500/10"
          subtitle="Total translations"
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(documentStats?.totalRevenue || (analytics?.documents.total || 0) * 30)}
          icon={
            <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          iconBgColor="bg-yellow-500/10"
          subtitle={`@ ${formatCurrency(documentStats?.pricePerDocument || 30)}/page`}
        />
        <StatsCard
          title="Active Users"
          value={userStats?.active || 0}
          icon={
            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          iconBgColor="bg-green-500/10"
          subtitle={`of ${userStats?.total || 0} total`}
        />
        <StatsCard
          title="Active Partners"
          value={analytics?.partners.active || 0}
          icon={
            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          iconBgColor="bg-purple-500/10"
          subtitle={`of ${analytics?.partners.total || 0} total`}
        />
      </div>

      {/* Documents by Type Chart */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Documents by Type</h3>
        {documentTypeData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={documentTypeData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#F8FAFC' }}
                />
                <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-slate-500">
            <p className="text-sm">No document data available</p>
          </div>
        )}
      </div>

      {/* Revenue by User */}
      {documentStats && documentStats.documentsByUser.length > 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Revenue by User</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-600">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Documents</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-600">
                {documentStats.documentsByUser.map((user) => (
                  <tr key={user.userId} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{user.count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-yellow-400">{formatCurrency(user.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Documents by Form Type Grid */}
      {documentStats && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Document Type Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(documentStats.documentsByFormType).map(([formType, count]) => (
              <div key={formType} className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-sm text-slate-400">{getFormTypeLabel(formType)}</p>
                <p className="text-2xl font-bold text-white mt-1">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Updated */}
      {analytics?.generatedAt && (
        <p className="text-sm text-slate-500 text-center">
          Last updated: {new Date(analytics.generatedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
};

export default AnalyticsTab;
