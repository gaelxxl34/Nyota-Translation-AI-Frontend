// Conversation View Component for Support Dashboard
// Chat interface for WhatsApp conversations with message history

import React, { useState, useRef, useEffect } from 'react';
import type { ConversationDetail, Message, MessageTemplate, UserDocument } from '../../hooks/useSupport';

interface ConversationViewProps {
  conversation: ConversationDetail | null;
  messages: Message[];
  templates: MessageTemplate[];
  userDocuments: UserDocument[];
  loading: boolean;
  sending: boolean;
  onSendMessage: (content: string) => void;
  onSendDocument: (documentId: string, message?: string) => void;
  onUpdateStatus: (status: 'active' | 'pending' | 'resolved' | 'archived', note?: string) => void;
  onAddNote: (note: string) => void;
  onBack: () => void;
  onSearchUserDocuments: (userId: string) => void;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-500',
  pending: 'bg-yellow-500',
  resolved: 'bg-blue-500',
  archived: 'bg-gray-500',
};

const ConversationView: React.FC<ConversationViewProps> = ({
  conversation,
  messages,
  templates,
  userDocuments,
  loading,
  sending,
  onSendMessage,
  onSendDocument,
  onUpdateStatus,
  onAddNote,
  onBack,
  onSearchUserDocuments,
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [docMessage, setDocMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load user documents when conversation has linked user
  useEffect(() => {
    if (conversation?.linkedUserId) {
      onSearchUserDocuments(conversation.linkedUserId);
    }
  }, [conversation?.linkedUserId, onSearchUserDocuments]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || sending) return;
    onSendMessage(messageInput.trim());
    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectTemplate = (template: MessageTemplate) => {
    setMessageInput(template.content);
    setShowTemplates(false);
  };

  const handleSendDocument = () => {
    if (!selectedDocId) return;
    onSendDocument(selectedDocId, docMessage || undefined);
    setSelectedDocId(null);
    setDocMessage('');
    setShowDocuments(false);
  };

  const handleAddNote = () => {
    if (!noteInput.trim()) return;
    onAddNote(noteInput.trim());
    setNoteInput('');
    setShowNoteModal(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString();
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400">
        <svg className="w-24 h-24 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <p className="text-lg">Select a conversation to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="lg:hidden p-2 hover:bg-gray-700 rounded-lg"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
            {conversation.displayName?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h3 className="font-semibold text-white">{conversation.displayName}</h3>
            <p className="text-sm text-gray-400">{conversation.phoneNumber}</p>
          </div>
          <span className={`w-3 h-3 rounded-full ${statusColors[conversation.status]}`}></span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Status Menu */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"
              title="Change Status"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {showStatusMenu && (
              <div className="absolute right-0 top-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 w-40">
                {['active', 'pending', 'resolved', 'archived'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      onUpdateStatus(status as 'active' | 'pending' | 'resolved' | 'archived');
                      setShowStatusMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg capitalize"
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Note */}
          <button
            onClick={() => setShowNoteModal(true)}
            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"
            title="Add Note"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {/* Send Document */}
          {conversation.linkedUserId && (
            <button
              onClick={() => setShowDocuments(true)}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"
              title="Send Document"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* User Info Banner (if linked) */}
      {conversation.linkedUserEmail && (
        <div className="px-4 py-2 bg-blue-500/10 border-b border-blue-500/30">
          <p className="text-sm text-blue-400">
            📧 Linked to: <span className="font-medium">{conversation.linkedUserEmail}</span>
            {conversation.documentsSubmitted > 0 && (
              <span className="ml-2">• {conversation.documentsSubmitted} documents submitted</span>
            )}
          </p>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex items-center justify-center mb-4">
              <span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-400">
                {date}
              </span>
            </div>

            {/* Messages */}
            {dateMessages.map((message) => (
              <div
                key={message.id}
                className={`flex mb-3 ${message.type === 'outgoing' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    message.type === 'outgoing'
                      ? 'bg-green-600 text-white rounded-br-md'
                      : 'bg-gray-700 text-white rounded-bl-md'
                  }`}
                >
                  {/* Document attachment */}
                  {message.contentType === 'document' && (
                    <div className="flex items-center gap-2 mb-2 p-2 bg-black/20 rounded-lg">
                      <svg className="w-8 h-8 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm">Document attached</span>
                    </div>
                  )}

                  {/* Image attachment */}
                  {message.contentType === 'image' && message.mediaUrl && (
                    <img
                      src={message.mediaUrl}
                      alt="Attachment"
                      className="max-w-full rounded-lg mb-2"
                    />
                  )}

                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                    {message.type === 'outgoing' && (
                      <span className="text-xs opacity-70">
                        {message.status === 'read' ? '✓✓' : message.status === 'delivered' ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>

                  {message.sentByName && message.type === 'outgoing' && (
                    <p className="text-xs opacity-50 mt-1">Sent by {message.sentByName}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Notes Section (if any) */}
      {conversation.notes && conversation.notes.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-700 bg-gray-800/50">
          <p className="text-xs text-gray-400 mb-1">Internal Notes:</p>
          <div className="max-h-20 overflow-y-auto space-y-1">
            {conversation.notes.map((note, index) => (
              <p key={index} className="text-xs text-yellow-400">
                💬 {note.content} <span className="text-gray-500">- {note.createdByName}</span>
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <div className="flex items-end gap-2">
          {/* Template Button */}
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"
              title="Quick Replies"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            {showTemplates && templates.length > 0 && (
              <div className="absolute bottom-full left-0 mb-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 w-72 max-h-64 overflow-y-auto">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 border-b border-gray-700 last:border-b-0"
                  >
                    <p className="text-sm font-medium text-white">{template.name}</p>
                    <p className="text-xs text-gray-400 truncate">{template.content}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Message Input */}
          <textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-2xl text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            style={{ minHeight: '42px', maxHeight: '120px' }}
          />

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || sending}
            className={`p-3 rounded-full transition-colors ${
              messageInput.trim() && !sending
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Document Selection Modal */}
      {showDocuments && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Send Document</h3>
            
            {userDocuments.length === 0 ? (
              <p className="text-gray-400">No approved documents found for this user.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                {userDocuments.filter(d => d.status === 'approved').map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                      selectedDocId === doc.id
                        ? 'bg-green-500/20 border-green-500'
                        : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <p className="font-medium text-white">{doc.studentName || 'Unknown Student'}</p>
                    <p className="text-sm text-gray-400">
                      {doc.formType} • {doc.schoolName || 'Unknown School'}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {selectedDocId && (
              <textarea
                value={docMessage}
                onChange={(e) => setDocMessage(e.target.value)}
                placeholder="Add a message (optional)..."
                rows={2}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
              />
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDocuments(false);
                  setSelectedDocId(null);
                  setDocMessage('');
                }}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSendDocument}
                disabled={!selectedDocId || sending}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Add Internal Note</h3>
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Enter note..."
              rows={4}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setNoteInput('');
                }}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                disabled={!noteInput.trim()}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationView;
