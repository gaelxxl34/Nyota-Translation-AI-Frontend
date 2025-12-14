// Translator Stats Component
// Displays translator performance metrics and leaderboard

import React from 'react';
import type { TranslatorStats as TranslatorStatsType, LeaderboardEntry } from '../../hooks/useTranslator';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface TranslatorStatsProps {
  stats: TranslatorStatsType | null;
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  currentUserId?: string;
}

const TranslatorStats: React.FC<TranslatorStatsProps> = ({
  stats,
  leaderboard,
  loading,
  selectedPeriod,
  onPeriodChange,
  currentUserId,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  const performanceData = stats
    ? [
        { name: 'Approved', value: stats.approved, color: '#10B981' },
        { name: 'Rejected', value: stats.rejected, color: '#EF4444' },
        { name: 'In Progress', value: stats.inProgress, color: '#3B82F6' },
      ]
    : [];

  const periodLabels: Record<string, string> = {
    day: 'Today',
    week: 'This Week',
    month: 'This Month',
    year: 'This Year',
    all: 'All Time',
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex flex-wrap gap-2">
        {['day', 'week', 'month', 'year', 'all'].map((period) => (
          <button
            key={period}
            onClick={() => onPeriodChange(period)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === period
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {periodLabels[period]}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl border border-green-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.approved}</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-green-400/60 text-xs mt-2">{periodLabels[selectedPeriod]}</p>
          </div>

          <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl border border-red-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-400 text-sm font-medium">Rejected</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.rejected}</p>
              </div>
              <div className="p-3 bg-red-500/20 rounded-lg">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <p className="text-red-400/60 text-xs mt-2">{periodLabels[selectedPeriod]}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl border border-blue-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.inProgress}</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-blue-400/60 text-xs mt-2">Currently assigned</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl border border-purple-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 text-sm font-medium">Approval Rate</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.approvalRate}%</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
            <p className="text-purple-400/60 text-xs mt-2">Total: {stats.totalReviewed} reviewed</p>
          </div>
        </div>
      )}

      {/* Charts & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Chart */}
        {stats && performanceData.some((d) => d.value > 0) && (
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Performance Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={performanceData.filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Translator Leaderboard</h3>
          {leaderboard.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No leaderboard data available</p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.uid}
                  className={`flex items-center gap-4 p-3 rounded-lg ${
                    entry.uid === currentUserId
                      ? 'bg-blue-500/20 border border-blue-500/30'
                      : 'bg-gray-700/30'
                  }`}
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                      index === 0
                        ? 'bg-yellow-500 text-yellow-900'
                        : index === 1
                        ? 'bg-gray-300 text-gray-800'
                        : index === 2
                        ? 'bg-amber-600 text-amber-100'
                        : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {entry.displayName}
                      {entry.uid === currentUserId && (
                        <span className="text-blue-400 text-xs ml-2">(You)</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">{entry.documentsApproved}</p>
                    <p className="text-gray-400 text-xs">approved</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All Time Stats */}
      {stats?.allTimeStats && (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">All-Time Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-700/30 rounded-lg">
              <p className="text-2xl font-bold text-green-400">{stats.allTimeStats.documentsApproved || 0}</p>
              <p className="text-gray-400 text-sm">Total Approved</p>
            </div>
            <div className="text-center p-4 bg-gray-700/30 rounded-lg">
              <p className="text-2xl font-bold text-red-400">{stats.allTimeStats.documentsRejected || 0}</p>
              <p className="text-gray-400 text-sm">Total Rejected</p>
            </div>
            <div className="text-center p-4 bg-gray-700/30 rounded-lg">
              <p className="text-2xl font-bold text-blue-400">
                {(stats.allTimeStats.documentsApproved || 0) + (stats.allTimeStats.documentsRejected || 0)}
              </p>
              <p className="text-gray-400 text-sm">Total Reviewed</p>
            </div>
            <div className="text-center p-4 bg-gray-700/30 rounded-lg">
              <p className="text-2xl font-bold text-purple-400">
                {stats.avgReviewTimeMinutes ? `${stats.avgReviewTimeMinutes} min` : 'N/A'}
              </p>
              <p className="text-gray-400 text-sm">Avg Review Time</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslatorStats;
