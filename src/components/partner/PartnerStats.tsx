// Partner Statistics Component for Partner Dashboard
// Displays usage statistics and analytics with charts

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { PartnerStats as PartnerStatsType } from '../../hooks/usePartner';

interface PartnerStatsProps {
  stats: PartnerStatsType | null;
  loading: boolean;
  onRefresh: () => void;
}

const statusColors: Record<string, string> = {
  pending_review: '#EAB308',
  in_review: '#3B82F6',
  ai_completed: '#8B5CF6',
  approved: '#10B981',
  rejected: '#EF4444',
};

const PartnerStats: React.FC<PartnerStatsProps> = ({ stats, loading, onRefresh }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Unable to load statistics</p>
        <button
          onClick={onRefresh}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Prepare data for charts
  const statusDistribution = Object.entries(stats.byStatus || {}).map(([status, count]) => ({
    name: status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    value: count,
    color: statusColors[status] || '#6B7280',
  }));

  const formTypeDistribution = Object.entries(stats.byFormType || {}).map(([type, count]) => ({
    name: type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    value: count,
  }));

  const monthlyData = stats.byMonth || [];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Usage Statistics</h3>
          <p className="text-gray-400 text-sm">Analytics and insights for your organization</p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors text-sm self-start sm:self-auto"
        >
          <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-gray-400 text-xs sm:text-sm">Total Docs</p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1">{stats.totalDocuments || 0}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-gray-400 text-xs sm:text-sm">Students</p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1">{stats.uniqueStudents || 0}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-gray-400 text-xs sm:text-sm">This Period</p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1">{stats.documentsInPeriod || 0}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-gray-400 text-xs sm:text-sm">Approval %</p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1">
                {stats.totalDocuments > 0 
                  ? Math.round((stats.approvedDocuments / stats.totalDocuments) * 100) 
                  : 0}%
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Documents by Status */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-semibold text-white mb-4">Documents by Status</h4>
          {statusDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Legend
                  formatter={(value) => <span style={{ color: '#9CA3AF' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">
              No data available
            </div>
          )}
        </div>

        {/* Documents by Type */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 sm:p-6">
          <h4 className="text-base sm:text-lg font-semibold text-white mb-4">Documents by Type</h4>
          {formTypeDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={formTypeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#9CA3AF', fontSize: 11 }}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fill: '#9CA3AF' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 sm:p-6">
        <h4 className="text-base sm:text-lg font-semibold text-white mb-4">Monthly Document Trend</h4>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" tick={{ fill: '#9CA3AF' }} />
              <YAxis tick={{ fill: '#9CA3AF' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Legend
                formatter={(value) => <span style={{ color: '#9CA3AF' }}>{value}</span>}
              />
              <Line
                type="monotone"
                dataKey="documents"
                name="Total Documents"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="approved"
                name="Approved"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[250px] text-gray-400 text-sm">
            No monthly data available
          </div>
        )}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 sm:p-5">
          <p className="text-gray-400 text-xs sm:text-sm">Approved Documents</p>
          <p className="text-lg sm:text-xl font-bold text-green-400 mt-1">
            {stats.approvedDocuments || 0}
          </p>
          <p className="text-gray-500 text-xs mt-1">Successfully processed</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 sm:p-5">
          <p className="text-gray-400 text-xs sm:text-sm">Pending Documents</p>
          <p className="text-lg sm:text-xl font-bold text-yellow-400 mt-1">
            {stats.pendingDocuments || 0}
          </p>
          <p className="text-gray-500 text-xs mt-1">Awaiting review</p>
        </div>
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 sm:p-5">
          <p className="text-gray-400 text-xs sm:text-sm">Documents in Period</p>
          <p className="text-lg sm:text-xl font-bold text-white mt-1">
            {stats.documentsInPeriod || 0}
          </p>
          <p className="text-gray-500 text-xs mt-1">Current reporting period</p>
        </div>
      </div>
    </div>
  );
};

export default PartnerStats;
