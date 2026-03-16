import React from 'react';
import { StatsCard } from '../../components/admin';
import type { AdminPage } from '../../components/admin';
import type { ActivityLog, AdminDocument } from '../../services/adminService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getFormTypeLabel, formatCurrency, timeAgo, getActionStyle } from './adminUtils';

interface OverviewTabProps {
  userStats: { total: number; active: number } | null;
  analytics: { documents: { total: number; byFormType?: Record<string, number> }; partners: { total: number; active: number } } | null;
  documentStats: { totalRevenue: number; pricePerDocument: number } | null;
  recentDocs: AdminDocument[];
  recentLogs: ActivityLog[];
  onNavigate: (page: AdminPage) => void;
  onCreateUser: () => void;
  onCreatePartner: () => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  userStats, analytics, documentStats, recentDocs, recentLogs,
  onNavigate, onCreateUser, onCreatePartner,
}) => {
  const isLoading = !userStats && !analytics;

  const documentTypeData = analytics?.documents.byFormType
    ? Object.entries(analytics.documents.byFormType).map(([type, count]) => ({
        name: getFormTypeLabel(type),
        count,
      }))
    : [];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        {/* Two Column Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 w-36 bg-slate-700 rounded" />
                <div className="h-4 w-16 bg-slate-700 rounded" />
              </div>
              <div className="space-y-3">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-700" />
                      <div className="space-y-2">
                        <div className="h-3 w-28 bg-slate-700 rounded" />
                        <div className="h-3 w-20 bg-slate-700/60 rounded" />
                      </div>
                    </div>
                    <div className="h-3 w-12 bg-slate-700 rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Chart + Quick Actions Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="h-5 w-40 bg-slate-700 rounded mb-4" />
            <div className="h-64 bg-slate-700/30 rounded-lg" />
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="h-5 w-28 bg-slate-700 rounded mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg">
                  <div className="w-10 h-10 bg-slate-700 rounded-lg" />
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-slate-700 rounded" />
                    <div className="h-3 w-24 bg-slate-700/60 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={userStats?.total || 0}
          icon={
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          iconBgColor="bg-blue-500/10"
          subtitle={`${userStats?.active || 0} active`}
        />
        <StatsCard
          title="Documents"
          value={analytics?.documents.total || 0}
          icon={
            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          iconBgColor="bg-green-500/10"
        />
        <StatsCard
          title="Partners"
          value={analytics?.partners.total || 0}
          icon={
            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          iconBgColor="bg-purple-500/10"
          subtitle={`${analytics?.partners.active || 0} active`}
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
      </div>

      {/* Two Column: Recent Docs + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Documents */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Documents</h3>
            <button
              onClick={() => onNavigate('documents')}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              View all
            </button>
          </div>
          {recentDocs.length > 0 ? (
            <div className="space-y-3">
              {recentDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{doc.studentName}</p>
                      <p className="text-xs text-slate-400">{getFormTypeLabel(doc.formType)}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                    {doc.uploadedAt ? timeAgo(doc.uploadedAt) : '—'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">No documents yet</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <button
              onClick={() => onNavigate('settings')}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              View all
            </button>
          </div>
          {recentLogs.length > 0 ? (
            <div className="space-y-3">
              {recentLogs.map((log) => {
                const style = getActionStyle(log.action);
                return (
                  <div key={log.id} className="flex items-start gap-3 p-3 bg-slate-700/40 rounded-lg">
                    <div className={`w-9 h-9 rounded-lg ${style.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <div className={`w-2 h-2 rounded-full ${style.color.replace('text-', 'bg-')}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white">
                        <span className={`font-medium ${style.color}`}>{style.label}</span>
                      </p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {log.description || log.action}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {log.performedByEmail?.split('@')[0] || 'System'} · {timeAgo(log.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">No activity recorded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Two Column: Docs by Type + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documents by Type */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Documents by Type</h3>
          {documentTypeData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={documentTypeData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={{ stroke: '#334155' }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#94A3B8', fontSize: 12 }} axisLine={false} tickLine={false} width={130} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#F8FAFC' }}
                  />
                  <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">
              <p className="text-sm">No document data available</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => { onNavigate('users'); onCreateUser(); }}
              className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-colors"
            >
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Create User</p>
                <p className="text-xs text-slate-400">Add staff member</p>
              </div>
            </button>

            <button
              onClick={() => { onNavigate('partners'); onCreatePartner(); }}
              className="flex items-center gap-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors"
            >
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Add Partner</p>
                <p className="text-xs text-slate-400">Register organization</p>
              </div>
            </button>

            <button
              onClick={() => onNavigate('documents')}
              className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-colors"
            >
              <div className="p-2 bg-green-500/20 rounded-lg">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">View Documents</p>
                <p className="text-xs text-slate-400">All translations</p>
              </div>
            </button>

            <button
              onClick={() => onNavigate('users')}
              className="flex items-center gap-3 p-4 bg-slate-700/50 border border-slate-600/50 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <div className="p-2 bg-slate-600/30 rounded-lg">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Manage Users</p>
                <p className="text-xs text-slate-400">Roles & access</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
