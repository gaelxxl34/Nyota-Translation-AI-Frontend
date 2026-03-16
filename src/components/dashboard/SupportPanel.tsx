// SupportPanel — User-facing support ticket panel (create, list, detail, rate)
// White/light theme, designed to be embedded as a tab in TranslatePage

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  useTickets,
  useTicketDetail,
  type SupportTicket,
  type TicketCategory,
  type TicketPriority,
} from '../../hooks/useSupport';

type SupportView = 'list' | 'create' | 'detail';

const CATEGORY_OPTIONS: { value: TicketCategory; label: string }[] = [
  { value: 'document_issue', label: 'Document Issue' },
  { value: 'account_issue', label: 'Account Issue' },
  { value: 'payment_issue', label: 'Payment Issue' },
  { value: 'translation_quality', label: 'Translation Quality' },
  { value: 'technical_issue', label: 'Technical Issue' },
  { value: 'general_inquiry', label: 'General Inquiry' },
  { value: 'other', label: 'Other' },
];

const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  in_progress: { label: 'In Progress', className: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
  resolved: { label: 'Resolved', className: 'bg-green-50 text-green-700 border border-green-200' },
  closed: { label: 'Closed', className: 'bg-gray-100 text-gray-600 border border-gray-200' },
};

const PRIORITY_BADGE: Record<string, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-green-50 text-green-700' },
  medium: { label: 'Medium', className: 'bg-blue-50 text-blue-700' },
  high: { label: 'High', className: 'bg-orange-50 text-orange-700' },
  urgent: { label: 'Urgent', className: 'bg-red-50 text-red-700' },
};

