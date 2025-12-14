// Document Queue Component for Translator Dashboard
// Displays pending documents awaiting review

import React from 'react';
import type { QueueDocument, QueueStats } from '../../hooks/useTranslator';

interface DocumentQueueProps {
  documents: QueueDocument[];
  stats: QueueStats | null;
  loading: boolean;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onDocumentSelect: (doc: QueueDocument) => void;
  onClaimDocument: (docId: string) => void;
}

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  normal: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  low: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const statusColors: Record<string, string> = {
  pending_review: 'bg-yellow-500/20 text-yellow-400',
  in_review: 'bg-blue-500/20 text-blue-400',
  ai_completed: 'bg-purple-500/20 text-purple-400',
  approved: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
};

const statusLabels: Record<string, string> = {
  pending_review: 'Pending Review',
  in_review: 'In Review',
  ai_completed: 'AI Completed',
  approved: 'Approved',
  rejected: 'Rejected',
};

const formTypeLabels: Record<string, string> = {
  bulletin: 'School Bulletin',
  state_diploma: 'State Diploma',
  bachelor_diploma: 'Bachelor Diploma',
  college_transcript: 'College Transcript',
  attestation: 'Attestation',
};

const DocumentQueue: React.FC<DocumentQueueProps> = ({
  documents,
  stats,
  loading,
  statusFilter,
  onStatusFilterChange,
  onDocumentSelect,
  onClaimDocument,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Queue Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Total in Queue</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.totalInQueue}</p>
          </div>
          <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
            <p className="text-xs text-yellow-400 uppercase tracking-wide">Pending Review</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">{stats.pendingReview}</p>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
            <p className="text-xs text-blue-400 uppercase tracking-wide">In Review</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{stats.inReview}</p>
          </div>
          <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/30">
            <p className="text-xs text-purple-400 uppercase tracking-wide">AI Completed</p>
            <p className="text-2xl font-bold text-purple-400 mt-1">{stats.aiCompleted}</p>
          </div>
          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
            <p className="text-xs text-green-400 uppercase tracking-wide">Approved</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{stats.approved}</p>
          </div>
          <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
            <p className="text-xs text-red-400 uppercase tracking-wide">Rejected</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{stats.rejected}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/30">
            <p className="text-xs text-emerald-400 uppercase tracking-wide">Approved Today</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.approvedToday}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onStatusFilterChange('')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === ''
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          All
        </button>
        <button
          onClick={() => onStatusFilterChange('pending_review')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'pending_review'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Pending Review
        </button>
        <button
          onClick={() => onStatusFilterChange('ai_completed')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'ai_completed'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          AI Completed
        </button>
        <button
          onClick={() => onStatusFilterChange('in_review')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            statusFilter === 'in_review'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          In Review
        </button>
      </div>

      {/* Document List */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-600 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-400">No documents in queue</p>
            <p className="text-gray-500 text-sm mt-1">Documents will appear here when submitted</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 hover:bg-gray-700/30 transition-colors cursor-pointer"
                onClick={() => onDocumentSelect(doc)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[doc.status]}`}>
                        {statusLabels[doc.status] || doc.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${priorityColors[doc.priority]}`}>
                        {doc.priority.charAt(0).toUpperCase() + doc.priority.slice(1)}
                      </span>
                      {doc.aiConfidenceScore && (
                        <span className="px-2 py-0.5 rounded text-xs bg-gray-700 text-gray-300">
                          AI: {Math.round(doc.aiConfidenceScore * 100)}%
                        </span>
                      )}
                    </div>
                    <h4 className="text-white font-medium truncate">
                      {doc.studentName || 'Unknown Student'}
                    </h4>
                    <p className="text-gray-400 text-sm truncate">
                      {formTypeLabels[doc.formType] || doc.formType} • {doc.schoolName || 'Unknown School'}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>ID: {doc.id.slice(0, 8)}...</span>
                      <span>User: {doc.userEmail}</span>
                      <span>{formatDate(doc.createdAt)}</span>
                    </div>
                    {doc.assignedTo && (
                      <p className="text-xs text-blue-400 mt-1">
                        Assigned to: {doc.assignedToName}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {!doc.assignedTo && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onClaimDocument(doc.id);
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                      >
                        Claim
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDocumentSelect(doc);
                      }}
                      className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-lg transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentQueue;
