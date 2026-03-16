import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../AuthProvider';
import {
  getDocumentQueue,
  getQueueStats,
} from '../../services/translatorService';
import type { QueueDocument, QueueStats } from '../../services/translatorService';
import { useDocumentReview } from '../../hooks/useTranslator';
import { DocumentReview } from '../../components/translator';
import { deleteDocument } from '../../services/adminService';
import { getFormTypeLabel, formatDate } from './adminUtils';

const PAGE_SIZE = 10;

const QueueSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-4">
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="h-8 bg-slate-700 rounded w-12 mb-2" />
          <div className="h-3 bg-slate-700 rounded w-20" />
        </div>
      ))}
    </div>
    <div className="bg-slate-800 rounded-xl border border-slate-700">
      <div className="px-6 py-3 flex gap-4 bg-slate-700/50">
        {[140, 100, 80, 90, 60].map((w, i) => (
          <div key={i} className="h-3 bg-slate-600 rounded" style={{ width: w }} />
        ))}
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="px-6 py-4 flex items-center gap-4 border-t border-slate-700">
          <div className="h-4 bg-slate-700 rounded w-36" />
          <div className="h-4 bg-slate-700 rounded w-24" />
          <div className="h-5 bg-slate-700 rounded-full w-16" />
          <div className="h-4 bg-slate-700 rounded w-24" />
          <div className="h-4 bg-slate-700 rounded w-16 ml-auto" />
        </div>
      ))}
    </div>
  </div>
);

