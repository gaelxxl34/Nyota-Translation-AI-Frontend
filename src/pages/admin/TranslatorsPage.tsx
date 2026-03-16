import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../AuthProvider';
import type { AdminTranslator, QueueDocument } from '../../services/adminService';
import { getTranslators, getTranslatorDocuments, assignDocument, unassignDocument, getAdminQueue } from '../../services/adminService';
import { getFormTypeLabel, formatDate } from './adminUtils';

const TranslatorsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [translators, setTranslators] = useState<AdminTranslator[]>([]);
  const [queue, setQueue] = useState<QueueDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTranslator, setSelectedTranslator] = useState<AdminTranslator | null>(null);
  const [translatorDocs, setTranslatorDocs] = useState<{ id: string; studentName: string; formType: string; status: string; source: string; assignedAt: string; createdAt: string }[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignDocId, setAssignDocId] = useState('');
  const [assignTranslatorUid, setAssignTranslatorUid] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [queueFilter, setQueueFilter] = useState('');

  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const token = await currentUser.getIdToken();
      const [t, q] = await Promise.all([
        getTranslators(token),
        getAdminQueue(token, { limit: 100 }),
      ]);
      setTranslators(t);
      setQueue(q);
    } catch (err) {
      console.error('Failed to fetch translators/queue:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSelectTranslator = async (translator: AdminTranslator) => {
    if (!currentUser) return;
    setSelectedTranslator(translator);
    setDocsLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const docs = await getTranslatorDocuments(token, translator.uid);
      setTranslatorDocs(docs);
    } catch (err) {
      console.error('Failed to fetch translator docs:', err);
    } finally {
      setDocsLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!currentUser || !assignDocId || !assignTranslatorUid) return;
    try {
      setActionLoading(assignDocId);
      const token = await currentUser.getIdToken();
      await assignDocument(token, assignDocId, assignTranslatorUid);
      setShowAssignModal(false);
      setAssignDocId('');
      setAssignTranslatorUid('');
      await fetchData();
      if (selectedTranslator) handleSelectTranslator(selectedTranslator);
    } catch (err) {
      console.error('Failed to assign document:', err);
      alert(err instanceof Error ? err.message : 'Failed to assign document');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnassign = async (docId: string) => {
    if (!currentUser || !confirm('Remove this document from the translator and put it back in queue?')) return;
    try {
      setActionLoading(docId);
      const token = await currentUser.getIdToken();
      await unassignDocument(token, docId);
      await fetchData();
      if (selectedTranslator) handleSelectTranslator(selectedTranslator);
    } catch (err) {
      console.error('Failed to unassign document:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredQueue = queue.filter(d => {
    if (!queueFilter) return !d.assignedTo;
    if (queueFilter === 'all') return true;
    return d.status === queueFilter;
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Summary Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <div className="h-3 w-28 bg-slate-700 rounded mb-3" />
              <div className="h-7 w-12 bg-slate-700 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Translators List Skeleton */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="h-5 w-24 bg-slate-700 rounded mb-4" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-700/40 rounded-lg">
                  <div className="w-9 h-9 rounded-full bg-slate-700 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 bg-slate-700 rounded" />
                    <div className="h-3 w-32 bg-slate-700/60 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Detail Panel Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
              <div className="w-12 h-12 bg-slate-700 rounded-lg mx-auto mb-3" />
              <div className="h-4 w-48 bg-slate-700 rounded mx-auto" />
            </div>
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="h-5 w-32 bg-slate-700 rounded mb-4" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-3 border-t border-slate-700 first:border-0">
                  <div className="h-4 w-28 bg-slate-700 rounded" />
                  <div className="h-4 w-24 bg-slate-700 rounded" />
                  <div className="h-5 w-16 bg-slate-700 rounded-full" />
                  <div className="h-4 w-20 bg-slate-700 rounded ml-auto" />
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
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <p className="text-sm text-slate-400">Active Translators</p>
          <p className="text-2xl font-bold text-white mt-1">{translators.filter(t => t.isActive).length}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <p className="text-sm text-slate-400">Documents in Queue</p>
          <p className="text-2xl font-bold text-white mt-1">{queue.filter(d => !d.assignedTo).length}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <p className="text-sm text-slate-400">Currently Assigned</p>
          <p className="text-2xl font-bold text-white mt-1">{queue.filter(d => d.assignedTo).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Translators List */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Translators</h3>
          <div className="space-y-2">
            {translators.map((t) => (
              <button
                key={t.uid}
                onClick={() => handleSelectTranslator(t)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  selectedTranslator?.uid === t.uid
                    ? 'bg-blue-500/20 border border-blue-500/30'
                    : 'bg-slate-700/40 hover:bg-slate-700/60 border border-transparent'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-blue-400">
                    {(t.displayName || t.email)[0].toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{t.displayName || t.email.split('@')[0]}</p>
                  <p className="text-xs text-slate-400">{t.assignedCount} assigned · {t.approvedCount} approved</p>
                </div>
                {!t.isActive && (
                  <span className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full">Inactive</span>
                )}
              </button>
            ))}
            {translators.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">No translators found</p>
            )}
          </div>
        </div>

        {/* Translator Detail / Documents */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTranslator ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{selectedTranslator.displayName || selectedTranslator.email}</h3>
                  <p className="text-sm text-slate-400">{selectedTranslator.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowAssignModal(true);
                    setAssignTranslatorUid(selectedTranslator.uid);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Assign Document
                </button>
              </div>

              {docsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : translatorDocs.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No documents currently assigned</p>
              ) : (
                <div className="space-y-2">
                  {translatorDocs.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-700/40 rounded-lg">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">{doc.studentName || 'Untitled'}</p>
                        <p className="text-xs text-slate-400">
                          {getFormTypeLabel(doc.formType)} · {doc.status} · {formatDate(doc.assignedAt || doc.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleUnassign(doc.id)}
                        disabled={actionLoading === doc.id}
                        className="ml-3 text-xs text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors flex-shrink-0"
                      >
                        {actionLoading === doc.id ? 'Removing...' : 'Unassign'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
              <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <p className="text-slate-400">Select a translator to view details</p>
            </div>
          )}

          {/* Document Queue */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Document Queue</h3>
              <select
                value={queueFilter}
                onChange={(e) => setQueueFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unassigned Only</option>
                <option value="all">All</option>
                <option value="pending_review">Pending Review</option>
                <option value="in_review">In Review</option>
                <option value="ai_completed">AI Completed</option>
              </select>
            </div>

            {filteredQueue.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No documents in queue</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">Student</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">Type</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-400 uppercase">Assigned To</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredQueue.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-white">{doc.studentName || 'Untitled'}</td>
                        <td className="px-4 py-3 text-sm text-slate-300">{getFormTypeLabel(doc.formType)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            doc.status === 'in_review' ? 'bg-yellow-500/10 text-yellow-400' :
                            doc.status === 'pending_review' ? 'bg-blue-500/10 text-blue-400' :
                            doc.status === 'ai_completed' ? 'bg-green-500/10 text-green-400' :
                            'bg-slate-500/10 text-slate-400'
                          }`}>
                            {doc.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-300">
                          {doc.assignedToName || (doc.assignedTo ? doc.assignedTo.slice(0, 8) + '...' : '—')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {doc.assignedTo ? (
                            <button
                              onClick={() => handleUnassign(doc.id)}
                              disabled={actionLoading === doc.id}
                              className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                            >
                              {actionLoading === doc.id ? '...' : 'Unassign'}
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setAssignDocId(doc.id);
                                setAssignTranslatorUid('');
                                setShowAssignModal(true);
                              }}
                              className="text-xs text-blue-400 hover:text-blue-300"
                            >
                              Assign
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Assign Document to Translator</h3>

            {!assignDocId && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Select Document</label>
                <select
                  value={assignDocId}
                  onChange={(e) => setAssignDocId(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a document...</option>
                  {queue.filter(d => !d.assignedTo).map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.studentName || doc.id.slice(0, 8)} — {getFormTypeLabel(doc.formType)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {!assignTranslatorUid && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">Select Translator</label>
                <select
                  value={assignTranslatorUid}
                  onChange={(e) => setAssignTranslatorUid(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a translator...</option>
                  {translators.filter(t => t.isActive).map((t) => (
                    <option key={t.uid} value={t.uid}>
                      {t.displayName || t.email} ({t.assignedCount} assigned)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {assignDocId && assignTranslatorUid && (
              <p className="text-sm text-slate-300 mb-4">
                Assign document <span className="font-medium text-white">{queue.find(d => d.id === assignDocId)?.studentName || assignDocId.slice(0, 12)}</span> to{' '}
                <span className="font-medium text-white">{translators.find(t => t.uid === assignTranslatorUid)?.displayName || translators.find(t => t.uid === assignTranslatorUid)?.email}</span>?
              </p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowAssignModal(false); setAssignDocId(''); setAssignTranslatorUid(''); }}
                className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!assignDocId || !assignTranslatorUid || !!actionLoading}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslatorsPage;
