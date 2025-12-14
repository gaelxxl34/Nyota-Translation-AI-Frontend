// WhatsApp Inbox Component for Support Dashboard
// Displays list of WhatsApp conversations with filtering and search

import React from 'react';
import type { Conversation, ConversationStats } from '../../hooks/useSupport';

interface WhatsAppInboxProps {
  conversations: Conversation[];
  stats: ConversationStats | null;
  loading: boolean;
  selectedId?: string;
  statusFilter: string;
  searchQuery: string;
  onStatusFilterChange: (status: string) => void;
  onSearchChange: (query: string) => void;
  onConversationSelect: (conversation: Conversation) => void;
  onAssignConversation: (conversationId: string) => void;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  resolved: 'bg-blue-500/20 text-blue-400',
  archived: 'bg-gray-500/20 text-gray-400',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  pending: 'Pending',
  resolved: 'Resolved',
  archived: 'Archived',
};

const WhatsAppInbox: React.FC<WhatsAppInboxProps> = ({
  conversations,
  stats,
  loading,
  selectedId,
  statusFilter,
  searchQuery,
  onStatusFilterChange,
  onSearchChange,
  onConversationSelect,
  onAssignConversation,
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
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
    <div className="flex flex-col h-full">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 p-4 border-b border-gray-700">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-400">Total</p>
            <p className="text-xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-green-500/10 rounded-lg p-3 text-center border border-green-500/30">
            <p className="text-xs text-green-400">Active</p>
            <p className="text-xl font-bold text-green-400">{stats.active}</p>
          </div>
          <div className="bg-yellow-500/10 rounded-lg p-3 text-center border border-yellow-500/30">
            <p className="text-xs text-yellow-400">Pending</p>
            <p className="text-xl font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-3 text-center border border-blue-500/30">
            <p className="text-xs text-blue-400">Resolved</p>
            <p className="text-xl font-bold text-blue-400">{stats.resolved}</p>
          </div>
          <div className="bg-red-500/10 rounded-lg p-3 text-center border border-red-500/30">
            <p className="text-xs text-red-400">Unread</p>
            <p className="text-xl font-bold text-red-400">{stats.withUnread}</p>
          </div>
          <div className="bg-purple-500/10 rounded-lg p-3 text-center border border-purple-500/30">
            <p className="text-xs text-purple-400">Today</p>
            <p className="text-xl font-bold text-purple-400">{stats.newToday}</p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="p-4 border-b border-gray-700 space-y-3">
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by phone or name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onStatusFilterChange('')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === ''
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => onStatusFilterChange('active')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => onStatusFilterChange('pending')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => onStatusFilterChange('resolved')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === 'resolved'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p>No conversations found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onConversationSelect(conversation)}
                className={`p-4 cursor-pointer transition-colors hover:bg-gray-800/50 ${
                  selectedId === conversation.id ? 'bg-gray-800 border-l-4 border-green-500' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Avatar and Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                        {conversation.displayName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      {conversation.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold">
                          {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white truncate">
                          {conversation.displayName}
                        </h4>
                        <span className={`px-2 py-0.5 rounded text-xs ${statusColors[conversation.status]}`}>
                          {statusLabels[conversation.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 truncate">{conversation.phoneNumber}</p>
                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {conversation.lastMessage}
                        </p>
                      )}
                      {conversation.linkedUserEmail && (
                        <p className="text-xs text-blue-400 truncate mt-1">
                          📧 {conversation.linkedUserEmail}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-gray-500">
                      {formatDate(conversation.lastMessageAt)}
                    </span>
                    {conversation.documentsSubmitted > 0 && (
                      <span className="text-xs text-purple-400">
                        📄 {conversation.documentsSubmitted} docs
                      </span>
                    )}
                    {conversation.assignedToName ? (
                      <span className="text-xs text-green-400">
                        👤 {conversation.assignedToName}
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAssignConversation(conversation.id);
                        }}
                        className="text-xs text-yellow-400 hover:text-yellow-300"
                      >
                        Assign to me
                      </button>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {conversation.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {conversation.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-gray-700 rounded text-xs text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppInbox;
