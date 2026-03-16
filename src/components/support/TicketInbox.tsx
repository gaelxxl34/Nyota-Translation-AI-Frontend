// Ticket Inbox component for Support Agents
// Shows support tickets submitted by users with filtering, assignment, and management

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../AuthProvider';
import {
  useTickets,
  useTicketDetail,
  type SupportTicket,
  type TicketStatus,
} from '../../hooks/useSupport';

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  in_progress: { label: 'In Progress', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  resolved: { label: 'Resolved', className: 'bg-green-50 text-green-700 border border-green-200' },
  closed: { label: 'Closed', className: 'bg-gray-100 text-gray-500 border border-gray-200' },
};

const PRIORITY_BADGE: Record<string, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-green-50 text-green-700' },
  medium: { label: 'Medium', className: 'bg-blue-50 text-blue-700' },
  high: { label: 'High', className: 'bg-orange-50 text-orange-700' },
  urgent: { label: 'Urgent', className: 'bg-red-50 text-red-700' },
};

const CATEGORY_LABELS: Record<string, string> = {
  document_issue: 'Document Issue',
  account_issue: 'Account Issue',
  payment_issue: 'Payment Issue',
  translation_quality: 'Translation Quality',
  technical_issue: 'Technical Issue',
  general_inquiry: 'General Inquiry',
  other: 'Other',
};