const SupportPanel: React.FC = () => {
  const [view, setView] = useState<SupportView>('list');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  // Form state
  const [formSubject, setFormSubject] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formCategory, setFormCategory] = useState<TicketCategory>('general_inquiry');
  const [formPriority, setFormPriority] = useState<TicketPriority>('medium');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Reply state
  const [replyContent, setReplyContent] = useState('');

  // Rating state
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingComment, setRatingComment] = useState('');
  const [showRating, setShowRating] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    tickets,
    loading: ticketsLoading,
    error: ticketsError,
    fetchTickets,
    createTicket,
  } = useTickets();

  const {
    ticket: ticketDetail,
    messages: ticketMessages,
    loading: detailLoading,
    sending,
    error: detailError,
    fetchTicket,
    replyToTicket,
    rateTicket,
    clearTicket,
  } = useTicketDetail();

  useEffect(() => {
    fetchTickets(statusFilter ? { status: statusFilter } : undefined);
  }, [fetchTickets, statusFilter]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticketMessages]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSubject.trim() || !formMessage.trim()) return;

    const result = await createTicket({
      subject: formSubject.trim(),
      message: formMessage.trim(),
      category: formCategory,
      priority: formPriority,
    });

    if (result) {
      setSubmitSuccess(true);
      setFormSubject('');
      setFormMessage('');
      setFormCategory('general_inquiry');
      setFormPriority('medium');
      setTimeout(() => {
        setSubmitSuccess(false);
        setView('list');
      }, 2000);
    }
  };

  const handleSelectTicket = useCallback(
    async (ticket: SupportTicket) => {
      setSelectedTicket(ticket);
      setView('detail');
      await fetchTicket(ticket.id);
    },
    [fetchTicket]
  );

  const handleReply = async () => {
    if (!replyContent.trim() || !selectedTicket) return;
    const success = await replyToTicket(selectedTicket.id, replyContent.trim());
    if (success) {
      setReplyContent('');
    }
  };

  const handleRate = async () => {
    if (!selectedTicket || ratingValue === 0) return;
    const success = await rateTicket(selectedTicket.id, ratingValue, ratingComment.trim() || undefined);
    if (success) {
      setShowRating(false);
      setRatingValue(0);
      setRatingComment('');
    }
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedTicket(null);
    clearTicket();
    setReplyContent('');
    setShowRating(false);
    fetchTickets(statusFilter ? { status: statusFilter } : undefined);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(dateStr);
  };

  // ── List View ──
  if (view === 'list') {
    return (
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">My Support Tickets</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Need help? Create a ticket and we'll assist you.</p>
          </div>
          {tickets.length > 0 && (
            <button
              onClick={() => setView('create')}
              className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
            >
              + New Ticket
            </button>
          )}
        </div>

        {/* Status filters — only show when there are tickets */}
        {tickets.length > 0 && (
        <div className="flex gap-1.5 sm:gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {[
            { value: '', label: 'All' },
            { value: 'open', label: 'Open' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'resolved', label: 'Resolved' },
            { value: 'closed', label: 'Closed' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                statusFilter === f.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        )}

        {/* Ticket list */}
        {ticketsLoading ? (
          <div className="space-y-2 sm:space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 animate-pulse">
                <div className="flex items-start justify-between gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="h-4 sm:h-5 w-3/4 bg-gray-200 rounded mb-2" />
                    <div className="flex items-center gap-1.5 sm:gap-3">
                      <div className="h-4 w-14 bg-gray-200 rounded-full" />
                      <div className="h-4 w-14 bg-gray-100 rounded-full" />
                      <div className="h-3 w-20 bg-gray-100 rounded hidden sm:block" />
                    </div>
                  </div>
                  <div className="h-3 w-10 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : ticketsError ? (
          <div className="text-center py-10 sm:py-16">
            <p className="text-red-600 text-sm">{ticketsError}</p>
            <button onClick={() => fetchTickets()} className="mt-3 text-blue-600 hover:text-blue-700 text-sm">
              Try again
            </button>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-10 sm:py-16 bg-white rounded-xl sm:rounded-2xl border border-gray-200 px-4">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5">No tickets yet</h3>
            <p className="text-gray-500 mb-5 text-sm">Create a ticket to get help from our support team.</p>
            <button
              onClick={() => setView('create')}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Create Your First Ticket
            </button>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {tickets.map((ticket) => {
              const status = STATUS_BADGE[ticket.status] || STATUS_BADGE.open;
              const priority = PRIORITY_BADGE[ticket.priority] || PRIORITY_BADGE.medium;
              return (
                <button
                  key={ticket.id}
                  onClick={() => handleSelectTicket(ticket)}
                  className="w-full bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl p-3 sm:p-4 text-left transition-all group"
                >
                  <div className="flex items-start justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {ticket.subject}
                        </h3>
                        {ticket.status === 'resolved' && !ticket.rating && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 whitespace-nowrap">
                            Rate
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-3 text-xs sm:text-sm flex-wrap">
                        <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${status.className}`}>
                          {status.label}
                        </span>
                        <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${priority.className}`}>
                          {priority.label}
                        </span>
                        <span className="text-gray-500 hidden sm:inline">
                          {CATEGORY_OPTIONS.find(c => c.value === ticket.category)?.label || ticket.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] sm:text-xs text-gray-400">
                        {ticket.lastMessageAt ? formatRelativeTime(ticket.lastMessageAt) : formatRelativeTime(ticket.createdAt)}
                      </p>
                      {ticket.lastMessageBy === 'agent' && (
                        <p className="text-[10px] sm:text-xs text-green-600 mt-0.5">Agent replied</p>
                      )}
                      {ticket.rating && (
                        <div className="flex items-center gap-0.5 mt-0.5 justify-end">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${star <= ticket.rating! ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ── Create View ──
  if (view === 'create') {
    return (
      <div>
        <button
          onClick={handleBackToList}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 mb-4 transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Tickets
        </button>

        <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Create a Support Ticket</h2>

          {submitSuccess && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-700 font-medium text-sm">
                Ticket submitted! Our team will get back to you shortly.
              </p>
            </div>
          )}

          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject *</label>
              <input
                type="text"
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                placeholder="Brief description of your issue"
                maxLength={200}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as TicketCategory)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-xl text-sm sm:text-base text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Priority</label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as TicketPriority)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-xl text-sm sm:text-base text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                >
                  {PRIORITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
              <textarea
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                maxLength={5000}
                rows={5}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                required
              />
              <p className="text-[10px] sm:text-xs text-gray-400 mt-1 text-right">{formMessage.length}/5000</p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-1">
              <button
                type="button"
                onClick={handleBackToList}
                className="w-full sm:w-auto px-5 py-2.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={ticketsLoading || !formSubject.trim() || !formMessage.trim()}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {ticketsLoading ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ── Detail View ──
  return (
    <div>
      <button
        onClick={handleBackToList}
        className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 mb-4 transition-colors text-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Tickets
      </button>

      {detailLoading && !ticketDetail ? (
        <div className="space-y-3 sm:space-y-5 animate-pulse">
          {/* Skeleton ticket header */}
          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="h-5 sm:h-6 w-2/3 bg-gray-200 rounded mb-3" />
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-5 w-16 bg-gray-200 rounded-full" />
              <div className="h-5 w-14 bg-gray-100 rounded-full" />
              <div className="h-4 w-24 bg-gray-100 rounded hidden sm:block" />
            </div>
            <div className="h-3 w-32 bg-gray-100 rounded mt-3" />
          </div>
          {/* Skeleton conversation */}
          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden">
            <div className="px-3 sm:px-4 py-3 border-b border-gray-200">
              <div className="h-4 w-28 bg-gray-200 rounded" />
            </div>
            <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-4">
              <div className="flex justify-end">
                <div className="w-3/4 sm:w-1/2">
                  <div className="h-3 w-16 bg-gray-100 rounded mb-1" />
                  <div className="h-16 bg-blue-50 border border-blue-100 rounded-xl" />
                </div>
              </div>
              <div className="flex justify-start">
                <div className="w-3/4 sm:w-1/2">
                  <div className="h-3 w-20 bg-gray-100 rounded mb-1" />
                  <div className="h-12 bg-gray-50 border border-gray-200 rounded-xl" />
                </div>
              </div>
            </div>
            <div className="px-3 sm:px-4 py-3 border-t border-gray-200">
              <div className="h-16 bg-gray-100 rounded-xl" />
            </div>
          </div>
        </div>
      ) : ticketDetail ? (
        <div className="space-y-3 sm:space-y-5">
          {/* Ticket header */}
          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
              <div className="min-w-0">
                <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">{ticketDetail.subject}</h2>
                <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap">
                  <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${STATUS_BADGE[ticketDetail.status]?.className || ''}`}>
                    {STATUS_BADGE[ticketDetail.status]?.label || ticketDetail.status}
                  </span>
                  <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${PRIORITY_BADGE[ticketDetail.priority]?.className || ''}`}>
                    {PRIORITY_BADGE[ticketDetail.priority]?.label || ticketDetail.priority}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500">
                    {CATEGORY_OPTIONS.find(c => c.value === ticketDetail.category)?.label}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1.5">
                  Created {formatDate(ticketDetail.createdAt)}
                </p>
              </div>
              {ticketDetail.assignedToName && (
                <div className="text-left sm:text-right flex-shrink-0 pt-1 sm:pt-0">
                  <p className="text-[10px] sm:text-xs text-gray-400">Assigned to</p>
                  <p className="text-xs sm:text-sm text-blue-600 font-medium">{ticketDetail.assignedToName}</p>
                </div>
              )}
            </div>

            {/* Rating prompt for resolved tickets */}
            {ticketDetail.status === 'resolved' && !ticketDetail.rating && !showRating && (
              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-yellow-800 font-medium text-sm">Your ticket has been resolved!</p>
                    <p className="text-xs sm:text-sm text-yellow-600 mt-0.5">Please rate our support to help us improve.</p>
                  </div>
                  <button
                    onClick={() => setShowRating(true)}
                    className="w-full sm:w-auto px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg transition-colors font-medium text-sm"
                  >
                    Rate Service
                  </button>
                </div>
              </div>
            )}

            {/* Rating form */}
            {showRating && (
              <div className="mt-3 sm:mt-4 p-4 sm:p-5 bg-gray-50 border border-gray-200 rounded-xl">
                <h4 className="text-gray-900 font-semibold mb-3 text-sm sm:text-base">Rate Our Support</h4>
                <div className="flex items-center gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingValue(star)}
                      onMouseEnter={() => setRatingHover(star)}
                      onMouseLeave={() => setRatingHover(0)}
                      className="p-0.5 sm:p-1 transition-transform hover:scale-110"
                    >
                      <svg
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                          star <= (ratingHover || ratingValue)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                  {ratingValue > 0 && (
                    <span className="ml-1.5 sm:ml-2 text-xs sm:text-sm text-gray-500">
                      {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][ratingValue]}
                    </span>
                  )}
                </div>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Any additional feedback? (optional)"
                  maxLength={1000}
                  rows={3}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none mb-3"
                />
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                  <button
                    onClick={() => { setShowRating(false); setRatingValue(0); setRatingComment(''); }}
                    className="w-full sm:w-auto px-4 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRate}
                    disabled={ratingValue === 0}
                    className="w-full sm:w-auto px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Rating
                  </button>
                </div>
              </div>
            )}

            {/* Show existing rating */}
            {ticketDetail.rating && (
              <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs sm:text-sm text-gray-600">Your rating:</p>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className={`w-4 h-4 ${star <= ticketDetail.rating! ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  {ticketDetail.ratingComment && (
                    <span className="text-sm text-gray-500 ml-2">— "{ticketDetail.ratingComment}"</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden">
            <div className="px-3 sm:px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Conversation</h3>
            </div>
            <div className="px-3 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
              {ticketMessages.map((msg) => {
                const isUser = msg.senderRole === 'user';
                const isSystem = msg.senderRole === 'system';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {isSystem ? (
                      <div className="w-full text-center py-1.5">
                        <span className="text-[10px] sm:text-xs text-gray-400 bg-gray-100 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full">
                          {msg.content}
                        </span>
                      </div>
                    ) : (
                      <div className={`max-w-[85%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                          <span className={`text-[10px] sm:text-xs font-medium ${isUser ? 'text-blue-600' : 'text-green-600'}`}>
                            {isUser ? 'You' : msg.senderName}
                          </span>
                          <span className="text-[10px] sm:text-xs text-gray-400">
                            {msg.timestamp ? formatDate(msg.timestamp) : ''}
                          </span>
                        </div>
                        <div
                          className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl ${
                            isUser
                              ? 'bg-blue-50 border border-blue-100 text-gray-800'
                              : 'bg-gray-50 border border-gray-200 text-gray-800'
                          }`}
                        >
                          <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{msg.content}</p>
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
              <div className="px-3 sm:px-4 py-3 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Type your reply..."
                    rows={2}
                    maxLength={5000}
                    className="flex-1 px-3 sm:px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
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
                    className="w-full sm:w-auto self-end px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? '...' : 'Send'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-10 sm:py-16">
          <p className="text-red-600 text-sm">{detailError || 'Ticket not found'}</p>
        </div>
      )}
    </div>
  );
};

export default SupportPanel;
