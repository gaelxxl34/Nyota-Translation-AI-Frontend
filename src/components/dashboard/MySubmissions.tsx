// MySubmissions Component — Shows user's bulletins (drafts) and certified document submissions
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../AuthProvider';
import { getMyCertifiedDocuments, getMyBulletins, deleteBulletin, getBulletinDeleteInfo, reuploadDocument, exportCertifiedPdf, exportDraftPdf } from '../../services/chatService';

interface CertifiedDoc {
  id: string;
  formType?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  status?: string;
  speedTier?: string;
  bulletinId?: string;
  certification?: {
    certificationId?: string;
    certifiedAt?: string;
  };
  originalData?: {
    studentName?: string;
    documentTitle?: string;
  };
  certifiedData?: {
    studentName?: string;
    documentTitle?: string;
  };
  review?: {
    rejectionReason?: string;
    rejectionType?: string;
    reviewedBy?: string;
    reviewedAt?: string;
  };
  createdAt?: string | { _seconds: number; _nanoseconds: number } | { seconds: number; nanoseconds: number };
  submittedAt?: string | { _seconds: number; _nanoseconds: number } | { seconds: number; nanoseconds: number };
}

interface BulletinDoc {
  id: string;
  formType: string;
  sourceLanguage: string;
  studentName: string;
  documentTitle: string | null;
  status: string;
  createdAt: string | { _seconds: number; _nanoseconds: number } | { seconds: number; nanoseconds: number } | null;
  hasStorageFile: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; labelFr: string; color: string; icon: string }> = {
  processed: { label: 'Draft', labelFr: 'Brouillon', color: 'bg-amber-100 text-amber-800', icon: '📝' },
  draft: { label: 'Draft', labelFr: 'Brouillon', color: 'bg-gray-100 text-gray-700', icon: '📝' },
  pending_review: { label: 'Pending Review', labelFr: 'En attente de révision', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  in_review: { label: 'In Review', labelFr: 'En cours de révision', color: 'bg-blue-100 text-blue-800', icon: '🔍' },
  certified: { label: 'Certified', labelFr: 'Certifié', color: 'bg-green-100 text-green-800', icon: '✅' },
  rejected: { label: 'Rejected', labelFr: 'Rejeté', color: 'bg-red-100 text-red-800', icon: '❌' },
  cancelled: { label: 'Cancelled', labelFr: 'Annulé', color: 'bg-gray-100 text-gray-500', icon: '🚫' },
};

const TIER_CONFIG: Record<string, { label: string; labelFr: string }> = {
  express: { label: 'Express (1-5 hours)', labelFr: 'Express (1-5 heures)' },
  rush: { label: 'Rush (up to 12h)', labelFr: 'Urgent (jusqu\'à 12h)' },
  standard: { label: 'Standard (up to 24h)', labelFr: 'Standard (jusqu\'à 24h)' },
};

interface MySubmissionsProps {
  onNavigate?: (page: string) => void;
  onContinueDraft?: (bulletinId: string) => void;
}

const MySubmissions: React.FC<MySubmissionsProps> = ({ onNavigate, onContinueDraft }) => {
  const { t, i18n } = useTranslation();
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState<CertifiedDoc[]>([]);
  const [bulletins, setBulletins] = useState<BulletinDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [reuploadingId, setReuploadingId] = useState<string | null>(null);
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    bulletinId: string;
    loading: boolean;
    hasStorageFile?: boolean;
    versionsCount?: number;
    paymentsCount?: number;
    invoicesCount?: number;
    linkedSubmissions?: Array<{
      id: string;
      status: string;
      formType: string;
      certificationId: string | null;
    }>;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocuments = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      setError(null);
      const idToken = await currentUser.getIdToken();

      const [certResult, bulletinResult] = await Promise.all([
        getMyCertifiedDocuments(idToken),
        getMyBulletins(idToken),
      ]);

      if (certResult.success && certResult.documents) {
        setDocuments(certResult.documents as unknown as CertifiedDoc[]);
      }
      if (bulletinResult.success && bulletinResult.bulletins) {
        setBulletins(bulletinResult.bulletins);
      }
      if (!certResult.success && !bulletinResult.success) {
        setError('Failed to load documents');
      }
    } catch {
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleDeleteClick = async (bulletinId: string) => {
    if (!currentUser) return;
    try {
      setDeleteDialog({ bulletinId, loading: true });
      const idToken = await currentUser.getIdToken();
      const info = await getBulletinDeleteInfo(idToken, bulletinId);
      if (info.success) {
        setDeleteDialog({
          bulletinId,
          loading: false,
          hasStorageFile: info.hasStorageFile,
          versionsCount: info.versionsCount,
          paymentsCount: info.paymentsCount,
          invoicesCount: info.invoicesCount,
          linkedSubmissions: info.linkedSubmissions,
        });
      } else {
        setDeleteDialog(null);
      }
    } catch {
      setDeleteDialog(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentUser || !deleteDialog) return;
    const { bulletinId, linkedSubmissions } = deleteDialog;
    try {
      setDeletingId(bulletinId);
      setDeleteDialog(null);
      const idToken = await currentUser.getIdToken();
      const result = await deleteBulletin(idToken, bulletinId);
      if (result.success) {
        setBulletins((prev) => prev.filter((b) => b.id !== bulletinId));
        // Also remove linked submissions from UI
        if (linkedSubmissions && linkedSubmissions.length > 0) {
          const linkedIds = new Set(linkedSubmissions.map((s) => s.id));
          setDocuments((prev) => prev.filter((d) => !linkedIds.has(d.id)));
        }
      }
    } catch {
      // silently fail
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewDraft = async (bulletinId: string) => {
    if (!currentUser) return;

    const newTab = window.open('about:blank', '_blank');
    if (newTab) {
      newTab.document.write('<html><head><title>Generating PDF...</title><style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8fafc;font-family:system-ui,-apple-system,sans-serif;color:#334155}div{text-align:center}.spinner{width:48px;height:48px;border:4px solid #e2e8f0;border-top-color:#3b82f6;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 24px}@keyframes spin{to{transform:rotate(360deg)}}h2{font-size:1.25rem;font-weight:600;margin:0 0 8px}p{font-size:.875rem;color:#64748b;margin:0}</style></head><body><div><div class="spinner"></div><h2>Generating draft PDF...</h2><p>This may take a moment. The document will appear here automatically.</p></div></body></html>');
      newTab.document.close();
    }

    try {
      setViewingId(bulletinId);
      setError(null);
      const idToken = await currentUser.getIdToken();
      const blob = await exportDraftPdf(idToken, bulletinId, window.location.origin);
      const url = URL.createObjectURL(blob);

      if (newTab && !newTab.closed) {
        newTab.location.href = url;
      } else {
        window.open(url, '_blank');
      }
    } catch (err) {
      if (newTab && !newTab.closed) newTab.close();
      setError(err instanceof Error ? err.message : 'Failed to open draft PDF');
    } finally {
      setViewingId(null);
    }
  };

  const handleViewCertified = async (docId: string) => {
    if (!currentUser) return;

    // Open tab synchronously (within user gesture) to avoid popup blocker
    const newTab = window.open('about:blank', '_blank');
    if (newTab) {
      newTab.document.write('<html><head><title>Generating PDF...</title><style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8fafc;font-family:system-ui,-apple-system,sans-serif;color:#334155}div{text-align:center}.spinner{width:48px;height:48px;border:4px solid #e2e8f0;border-top-color:#3b82f6;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 24px}@keyframes spin{to{transform:rotate(360deg)}}h2{font-size:1.25rem;font-weight:600;margin:0 0 8px}p{font-size:.875rem;color:#64748b;margin:0}</style></head><body><div><div class="spinner"></div><h2>Generating certified PDF...</h2><p>This may take a moment. The document will appear here automatically.</p></div></body></html>');
      newTab.document.close();
    }

    try {
      setViewingId(docId);
      setError(null);
      const idToken = await currentUser.getIdToken();
      const blob = await exportCertifiedPdf(idToken, docId);
      const url = URL.createObjectURL(blob);

      if (newTab && !newTab.closed) {
        newTab.location.href = url;
      } else {
        window.open(url, '_blank');
      }
    } catch (err) {
      if (newTab && !newTab.closed) newTab.close();
      setError(err instanceof Error ? err.message : 'Failed to open certified PDF');
    } finally {
      setViewingId(null);
    }
  };

  const handleReupload = async (docId: string, file: File) => {
    if (!currentUser) return;
    try {
      setReuploadingId(docId);
      const idToken = await currentUser.getIdToken();
      const result = await reuploadDocument(idToken, docId, file);
      if (result.success) {
        await loadDocuments();
        setExpandedDocId(null);
      }
    } catch {
      // silently fail
    } finally {
      setReuploadingId(null);
    }
  };

  const isFr = i18n.language === 'fr';

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
    const label = isFr ? config.labelFr : config.label;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <span>{config.icon}</span>
        {label}
      </span>
    );
  };

  const getTierLabel = (tier: string) => {
    const config = TIER_CONFIG[tier] || TIER_CONFIG.standard;
    return isFr ? config.labelFr : config.label;
  };

  const getDocTitle = (doc: CertifiedDoc) => {
    return doc.certifiedData?.documentTitle || doc.certifiedData?.studentName
      || doc.originalData?.documentTitle || doc.originalData?.studentName
      || doc.formType || 'Untitled';
  };

  const formatDate = (dateVal?: string | { _seconds: number; _nanoseconds: number } | { seconds: number; nanoseconds: number } | null) => {
    if (!dateVal) return '—';
    try {
      let d: Date;
      if (typeof dateVal === 'object' && ('_seconds' in dateVal || 'seconds' in dateVal)) {
        const secs = '_seconds' in dateVal ? dateVal._seconds : dateVal.seconds;
        d = new Date(secs * 1000);
      } else {
        d = new Date(dateVal as string);
      }
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString(isFr ? 'fr-FR' : 'en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch {
      return '—';
    }
  };

  const hasContent = documents.length > 0 || bulletins.length > 0;

  // Group submissions by their parent bulletin
  const submissionsByBulletin = new Map<string, CertifiedDoc[]>();
  const orphanedSubmissions: CertifiedDoc[] = [];
  for (const doc of documents) {
    if (doc.bulletinId) {
      const list = submissionsByBulletin.get(doc.bulletinId) || [];
      list.push(doc);
      submissionsByBulletin.set(doc.bulletinId, list);
    } else {
      orphanedSubmissions.push(doc);
    }
  }

  if (!hasContent && !loading && !error) {
    return (
      <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
        <p className="text-gray-500 text-sm mb-3">
          {isFr ? 'Aucun document pour le moment.' : 'No documents yet.'}
        </p>
        {onNavigate && (
          <button
            onClick={() => onNavigate('translate')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isFr ? 'Commencer une traduction' : 'Start a Translation'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          📋 {t('dashboard.submissions.title', 'My Documents')}
        </h2>
        {onNavigate && (
          <button
            onClick={() => onNavigate('translate')}
            className="sm:hidden inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('dashboard.navigation.newTranslation', 'New Translation')}
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-gray-100 p-4 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-200 rounded-lg" />
                  <div>
                    <div className="h-4 w-32 bg-gray-200 rounded mb-1.5" />
                    <div className="h-3 w-20 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="h-5 w-16 bg-gray-200 rounded-full" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-24 bg-gray-100 rounded" />
                <div className="h-3 w-16 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-6">
          <p className="text-red-600 text-sm mb-3">{error}</p>
          <button onClick={loadDocuments} className="text-blue-600 hover:underline text-sm">
            {t('verification.error.tryAgain', 'Try Again')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Bulletins with nested submissions */}
          {bulletins.map((b) => {
            const linkedDocs = submissionsByBulletin.get(b.id) || [];
            return (
            <div key={b.id} className="rounded-lg border border-gray-100 hover:bg-gray-50/50 transition-colors overflow-hidden">
              <div className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm truncate">
                    {b.documentTitle || b.studentName}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-gray-500">
                    <span>{b.sourceLanguage.toUpperCase()} → EN</span>
                    <span>·</span>
                    <span>{formatDate(b.createdAt)}</span>
                  </div>
                </div>
                {getStatusBadge(b.status)}
              </div>
              <div className="flex items-center gap-2 mt-2.5">
                <button
                  onClick={() => handleViewDraft(b.id)}
                  disabled={viewingId === b.id}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
                >
                  {viewingId === b.id ? (
                    <div className="animate-spin h-3.5 w-3.5 border-2 border-green-400 border-t-transparent rounded-full" />
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                  {viewingId === b.id ? (isFr ? 'Génération...' : 'Generating...') : (isFr ? 'Voir PDF' : 'View PDF')}
                </button>
                {onContinueDraft && (
                  <button
                    onClick={() => onContinueDraft(b.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                  >
                    ▶ {isFr ? 'Continuer' : 'Continue'}
                  </button>
                )}
                <button
                  onClick={() => handleDeleteClick(b.id)}
                  disabled={deletingId === b.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                  title={isFr ? 'Supprimer' : 'Delete'}
                >
                  {deletingId === b.id ? (
                    <div className="animate-spin h-3.5 w-3.5 border-2 border-red-400 border-t-transparent rounded-full" />
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>
              </div>
              </div>

              {/* Linked submissions nested under draft */}
              {linkedDocs.length > 0 && (
                <div className="border-t border-gray-100 bg-gray-50/50">
                  {linkedDocs.map((doc) => (
                    <div key={doc.id} className="px-3 py-2.5 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {getStatusBadge(doc.status || 'draft')}
                          <span className="text-xs text-gray-500">
                            {getTierLabel(doc.speedTier || 'standard')}
                          </span>
                          <span className="text-xs text-gray-400">·</span>
                          <span className="text-xs text-gray-500">{formatDate(doc.submittedAt || doc.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {doc.status === 'certified' && (
                            <>
                              <button
                                onClick={() => handleViewCertified(doc.id)}
                                disabled={viewingId === doc.id}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
                              >
                                {viewingId === doc.id ? (
                                  <div className="animate-spin h-3 w-3 border-2 border-green-400 border-t-transparent rounded-full" />
                                ) : (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                )}
                                {viewingId === doc.id ? '...' : (isFr ? 'Voir' : 'View')}
                              </button>
                              {doc.certification?.certificationId && (
                                <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">{doc.certification.certificationId}</span>
                              )}
                            </>
                          )}
                          {doc.status === 'rejected' && (
                            <button
                              onClick={() => setExpandedDocId(expandedDocId === doc.id ? null : doc.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-md text-xs font-medium hover:bg-red-100 transition-colors"
                            >
                              <svg className={`w-3 h-3 transition-transform ${expandedDocId === doc.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                              {isFr ? 'Détails' : 'Details'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded rejection details + re-upload */}
                      {doc.status === 'rejected' && expandedDocId === doc.id && (
                        <div className="mt-2.5 p-3 bg-red-50/80 rounded-lg">
                          <div className="mb-3">
                            <p className="text-xs font-medium text-red-800 mb-1">
                              {isFr ? 'Raison du rejet' : 'Rejection Reason'}
                            </p>
                            <p className="text-sm text-red-700 bg-white rounded-lg p-2.5 border border-red-200">
                              {doc.review?.rejectionReason || (isFr ? 'Pas de raison fournie' : 'No reason provided')}
                            </p>
                            {doc.review?.rejectionType && (
                              <span className="inline-block mt-1.5 px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs">
                                {doc.review.rejectionType}
                              </span>
                            )}
                          </div>
                          <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-200">
                            <p className="text-xs font-medium text-amber-800 mb-1.5">
                              {isFr
                                ? '📤 Télécharger une meilleure copie'
                                : '📤 Upload a better copy'}
                            </p>
                            <p className="text-xs text-amber-700 mb-2">
                              {isFr
                                ? 'Téléchargez une image plus claire. Elle remplacera l\'originale sans retraitement IA.'
                                : 'Upload a clearer image. It will replace the original without AI reprocessing.'}
                            </p>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/jpeg,image/png,image/webp,application/pdf"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleReupload(doc.id, file);
                                e.target.value = '';
                              }}
                            />
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              disabled={reuploadingId === doc.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                            >
                              {reuploadingId === doc.id ? (
                                <>
                                  <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />
                                  {isFr ? 'Envoi...' : 'Uploading...'}
                                </>
                              ) : (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                  </svg>
                                  {isFr ? 'Choisir un fichier' : 'Choose File'}
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            );
          })}

          {/* Orphaned submissions (no matching draft) */}
          {orphanedSubmissions.length > 0 && (
            <>
              {bulletins.length > 0 && (
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                    {isFr ? 'Autres soumissions' : 'Other Submissions'}
                  </p>
                </div>
              )}
              {orphanedSubmissions.map((doc) => (
                <div key={doc.id} className="rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors overflow-hidden">
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">{getDocTitle(doc)}</div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-gray-500">
                          <span>{(doc.sourceLanguage || 'fr').toUpperCase()} → {(doc.targetLanguage || 'en').toUpperCase()}</span>
                          <span>·</span>
                          <span>{getTierLabel(doc.speedTier || 'standard')}</span>
                          <span>·</span>
                          <span>{formatDate(doc.submittedAt || doc.createdAt)}</span>
                        </div>
                      </div>
                      {getStatusBadge(doc.status || 'draft')}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      {doc.status === 'certified' && (
                        <button
                          onClick={() => handleViewCertified(doc.id)}
                          disabled={viewingId === doc.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                          {viewingId === doc.id ? (
                            <div className="animate-spin h-3.5 w-3.5 border-2 border-green-400 border-t-transparent rounded-full" />
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                          {viewingId === doc.id ? (isFr ? 'Génération...' : 'Generating...') : (isFr ? 'Voir' : 'View')}
                        </button>
                      )}
                      {doc.status === 'rejected' && (
                        <button
                          onClick={() => setExpandedDocId(expandedDocId === doc.id ? null : doc.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors"
                        >
                          <svg className={`w-3.5 h-3.5 transition-transform ${expandedDocId === doc.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          {isFr ? 'Détails' : 'Details'}
                        </button>
                      )}
                      {doc.status === 'certified' && doc.certification?.certificationId && (
                        <span className="text-xs text-gray-400 font-mono">{doc.certification.certificationId}</span>
                      )}
                    </div>
                  </div>
                  {doc.status === 'rejected' && expandedDocId === doc.id && (
                    <div className="border-t border-gray-100 p-4 bg-red-50/50">
                      <div className="mb-3">
                        <p className="text-xs font-medium text-red-800 mb-1">
                          {isFr ? 'Raison du rejet' : 'Rejection Reason'}
                        </p>
                        <p className="text-sm text-red-700 bg-white rounded-lg p-3 border border-red-200">
                          {doc.review?.rejectionReason || (isFr ? 'Pas de raison fournie' : 'No reason provided')}
                        </p>
                        {doc.review?.rejectionType && (
                          <span className="inline-block mt-1.5 px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs">
                            {doc.review.rejectionType}
                          </span>
                        )}
                      </div>
                      <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                        <p className="text-xs font-medium text-amber-800 mb-2">
                          {isFr
                            ? '📤 Télécharger une meilleure copie de l\'original'
                            : '📤 Upload a better copy of the original'}
                        </p>
                        <p className="text-xs text-amber-700 mb-3">
                          {isFr
                            ? 'Téléchargez une image plus claire et lisible. Elle remplacera l\'image originale sans avoir à repasser par le traitement IA.'
                            : 'Upload a clearer, more visible image. It will replace the original without needing AI processing again.'}
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleReupload(doc.id, file);
                            e.target.value = '';
                          }}
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={reuploadingId === doc.id}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                        >
                          {reuploadingId === doc.id ? (
                            <>
                              <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                              {isFr ? 'Envoi en cours...' : 'Uploading...'}
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              {isFr ? 'Choisir un fichier' : 'Choose File'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      {deleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-red-50 px-6 py-4 border-b border-red-100">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-red-900">
                  {isFr ? 'Supprimer le document' : 'Delete Document'}
                </h3>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {deleteDialog.loading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600" />
                  <span className="ml-3 text-gray-500 text-sm">{isFr ? 'Vérification...' : 'Checking...'}</span>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-700 mb-4">
                    {isFr
                      ? 'Cette action est irréversible. Les éléments suivants seront définitivement supprimés :'
                      : 'This action is irreversible. The following will be permanently deleted:'}
                  </p>

                  <ul className="space-y-2 mb-4">
                    {/* Draft document */}
                    <li className="flex items-start gap-2 text-sm">
                      <span className="text-red-500 mt-0.5">✕</span>
                      <span className="text-gray-700">
                        {isFr ? 'Le brouillon et les données extraites par l\'IA' : 'The draft and AI-extracted data'}
                      </span>
                    </li>

                    {/* Uploaded file */}
                    {deleteDialog.hasStorageFile && (
                      <li className="flex items-start gap-2 text-sm">
                        <span className="text-red-500 mt-0.5">✕</span>
                        <span className="text-gray-700">
                          {isFr ? 'Le fichier original téléchargé' : 'The original uploaded file'}
                        </span>
                      </li>
                    )}

                    {/* Translation history */}
                    {(deleteDialog.versionsCount ?? 0) > 0 && (
                      <li className="flex items-start gap-2 text-sm">
                        <span className="text-red-500 mt-0.5">✕</span>
                        <span className="text-gray-700">
                          {isFr
                            ? `${deleteDialog.versionsCount} version(s) de l'historique de traduction`
                            : `${deleteDialog.versionsCount} translation history version(s)`}
                        </span>
                      </li>
                    )}

                    {/* Linked submissions */}
                    {deleteDialog.linkedSubmissions && deleteDialog.linkedSubmissions.length > 0 && (
                      <>
                        <li className="flex items-start gap-2 text-sm">
                          <span className="text-red-500 mt-0.5">✕</span>
                          <span className="text-gray-700 font-medium">
                            {isFr
                              ? `${deleteDialog.linkedSubmissions.length} soumission(s) pour certification :`
                              : `${deleteDialog.linkedSubmissions.length} certification submission(s):`}
                          </span>
                        </li>
                        {deleteDialog.linkedSubmissions.map((sub) => {
                          const statusConf = STATUS_CONFIG[sub.status] || STATUS_CONFIG.draft;
                          const statusLabel = isFr ? statusConf.labelFr : statusConf.label;
                          return (
                            <li key={sub.id} className="ml-6 flex items-center gap-2 text-xs">
                              <span>{statusConf.icon}</span>
                              <span className="text-gray-600">
                                {sub.formType || 'Document'} — <span className="font-medium">{statusLabel}</span>
                                {sub.certificationId && (
                                  <span className="text-gray-400 font-mono ml-1">({sub.certificationId})</span>
                                )}
                              </span>
                            </li>
                          );
                        })}
                        {deleteDialog.linkedSubmissions.some((s) => s.status === 'certified') && (
                          <li className="ml-6 flex items-start gap-2 text-xs">
                            <span className="text-red-500 mt-0.5">✕</span>
                            <span className="text-red-700 font-medium">
                              {isFr
                                ? 'Les PDF certifiés et les identifiants de certification seront supprimés'
                                : 'Certified PDFs and certification IDs will be deleted'}
                            </span>
                          </li>
                        )}
                        {deleteDialog.linkedSubmissions.some((s) => s.status === 'pending_review' || s.status === 'in_review') && (
                          <li className="ml-6 flex items-start gap-2 text-xs bg-amber-50 border border-amber-200 rounded-lg p-2 mt-1">
                            <span className="text-amber-500 mt-0.5">⚠️</span>
                            <span className="text-amber-800">
                              {isFr
                                ? 'Des soumissions sont en cours de traitement. Elles seront annulées.'
                                : 'Some submissions are still being processed. They will be cancelled.'}
                            </span>
                          </li>
                        )}
                      </>
                    )}

                    {/* Payments & Invoices */}
                    {((deleteDialog.paymentsCount ?? 0) > 0 || (deleteDialog.invoicesCount ?? 0) > 0) && (
                      <li className="flex items-start gap-2 text-sm">
                        <span className="text-red-500 mt-0.5">✕</span>
                        <span className="text-gray-700">
                          {isFr
                            ? `${deleteDialog.paymentsCount || 0} transaction(s) et ${deleteDialog.invoicesCount || 0} facture(s)`
                            : `${deleteDialog.paymentsCount || 0} payment transaction(s) and ${deleteDialog.invoicesCount || 0} invoice(s)`}
                        </span>
                      </li>
                    )}
                  </ul>
                </>
              )}
            </div>

            {/* Footer */}
            {!deleteDialog.loading && (
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  onClick={() => setDeleteDialog(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {isFr ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  {isFr ? 'Supprimer définitivement' : 'Delete Permanently'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MySubmissions;
