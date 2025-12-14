// Translator Dashboard Page for NTC
// Main interface for translators to review and approve documents

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../AuthProvider';
import { RoleGuard } from '../../components/admin';
import { DocumentQueue, DocumentReview, TranslatorStats } from '../../components/translator';
import {
  useDocumentQueue,
  useDocumentReview,
  useTranslatorStats,
  useTranslatorNotifications,
  type QueueDocument,
} from '../../hooks/useTranslator';

type TranslatorPage = 'queue' | 'assigned' | 'review' | 'stats';

const TranslatorDashboardPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<TranslatorPage>('queue');
  const [selectedDocument, setSelectedDocument] = useState<QueueDocument | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [statsPeriod, setStatsPeriod] = useState('month');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hooks
  const {
    documents: queueDocuments,
    stats: queueStats,
    loading: queueLoading,
    fetchQueue,
    fetchStats: fetchQueueStats,
    fetchAssigned,
  } = useDocumentQueue();

  const {
    document: reviewDocument,
    revisions,
    loading: reviewLoading,
    saving,
    error: reviewError,
    fetchDocument,
    claimDocument,
    releaseDocument,
    updateDocument,
    approveDocument,
    rejectDocument,
    clearDocument,
  } = useDocumentReview();

  const {
    stats: translatorStats,
    leaderboard,
    loading: statsLoading,
    fetchStats: fetchTranslatorStats,
    fetchLeaderboard,
  } = useTranslatorStats();

  const {
    notifications: _notifications,
    unreadCount,
    fetchNotifications,
    markAsRead: _markAsRead,
    markAllAsRead: _markAllAsRead,
  } = useTranslatorNotifications();

  // Fetch initial data
  useEffect(() => {
    fetchQueue();
    fetchQueueStats();
    fetchNotifications();
  }, [fetchQueue, fetchQueueStats, fetchNotifications]);

  // Fetch based on current page
  useEffect(() => {
    if (currentPage === 'queue') {
      fetchQueue(statusFilter ? { status: statusFilter } : undefined);
    } else if (currentPage === 'assigned') {
      fetchAssigned();
    } else if (currentPage === 'stats') {
      fetchTranslatorStats(statsPeriod as 'day' | 'week' | 'month' | 'year' | 'all');
      fetchLeaderboard();
    }
  }, [currentPage, statusFilter, statsPeriod, fetchQueue, fetchAssigned, fetchTranslatorStats, fetchLeaderboard]);

  // Handle document selection
  const handleDocumentSelect = useCallback(
    async (doc: QueueDocument) => {
      setSelectedDocument(doc);
      await fetchDocument(doc.id);
      setCurrentPage('review');
    },
    [fetchDocument]
  );

  // Handle claim document
  const handleClaimDocument = useCallback(
    async (docId: string) => {
      const success = await claimDocument(docId);
      if (success) {
        fetchQueue();
        fetchQueueStats();
      }
    },
    [claimDocument, fetchQueue, fetchQueueStats]
  );

  // Handle back from review
  const handleBackFromReview = useCallback(() => {
    clearDocument();
    setSelectedDocument(null);
    setCurrentPage('queue');
    fetchQueue();
    fetchQueueStats();
  }, [clearDocument, fetchQueue, fetchQueueStats]);

  // Handle save draft
  const handleSaveDraft = useCallback(
    async (translatedData: Record<string, unknown>, reviewNotes: string) => {
      if (!selectedDocument) return;
      await updateDocument(selectedDocument.id, { translatedData, reviewNotes });
    },
    [selectedDocument, updateDocument]
  );

  // Handle approve
  const handleApprove = useCallback(
    async (finalNotes?: string) => {
      if (!selectedDocument) return;
      const success = await approveDocument(selectedDocument.id, finalNotes);
      if (success) {
        handleBackFromReview();
      }
    },
    [selectedDocument, approveDocument, handleBackFromReview]
  );

  // Handle reject
  const handleReject = useCallback(
    async (reason: string, rejectionType: string) => {
      if (!selectedDocument) return;
      const success = await rejectDocument(
        selectedDocument.id,
        reason,
        rejectionType as 'quality' | 'illegible' | 'incomplete' | 'wrong_format'
      );
      if (success) {
        handleBackFromReview();
      }
    },
    [selectedDocument, rejectDocument, handleBackFromReview]
  );

  // Handle release
  const handleRelease = useCallback(
    async (reason?: string) => {
      if (!selectedDocument) return;
      const success = await releaseDocument(selectedDocument.id, reason);
      if (success) {
        handleBackFromReview();
      }
    },
    [selectedDocument, releaseDocument, handleBackFromReview]
  );

  // Handle logout
  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  // Sidebar navigation items
  const navItems = [
    {
      id: 'queue' as const,
      label: 'Document Queue',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      badge: queueStats?.totalInQueue,
    },
    {
      id: 'assigned' as const,
      label: 'My Assigned',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
    },
    {
      id: 'stats' as const,
      label: 'My Statistics',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
  ];

  return (
    <RoleGuard allowedRoles={['superadmin', 'translator']}>
      <div className="min-h-screen bg-gray-900 lg:flex">
        {/* Mobile Header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            <img src="/logo-wide.png" alt="NTC" className="h-8 object-contain" />
            <div className="relative">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/50 z-[60]" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-0 left-0 z-[70] lg:z-auto h-screen
          w-64 bg-gray-800 border-r border-gray-700 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Logo / Header */}
          <div className="p-6 border-b border-gray-700 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">NTC Translator</h1>
              <p className="text-gray-400 text-sm mt-1">Translation Portal</p>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (currentPage === 'review') {
                    handleBackFromReview();
                  }
                  setCurrentPage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  currentPage === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {currentUser?.email?.charAt(0).toUpperCase() || 'T'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {currentUser?.displayName || currentUser?.email}
                </p>
                <p className="text-gray-400 text-xs">Translator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto pt-[72px] lg:pt-0">
          {/* Desktop Header */}
          <header className="hidden lg:block bg-gray-800 border-b border-gray-700 px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {currentPage === 'queue' && 'Document Queue'}
                  {currentPage === 'assigned' && 'My Assigned Documents'}
                  {currentPage === 'review' && 'Document Review'}
                  {currentPage === 'stats' && 'My Statistics'}
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  {currentPage === 'queue' && 'Review and approve pending translations'}
                  {currentPage === 'assigned' && 'Documents you are currently working on'}
                  {currentPage === 'review' && 'Review, edit, and approve this document'}
                  {currentPage === 'stats' && 'Your performance metrics and leaderboard'}
                </p>
              </div>
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => fetchNotifications()}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors relative"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* Mobile Page Title */}
          <div className="lg:hidden px-4 py-3 bg-gray-800/50">
            <h2 className="text-lg font-bold text-white">
              {currentPage === 'queue' && 'Document Queue'}
              {currentPage === 'assigned' && 'My Assigned'}
              {currentPage === 'review' && 'Document Review'}
              {currentPage === 'stats' && 'My Statistics'}
            </h2>
          </div>

          {/* Page Content */}
          <div className="p-4 lg:p-8">
            {/* Error Display */}
            {reviewError && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
                {reviewError}
              </div>
            )}

            {/* Queue Page */}
            {(currentPage === 'queue' || currentPage === 'assigned') && (
              <DocumentQueue
                documents={queueDocuments}
                stats={queueStats}
                loading={queueLoading}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                onDocumentSelect={handleDocumentSelect}
                onClaimDocument={handleClaimDocument}
              />
            )}

            {/* Review Page */}
            {currentPage === 'review' && reviewDocument && (
              <DocumentReview
                document={reviewDocument}
                revisions={revisions}
                saving={saving}
                onSave={handleSaveDraft}
                onApprove={handleApprove}
                onReject={handleReject}
                onRelease={handleRelease}
                onBack={handleBackFromReview}
              />
            )}

            {/* Loading state for review */}
            {currentPage === 'review' && reviewLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </div>
            )}

            {/* Stats Page */}
            {currentPage === 'stats' && (
              <TranslatorStats
                stats={translatorStats}
                leaderboard={leaderboard}
                loading={statsLoading}
                selectedPeriod={statsPeriod}
                onPeriodChange={setStatsPeriod}
                currentUserId={currentUser?.uid}
              />
            )}
          </div>
        </main>
      </div>
    </RoleGuard>
  );
};

export default TranslatorDashboardPage;
