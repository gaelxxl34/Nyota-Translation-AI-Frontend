// Support Stats Component for Support Dashboard
// Displays support agent performance metrics and team statistics

import React from 'react';
import type { SupportStats, TeamStats, SupportAgent } from '../../hooks/useSupport';

interface SupportStatsProps {
  stats: SupportStats | null;
  teamStats: TeamStats | null;
  agents: SupportAgent[];
  loading: boolean;
  period: string;
  onPeriodChange: (period: 'day' | 'week' | 'month' | 'year' | 'all') => void;
  isAdmin?: boolean;
}

const SupportStatsComponent: React.FC<SupportStatsProps> = ({
  stats,
  teamStats,
  agents,
  loading,
  period,
  onPeriodChange,
  isAdmin = false,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="space-y-4 w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 animate-pulse">
                <div className="h-4 w-20 bg-gray-200 rounded mb-3" />
                <div className="h-8 w-16 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex flex-wrap gap-2">
        {(['day', 'week', 'month', 'year', 'all'] as const).map((p) => (
          <button
            key={p}
            onClick={() => onPeriodChange(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              period === p
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p === 'all' ? 'All Time' : `This ${p}`}
          </button>
        ))}
      </div>

      {/* Personal Stats */}
      {stats && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Performance</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-500">Resolved</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.conversationsResolved}</p>
              <p className="text-xs text-gray-400 mt-1">
                All time: {stats.allTimeStats.conversationsResolved}
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-500">Messages Sent</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.messagesSent}</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-500">Docs Delivered</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.documentsDelivered}</p>
              <p className="text-xs text-gray-400 mt-1">
                All time: {stats.allTimeStats.documentsDelivered}
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm text-gray-500">Avg Response</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stats.avgResponseTimeMinutes > 0 ? `${stats.avgResponseTimeMinutes}m` : '-'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Team Stats (Admin Only) */}
      {isAdmin && teamStats && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 border border-green-200 shadow-sm">
              <p className="text-sm text-green-600 mb-1">Active Agents</p>
              <p className="text-3xl font-bold text-gray-900">{teamStats.totalAgents}</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-blue-200 shadow-sm">
              <p className="text-sm text-blue-600 mb-1">Total Conversations</p>
              <p className="text-3xl font-bold text-gray-900">{teamStats.totalConversations}</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-purple-200 shadow-sm">
              <p className="text-sm text-purple-600 mb-1">Resolved</p>
              <p className="text-3xl font-bold text-gray-900">{teamStats.resolvedConversations}</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-amber-200 shadow-sm">
              <p className="text-sm text-amber-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-gray-900">{teamStats.pendingConversations}</p>
            </div>
          </div>

          {/* Agent Leaderboard */}
          {agents.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900">Support Agent Leaderboard</h4>
              </div>
              <div className="divide-y divide-gray-100">
                {agents.map((agent, index) => (
                  <div
                    key={agent.uid}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-600' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-50 text-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{agent.displayName}</p>
                        <p className="text-sm text-gray-400">{agent.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {(agent.stats as Record<string, number>)?.totalConversationsResolved || 0}
                      </p>
                      <p className="text-xs text-gray-400">resolved</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Activity Tips */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Quick Tips
        </h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            Respond to tickets quickly to improve average response time
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            Assign tickets to yourself to let the team know you're handling them
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            Mark tickets as resolved when the issue is fully addressed
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">•</span>
            Check customer ratings to identify areas for improvement
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SupportStatsComponent;