const TicketInbox: React.FC = () => {
  useAuth(); // ensure authenticated
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    tickets,
    stats: ticketStats,
    loading: ticketsLoading,
    fetchTickets,
    assignTicket,
    updateTicketStatus,
  } = useTickets();

  const {
    ticket: ticketDetail,
    messages: ticketMessages,
    loading: detailLoading,
    sending,
    fetchTicket,
    replyToTicket,
  } = useTicketDetail();

  // Fetch tickets on mount and filter change
  useEffect(() => {
    fetchTickets(statusFilter ? { status: statusFilter } : undefined);
  }, [fetchTickets, statusFilter]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticketMessages]);

  const handleSelectTicket = useCallback(
    async (ticket: SupportTicket) => {
      setSelectedTicket(ticket);
      await fetchTicket(ticket.id);
    },
    [fetchTicket]
  );

  const handleAssign = useCallback(
    async (ticketId: string) => {
      const success = await assignTicket(ticketId);
      if (success && selectedTicket?.id === ticketId) {
        await fetchTicket(ticketId);
      }
    },
    [assignTicket, selectedTicket, fetchTicket]
  );

  const handleStatusChange = useCallback(
    async (ticketId: string, status: TicketStatus) => {
      const success = await updateTicketStatus(ticketId, status);
      if (success && selectedTicket?.id === ticketId) {
        await fetchTicket(ticketId);
      }
      setStatusMenuOpen(false);
    },
    [updateTicketStatus, selectedTicket, fetchTicket]
  );

  const handleReply = async () => {
    if (!replyContent.trim() || !selectedTicket) return;
    const success = await replyToTicket(selectedTicket.id, replyContent.trim());
    if (success) {
      setReplyContent('');
      fetchTickets(statusFilter ? { status: statusFilter } : undefined);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <div className="flex h-full">
      {/* Ticket List Panel */}
      <div className={`w-full lg:w-96 xl:w-[420px] border-r border-gray-200 bg-white flex flex-col ${selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
        {/* Stats */}
        {ticketStats && (
          <div className="p-4 border-b border-gray-100">
            <div className="flex gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-400">Total</span>
                <span className="text-sm font-bold text-gray-900">{ticketStats.total}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-xs text-gray-400">Open</span>
                <span className="text-sm font-bold text-blue-600">{ticketStats.open}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs text-gray-400">In Progress</span>
                <span className="text-sm font-bold text-amber-600">{ticketStats.inProgress}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-gray-400">Resolved</span>
                <span className="text-sm font-bold text-green-600">{ticketStats.resolved}</span>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex gap-1.5 flex-wrap">
            {[
              { value: '', label: 'All' },
              { value: 'open', label: 'Open' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'resolved', label: 'Resolved' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === f.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket List */}
        <div className="flex-1 overflow-y-auto">
          {ticketsLoading ? (
            <div className="space-y-2 p-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
                      <div className="h-3 w-1/2 bg-gray-100 rounded mb-2" />
                      <div className="flex gap-2">
                        <div className="h-5 w-14 bg-gray-200 rounded" />
                        <div className="h-5 w-14 bg-gray-100 rounded" />
                      </div>
                    </div>
                    <div className="h-3 w-8 bg-gray-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 px-4">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-400 text-sm">No tickets found</p>
            </div>
          ) : (
            tickets.map((ticket) => {
              const isSelected = selectedTicket?.id === ticket.id;
              const status = STATUS_BADGE[ticket.status] || STATUS_BADGE.open;
              const priority = PRIORITY_BADGE[ticket.priority] || PRIORITY_BADGE.medium;
              return (
                <button
                  key={ticket.id}
                  onClick={() => handleSelectTicket(ticket)}
                  className={`w-full text-left p-4 border-b border-gray-100 transition-colors ${
                    isSelected
                      ? 'bg-blue-50 border-l-2 border-l-blue-500'
                      : 'hover:bg-gray-50 border-l-2 border-l-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{ticket.subject}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {ticket.userName} ({ticket.userEmail})
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${status.className}`}>
                          {status.label}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${priority.className}`}>
                          {priority.label}
                        </span>
                        {!ticket.assignedTo && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-600 border border-red-200">
                            Unassigned
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] text-gray-400">
                        {ticket.lastMessageAt ? formatRelativeTime(ticket.lastMessageAt) : ''}
                      </p>
                      {ticket.lastMessageBy === 'user' && ticket.status !== 'resolved' && (
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mt-1" title="User replied" />
                      )}
                      {ticket.rating && (
                        <div className="flex gap-0.5 mt-1 justify-end">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <svg key={s} className={`w-2.5 h-2.5 ${s <= ticket.rating! ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Ticket Detail Panel */}
      <div className={`flex-1 flex flex-col bg-gray-50 ${selectedTicket ? 'flex' : 'hidden lg:flex'}`}>
        {!selectedTicket ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-400">Select a ticket to view details</p>
            </div>
          </div>
        ) : detailLoading && !ticketDetail ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="space-y-4 w-full max-w-2xl p-6">
              <div className="bg-white rounded-xl p-4 animate-pulse">
                <div className="h-5 w-2/3 bg-gray-200 rounded mb-3" />
                <div className="flex gap-2 mb-2">
                  <div className="h-4 w-20 bg-gray-100 rounded" />
                  <div className="h-4 w-32 bg-gray-100 rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-gray-200 rounded-full" />
                  <div className="h-6 w-16 bg-gray-100 rounded-full" />
                </div>
              </div>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                    <div className="h-3 w-24 bg-gray-100 rounded mb-2" />
                    <div className="h-4 w-full bg-gray-200 rounded mb-1" />
                    <div className="h-4 w-3/4 bg-gray-100 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : ticketDetail ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-white flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {/* Back button for mobile */}
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="lg:hidden flex items-center gap-1 text-gray-400 hover:text-gray-900 mb-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <h3 className="font-semibold text-gray-900 text-lg truncate">{ticketDetail.subject}</h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-sm text-gray-600">{ticketDetail.userName}</span>
                  <span className="text-sm text-gray-400">({ticketDetail.userEmail})</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-xs text-gray-500">{CATEGORY_LABELS[ticketDetail.category] || ticketDetail.category}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGE[ticketDetail.status]?.className || ''}`}>
                    {STATUS_BADGE[ticketDetail.status]?.label || ticketDetail.status}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_BADGE[ticketDetail.priority]?.className || ''}`}>
                    {PRIORITY_BADGE[ticketDetail.priority]?.label || ticketDetail.priority}
                  </span>
                  {ticketDetail.assignedToName && (
                    <span className="text-xs text-gray-500">
                      Assigned to: <span className="text-blue-600">{ticketDetail.assignedToName}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {!ticketDetail.assignedTo && (
                  <button
                    onClick={() => handleAssign(ticketDetail.id)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors border border-blue-200"
                  >
                    Assign to me
                  </button>
                )}

                {/* Status dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                  >
                    Status
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {statusMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setStatusMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[140px]">
                        {(['open', 'in_progress', 'resolved', 'closed'] as TicketStatus[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(ticketDetail.id, s)}
                            disabled={ticketDetail.status === s}
                            className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                              ticketDetail.status === s
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {STATUS_BADGE[s]?.label || s}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Rating info */}
            {ticketDetail.rating && (
              <div className="px-4 py-2 bg-green-50 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Customer rating:</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg key={s} className={`w-3.5 h-3.5 ${s <= ticketDetail.rating! ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  {ticketDetail.ratingComment && (
                    <span className="text-xs text-gray-600 italic">— "{ticketDetail.ratingComment}"</span>
                  )}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {ticketMessages.map((msg) => {
                const isAgent = msg.senderRole === 'agent';
                const isSystem = msg.senderRole === 'system';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}
                  >
                    {isSystem ? (
                      <div className="w-full text-center py-2">
                        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                          {msg.content}
                        </span>
                      </div>
                    ) : (
                      <div className={`max-w-[75%]`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium ${isAgent ? 'text-blue-600' : 'text-gray-600'}`}>
                            {isAgent ? `${msg.senderName} (Agent)` : msg.senderName}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {msg.timestamp ? formatDate(msg.timestamp) : ''}
                          </span>
                        </div>
                        <div
                          className={`px-4 py-3 rounded-2xl ${
                            isAgent
                              ? 'bg-blue-50 border border-blue-100 text-gray-800'
                              : 'bg-white border border-gray-200 text-gray-800'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply input */}
            {ticketDetail.status !== 'closed' && (
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex gap-3">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Type your reply as an agent..."
                    rows={2}
                    maxLength={5000}
                    className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleReply();
                      }
                    }}
                  />
                  <button
                    onClick={handleReply}
                    disabled={sending || !replyContent.trim()}
                    className="self-end px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? '...' : 'Reply'}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-red-500">Failed to load ticket</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketInbox;
