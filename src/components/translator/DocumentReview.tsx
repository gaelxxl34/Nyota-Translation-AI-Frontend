// Document Review Component for Translator Dashboard
// Full document view with editing and approval workflow

import React, { useState } from 'react';
import type { DocumentDetail, DocumentRevision } from '../../hooks/useTranslator';

interface DocumentReviewProps {
  document: DocumentDetail;
  revisions: DocumentRevision[];
  saving: boolean;
  onSave: (translatedData: Record<string, unknown>, reviewNotes: string) => void;
  onApprove: (finalNotes?: string) => void;
  onReject: (reason: string, type: string) => void;
  onRelease: (reason?: string) => void;
  onBack: () => void;
}

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

const DocumentReview: React.FC<DocumentReviewProps> = ({
  document,
  revisions,
  saving,
  onSave,
  onApprove,
  onReject,
  onRelease,
  onBack,
}) => {
  const [editedData, setEditedData] = useState<Record<string, unknown>>(
    document.translatedData || document.extractedData || {}
  );
  const [reviewNotes, setReviewNotes] = useState(document.reviewNotes || '');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectType, setRejectType] = useState('quality');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [finalNotes, setFinalNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'original' | 'history'>('edit');

  const handleFieldChange = (key: string, value: unknown) => {
    setEditedData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    onSave(editedData, reviewNotes);
  };

  const handleApprove = () => {
    onApprove(finalNotes || undefined);
    setShowApproveModal(false);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    onReject(rejectReason, rejectType);
    setShowRejectModal(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const renderDataEditor = (data: Record<string, unknown>, prefix = '') => {
    return Object.entries(data).map(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const label = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();

      if (value === null || value === undefined) {
        return (
          <div key={fullKey} className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
            <input
              type="text"
              value=""
              onChange={(e) => handleFieldChange(fullKey, e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter value..."
            />
          </div>
        );
      }

      if (typeof value === 'object' && !Array.isArray(value)) {
        return (
          <div key={fullKey} className="mb-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2 border-b border-gray-700 pb-1">
              {label}
            </h4>
            <div className="pl-4 border-l-2 border-gray-700">
              {renderDataEditor(value as Record<string, unknown>, fullKey)}
            </div>
          </div>
        );
      }

      if (Array.isArray(value)) {
        return (
          <div key={fullKey} className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
            <div className="space-y-2">
              {value.map((item, index) => (
                <div key={`${fullKey}-${index}`} className="bg-gray-700/50 rounded-lg p-3">
                  {typeof item === 'object' ? (
                    renderDataEditor(item as Record<string, unknown>, `${fullKey}[${index}]`)
                  ) : (
                    <input
                      type="text"
                      value={String(item)}
                      onChange={(e) => {
                        const newArray = [...value];
                        newArray[index] = e.target.value;
                        handleFieldChange(fullKey, newArray);
                      }}
                      className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }

      return (
        <div key={fullKey} className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
          {typeof value === 'boolean' ? (
            <select
              value={value ? 'true' : 'false'}
              onChange={(e) => handleFieldChange(fullKey, e.target.value === 'true')}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          ) : typeof value === 'number' ? (
            <input
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(fullKey, parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
            />
          ) : String(value).length > 100 ? (
            <textarea
              value={String(value)}
              onChange={(e) => handleFieldChange(fullKey, e.target.value)}
              rows={4}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 resize-y"
            />
          ) : (
            <input
              type="text"
              value={String(value)}
              onChange={(e) => handleFieldChange(fullKey, e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
      );
    });
  };

  const isEditable = document.status === 'in_review' || document.status === 'ai_completed';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Queue
        </button>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-lg text-sm font-medium ${statusColors[document.status]}`}>
            {statusLabels[document.status] || document.status}
          </span>
        </div>
      </div>

      {/* Document Info */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Document ID</p>
            <p className="text-white font-mono text-sm mt-1">{document.id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Form Type</p>
            <p className="text-white mt-1">{document.formType}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Submitted By</p>
            <p className="text-white mt-1">{document.userEmail}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Submitted At</p>
            <p className="text-white mt-1">{formatDate(document.createdAt)}</p>
          </div>
          {document.aiConfidenceScore && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">AI Confidence</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      document.aiConfidenceScore > 0.8
                        ? 'bg-green-500'
                        : document.aiConfidenceScore > 0.6
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${document.aiConfidenceScore * 100}%` }}
                  />
                </div>
                <span className="text-white text-sm">
                  {Math.round(document.aiConfidenceScore * 100)}%
                </span>
              </div>
            </div>
          )}
          {document.assignedToName && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Assigned To</p>
              <p className="text-blue-400 mt-1">{document.assignedToName}</p>
            </div>
          )}
        </div>
        {document.aiNotes && (
          <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <p className="text-xs text-purple-400 uppercase tracking-wide mb-1">AI Notes</p>
            <p className="text-gray-300 text-sm">{document.aiNotes}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        <button
          onClick={() => setActiveTab('edit')}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
            activeTab === 'edit'
              ? 'bg-gray-700 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          Edit Translation
        </button>
        <button
          onClick={() => setActiveTab('original')}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
            activeTab === 'original'
              ? 'bg-gray-700 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          Original Data
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-gray-700 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          Revision History ({revisions.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
        {activeTab === 'edit' && (
          <div className="space-y-6">
            {/* Data Editor */}
            <div className="max-h-[500px] overflow-y-auto pr-2">
              {Object.keys(editedData).length > 0 ? (
                renderDataEditor(editedData)
              ) : (
                <p className="text-gray-400 text-center py-8">No data available to edit</p>
              )}
            </div>

            {/* Review Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Review Notes</label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Add notes about this translation..."
                disabled={!isEditable}
              />
            </div>

            {/* Action Buttons */}
            {isEditable && (
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                      />
                    </svg>
                  )}
                  Save Draft
                </button>
                <button
                  onClick={() => setShowApproveModal(true)}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Approve
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reject
                </button>
                <button
                  onClick={() => onRelease()}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors ml-auto"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
                    />
                  </svg>
                  Release
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'original' && (
          <div className="max-h-[600px] overflow-y-auto">
            <pre className="text-gray-300 text-sm whitespace-pre-wrap font-mono bg-gray-900 rounded-lg p-4">
              {JSON.stringify(document.extractedData || {}, null, 2)}
            </pre>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {revisions.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No revision history</p>
            ) : (
              revisions.map((rev) => (
                <div key={rev.id} className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{rev.translatorName}</span>
                    <span className="text-gray-400 text-sm">{formatDate(rev.createdAt)}</span>
                  </div>
                  <p className="text-gray-300 text-sm">{rev.changes}</p>
                  {rev.comment && (
                    <p className="text-gray-400 text-sm mt-2 italic">"{rev.comment}"</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Approve Translation</h3>
            <p className="text-gray-400 mb-4">
              Are you sure you want to approve this translation? This will mark it as ready for delivery.
            </p>
            <textarea
              value={finalNotes}
              onChange={(e) => setFinalNotes(e.target.value)}
              rows={3}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white mb-4"
              placeholder="Final notes (optional)..."
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Reject Document</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Rejection Type</label>
              <select
                value={rejectType}
                onChange={(e) => setRejectType(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="quality">Quality Issues</option>
                <option value="illegible">Illegible Document</option>
                <option value="incomplete">Incomplete Information</option>
                <option value="wrong_format">Wrong Format</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Reason *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="Explain why this document is being rejected..."
                required
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentReview;
