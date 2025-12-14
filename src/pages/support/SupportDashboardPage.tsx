// Support Dashboard Page for NTC
// Main interface for support agents to manage WhatsApp conversations

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../AuthProvider';
import { RoleGuard } from '../../components/admin';
import { useUserRole } from '../../hooks/useAdmin';
import { WhatsAppInbox, ConversationView, SupportStats } from '../../components/support';
import {
  useConversations,
  useConversationDetail,
  useUserLookup,
  useSupportStats,
  useMessageTemplates,
  type Conversation,
} from '../../hooks/useSupport';

type SupportPage = 'inbox' | 'conversation' | 'stats';

const SupportDashboardPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { userRole } = useUserRole();
  const [currentPage, setCurrentPage] = useState<SupportPage>('inbox');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statsPeriod, setStatsPeriod] = useState<'day' | 'week' | 'month' | 'year' | 'all'>('month');
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hooks
  const {
    conversations,
    stats: conversationStats,
    loading: conversationsLoading,
    fetchConversations,
    fetchStats: fetchConversationStats,
    assignConversation,
    updateStatus,
  } = useConversations();

  const {
    conversation: conversationDetail,
    messages,
    loading: conversationLoading,
    sending,
    fetchConversation,
    sendMessage,
    addNote,
    sendDocument,
  } = useConversationDetail();

  const {
    documents: userDocuments,
    fetchUserDocuments,
  } = useUserLookup();

  const {
    stats: supportStats,
    teamStats,
    agents,
    loading: statsLoading,
    fetchStats: fetchSupportStats,
    fetchTeamStats,
  } = useSupportStats();

  const {
    templates,
    fetchTemplates,
  } = useMessageTemplates();

  // Fetch initial data
  useEffect(() => {
    fetchConversations();
    fetchConversationStats();
    fetchTemplates();
  }, [fetchConversations, fetchConversationStats, fetchTemplates]);

  // Fetch based on filters
  useEffect(() => {
    if (currentPage === 'inbox') {
      fetchConversations({
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      });
    } else if (currentPage === 'stats') {
      fetchSupportStats(statsPeriod);
      if (userRole === 'superadmin') {
        fetchTeamStats();
      }
    }
  }, [currentPage, statusFilter, searchQuery, statsPeriod, userRole, fetchConversations, fetchSupportStats, fetchTeamStats]);

  // Handle conversation selection
  const handleConversationSelect = useCallback(
    async (conv: Conversation) => {
      setSelectedConversation(conv);
      await fetchConversation(conv.id);
      setMobileShowChat(true);
    },
    [fetchConversation]
  );

  // Handle assign conversation
  const handleAssignConversation = useCallback(
    async (conversationId: string) => {
      const success = await assignConversation(conversationId);
      if (success) {
        fetchConversationStats();
      }
    },
    [assignConversation, fetchConversationStats]
  );

  // Handle send message
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!selectedConversation) return;
      await sendMessage(selectedConversation.id, content);
    },
    [selectedConversation, sendMessage]
  );

  // Handle send document
  const handleSendDocument = useCallback(
    async (documentId: string, message?: string) => {
      if (!selectedConversation) return;
      await sendDocument(selectedConversation.id, documentId, message);
    },
    [selectedConversation, sendDocument]
  );

  // Handle update status
  const handleUpdateStatus = useCallback(
    async (status: 'active' | 'pending' | 'resolved' | 'archived', note?: string) => {
      if (!selectedConversation) return;
      const success = await updateStatus(selectedConversation.id, status, note);
      if (success) {
        // Refresh conversation detail
        await fetchConversation(selectedConversation.id);
      }
    },
    [selectedConversation, updateStatus, fetchConversation]
  );

  // Handle add note
  const handleAddNote = useCallback(
    async (note: string) => {
      if (!selectedConversation) return;
      await addNote(selectedConversation.id, note);
    },
    [selectedConversation, addNote]
  );

  // Handle back from conversation
  const handleBackFromChat = useCallback(() => {
    setMobileShowChat(false);
  }, []);

  // Handle search user documents
  const handleSearchUserDocuments = useCallback(
    async (userId: string) => {
      await fetchUserDocuments(userId, { status: 'approved' });
    },
    [fetchUserDocuments]
  );

  // Handle logout
  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  // Sidebar navigation items
  const navItems = [
    {
      id: 'inbox' as const,
      label: 'Inbox',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
      badge: conversationStats?.withUnread,
    },
    {
      id: 'stats' as const,
      label: 'My Stats',
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
    <RoleGuard allowedRoles={['support', 'superadmin']}>
      <div className="min-h-screen bg-[#0B1120] flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-gray-900 border-r border-gray-800">
          {/* Logo */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-white">Support Center</h1>
                <p className="text-xs text-gray-400">NTC WhatsApp</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  currentPage === item.id
                    ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      currentPage === item.id ? 'bg-white/20' : 'bg-red-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
                {currentUser?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {currentUser?.displayName || currentUser?.email}
                </p>
                <p className="text-xs text-green-400 capitalize">{userRole}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
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
            {/* Empty div for flex spacing */}
            <div className="w-10" />
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/50 z-[60]" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* Mobile Sidebar */}
        <aside className={`
          lg:hidden fixed top-0 left-0 bottom-0 z-[70]
          w-64 bg-gray-900 border-r border-gray-800 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* Mobile Sidebar Header */}
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-white">Support Center</h1>
                <p className="text-xs text-gray-400">NTC WhatsApp</p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
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
                onClick={() => { setCurrentPage(item.id); setMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  currentPage === item.id
                    ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    currentPage === item.id ? 'bg-white/20' : 'bg-red-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
                {currentUser?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {currentUser?.displayName || currentUser?.email}
                </p>
                <p className="text-xs text-green-400 capitalize">{userRole}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:flex overflow-hidden pt-[72px] lg:pt-0">
          {currentPage === 'stats' ? (
            <div className="flex-1 overflow-y-auto p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Performance Statistics</h2>
              <SupportStats
                stats={supportStats}
                teamStats={teamStats}
                agents={agents}
                loading={statsLoading}
                period={statsPeriod}
                onPeriodChange={setStatsPeriod}
                isAdmin={userRole === 'superadmin'}
              />
            </div>
          ) : (
            <>
              {/* Inbox Panel */}
              <div
                className={`w-full lg:w-96 xl:w-[420px] border-r border-gray-800 bg-gray-900/50 flex flex-col ${
                  mobileShowChat ? 'hidden lg:flex' : 'flex'
                }`}
              >
                <div className="p-4 border-b border-gray-800">
                  <h2 className="text-xl font-bold text-white">WhatsApp Inbox</h2>
                </div>
                <div className="flex-1 overflow-hidden">
                  <WhatsAppInbox
                    conversations={conversations}
                    stats={conversationStats}
                    loading={conversationsLoading}
                    selectedId={selectedConversation?.id}
                    statusFilter={statusFilter}
                    searchQuery={searchQuery}
                    onStatusFilterChange={setStatusFilter}
                    onSearchChange={setSearchQuery}
                    onConversationSelect={handleConversationSelect}
                    onAssignConversation={handleAssignConversation}
                  />
                </div>
              </div>

              {/* Conversation Panel */}
              <div
                className={`flex-1 bg-gray-900/30 ${
                  mobileShowChat ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'
                }`}
              >
                <ConversationView
                  conversation={conversationDetail}
                  messages={messages}
                  templates={templates}
                  userDocuments={userDocuments}
                  loading={conversationLoading}
                  sending={sending}
                  onSendMessage={handleSendMessage}
                  onSendDocument={handleSendDocument}
                  onUpdateStatus={handleUpdateStatus}
                  onAddNote={handleAddNote}
                  onBack={handleBackFromChat}
                  onSearchUserDocuments={handleSearchUserDocuments}
                />
              </div>
            </>
          )}
        </main>
      </div>
    </RoleGuard>
  );
};

export default SupportDashboardPage;