const AdminDocReviewPage: React.FC = () => {
  const { currentUser } = useAuth();

  // Queue state
  const [queue, setQueue] = useState<QueueDocument[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Review mode: when a document is selected we show the full DocumentReview
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Use the same hook that translators use
  const {
    document: reviewDocument,
    revisions,
    loading: reviewLoading,
    saving,
    fetchDocument,
    claimDocument,
    releaseDocument,
    updateDocument,
    approveDocument,
    rejectDocument,
    clearDocument,
  } = useDocumentReview();

  const fetchQueue = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const token = await currentUser.getIdToken();
      const [queueData, statsData] = await Promise.all([
        getDocumentQueue(token, { status: statusFilter || 'all', limit: 200 }),
        getQueueStats(token),
      ]);
      setQueue(queueData.documents);
      setStats(statsData);
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to fetch queue:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, statusFilter]);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  // Document selection → open full review
  const handleViewDocument = useCallback(async (doc: QueueDocument) => {
    setSelectedDocId(doc.id);
    await fetchDocument(doc.id);
  }, [fetchDocument]);

  // Back from review → return to queue
  const handleBackFromReview = useCallback(() => {
    clearDocument();
    setSelectedDocId(null);
    fetchQueue();
  }, [clearDocument, fetchQueue]);

  // Claim
  const handleClaim = useCallback(async (docId: string) => {
    const success = await claimDocument(docId);
    if (success) {
      fetchQueue();
      await fetchDocument(docId);
    }
  }, [claimDocument, fetchQueue, fetchDocument]);

  // Save draft
  const handleSaveDraft = useCallback(async (translatedData: Record<string, unknown>, reviewNotes: string) => {
    if (!selectedDocId) return;
    await updateDocument(selectedDocId, { translatedData, reviewNotes });
  }, [selectedDocId, updateDocument]);

  // Approve
  const handleApprove = useCallback(async (finalNotes?: string) => {
    if (!selectedDocId) return;
    const success = await approveDocument(selectedDocId, finalNotes);
    if (success) handleBackFromReview();
  }, [selectedDocId, approveDocument, handleBackFromReview]);

  // Reject
  const handleReject = useCallback(async (reason: string, rejectionType: string) => {
    if (!selectedDocId) return;
    const success = await rejectDocument(
      selectedDocId,
      reason,
      rejectionType as 'quality' | 'illegible' | 'incomplete' | 'wrong_format'
    );
    if (success) handleBackFromReview();
  }, [selectedDocId, rejectDocument, handleBackFromReview]);

  // Release
  const handleRelease = useCallback(async (reason?: string) => {
    if (!selectedDocId) return;
    const success = await releaseDocument(selectedDocId, reason);
    if (success) handleBackFromReview();
  }, [selectedDocId, releaseDocument, handleBackFromReview]);

  // Delete
  const handleDelete = async (docId: string, studentName?: string) => {
    if (!currentUser || !confirm(`Permanently delete "${studentName || docId}"? This cannot be undone.`)) return;
    try {
      setDeleting(docId);
      const token = await currentUser.getIdToken();
      await deleteDocument(token, docId);
      if (selectedDocId === docId) {
        clearDocument();
        setSelectedDocId(null);
      }
      await fetchQueue();
    } catch (err) {
      console.error('Failed to delete:', err);
      alert((err as Error).message);
    } finally {
      setDeleting(null);
    }
  };

  // Filtered & paginated queue
  const filteredQueue = useMemo(() => {
    if (!searchQuery.trim()) return queue;
    const q = searchQuery.toLowerCase();
    return queue.filter(d =>
      d.studentName?.toLowerCase().includes(q) ||
      d.userEmail?.toLowerCase().includes(q) ||
      d.formType?.toLowerCase().includes(q) ||
      d.documentTitle?.toLowerCase().includes(q)
    );
  }, [queue, searchQuery]);

  const totalPages = Math.ceil(filteredQueue.length / PAGE_SIZE);
  const paginatedQueue = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredQueue.slice(start, start + PAGE_SIZE);
  }, [filteredQueue, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending_review: 'bg-yellow-500/20 text-yellow-400',
      in_review: 'bg-blue-500/20 text-blue-400',
      ai_completed: 'bg-cyan-500/20 text-cyan-400',
      approved: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400',
      certified: 'bg-purple-500/20 text-purple-400',
      draft: 'bg-slate-500/20 text-slate-400',
    };
    const labels: Record<string, string> = {
      pending_review: 'Pending',
      in_review: 'In Review',
      ai_completed: 'AI Done',
      approved: 'Approved',
      rejected: 'Rejected',
      certified: 'Certified',
      draft: 'Draft',
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${styles[status] || 'bg-slate-600 text-slate-300'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority || priority === 'normal') return null;
    const styles: Record<string, string> = {
      high: 'bg-orange-500/20 text-orange-400',
      urgent: 'bg-red-500/20 text-red-400',
      low: 'bg-slate-500/20 text-slate-400',
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${styles[priority] || ''}`}>
        {priority}
      </span>
    );
  };

  // ── If reviewing a document, show the full DocumentReview component ──
  if (selectedDocId) {
    if (reviewLoading || !reviewDocument) {
      return (
        <div className="flex flex-col items-center justify-center py-24">
          <svg className="w-8 h-8 animate-spin text-blue-400 mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-white text-sm">Loading document for review...</p>
        </div>
      );
    }

    return (
      <div className="space-y-0">
        {/* Admin-specific delete bar */}
        <div className="flex items-center justify-between mb-4 bg-slate-800/60 rounded-lg px-4 py-2 border border-slate-700">
          <span className="text-xs text-slate-400">
            Admin Review &mdash; You have full control over this document
          </span>
          <button
            onClick={() => handleDelete(reviewDocument.id, reviewDocument.studentName || reviewDocument.documentTitle)}
            disabled={deleting === reviewDocument.id}
            className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-xs disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {deleting === reviewDocument.id ? 'Deleting...' : 'Delete Document'}
          </button>
        </div>

        {/* Full translator DocumentReview component */}
        <DocumentReview
          document={reviewDocument}
          revisions={revisions}
          saving={saving}
          onSave={handleSaveDraft}
          onApprove={handleApprove}
          onReject={handleReject}
          onRelease={handleRelease}
          onClaim={handleClaim}
          onBack={handleBackFromReview}
        />
      </div>
    );
  }

  // ── Queue listing view ──
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && !loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {[
            { label: 'Pending', value: stats.pendingReview, color: 'text-yellow-400' },
            { label: 'In Review', value: stats.inReview, color: 'text-blue-400' },
            { label: 'AI Done', value: stats.aiCompleted, color: 'text-cyan-400' },
            { label: 'Approved', value: stats.approved, color: 'text-green-400' },
            { label: 'Rejected', value: stats.rejected, color: 'text-red-400' },
            { label: 'Total Queue', value: stats.totalInQueue, color: 'text-white' },
            { label: 'Approved Today', value: stats.approvedToday, color: 'text-emerald-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-slate-800 rounded-xl border border-slate-700">
        <div className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, type..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="in_review">In Review</option>
            <option value="ai_completed">AI Completed</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="certified">Certified</option>
            <option value="draft">Draft</option>
          </select>

          <button
            onClick={fetchQueue}
            disabled={loading}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm disabled:opacity-50 flex items-center gap-2"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Queue Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <QueueSkeleton />
          ) : filteredQueue.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium text-white">No documents in queue</p>
              <p className="text-sm mt-1">All documents have been processed.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-slate-400 bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3">Student / Document</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Assigned To</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {paginatedQueue.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-700/30 transition-colors cursor-pointer" onClick={() => handleViewDocument(doc)}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{doc.studentName || doc.documentTitle || 'Untitled'}</div>
                      <div className="text-xs text-slate-400">{doc.userEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{getFormTypeLabel(doc.formType)}</td>
                    <td className="px-4 py-3">{getStatusBadge(doc.status)}</td>
                    <td className="px-4 py-3">{getPriorityBadge(doc.priority) || <span className="text-slate-500 text-xs">Normal</span>}</td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{doc.assignedToName || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${doc.source === 'certifiedDocuments' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {doc.source === 'certifiedDocuments' ? 'Certified' : 'Bulletin'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">{formatDate(doc.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={e => { e.stopPropagation(); handleViewDocument(doc); }}
                          className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                        >
                          Review
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(doc.id, doc.studentName || doc.documentTitle); }}
                          disabled={deleting === doc.id}
                          className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                        >
                          {deleting === doc.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
            <span className="text-sm text-slate-400">
              Showing {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, filteredQueue.length)} of {filteredQueue.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm rounded bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-slate-500 px-1">...</span>}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`px-3 py-1 text-sm rounded ${p === currentPage ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm rounded bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDocReviewPage;
