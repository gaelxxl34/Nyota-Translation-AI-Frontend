// Custom hooks for support functionality
// Provides WhatsApp conversation management, user lookup, and statistics access

import { useState, useCallback } from 'react';
import { useAuth } from '../AuthProvider';
import * as supportService from '../services/supportService';
import type {
  Conversation,
  ConversationDetail,
  Message,
  ConversationStats,
  UserSearchResult,
  UserDocument,
  SupportStats,
  TeamStats,
  SupportAgent,
  MessageTemplate,
} from '../services/supportService';

// Re-export types for convenience
export type {
  Conversation,
  ConversationDetail,
  Message,
  ConversationStats,
  UserSearchResult,
  UserDocument,
  SupportStats,
  TeamStats,
  SupportAgent,
  MessageTemplate,
};

/**
 * Hook for managing WhatsApp conversations list
 */
export const useConversations = () => {
  const { idToken } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [stats, setStats] = useState<ConversationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(
    async (filters?: { status?: string; search?: string; limit?: number }) => {
      if (!idToken) return;
      setLoading(true);
      setError(null);
      try {
        const result = await supportService.getConversations(idToken, filters);
        setConversations(result.conversations);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
        console.error('Error fetching conversations:', err);
      } finally {
        setLoading(false);
      }
    },
    [idToken]
  );

  const fetchStats = useCallback(async () => {
    if (!idToken) return;
    try {
      const result = await supportService.getConversationStats(idToken);
      setStats(result);
    } catch (err) {
      console.error('Error fetching conversation stats:', err);
    }
  }, [idToken]);

  const assignConversation = useCallback(
    async (conversationId: string, agentId?: string) => {
      if (!idToken) return false;
      try {
        await supportService.assignConversation(idToken, conversationId, agentId);
        // Refresh conversations
        await fetchConversations();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to assign conversation');
        return false;
      }
    },
    [idToken, fetchConversations]
  );

  const updateStatus = useCallback(
    async (
      conversationId: string,
      status: 'active' | 'pending' | 'resolved' | 'archived',
      note?: string
    ) => {
      if (!idToken) return false;
      try {
        await supportService.updateConversationStatus(idToken, conversationId, status, note);
        // Refresh conversations and stats
        await fetchConversations();
        await fetchStats();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update status');
        return false;
      }
    },
    [idToken, fetchConversations, fetchStats]
  );

  return {
    conversations,
    stats,
    loading,
    error,
    fetchConversations,
    fetchStats,
    assignConversation,
    updateStatus,
  };
};

/**
 * Hook for managing a single conversation with messages
 */
export const useConversationDetail = () => {
  const { idToken } = useAuth();
  const [conversation, setConversation] = useState<ConversationDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversation = useCallback(
    async (conversationId: string, messageLimit?: number) => {
      if (!idToken) return;
      setLoading(true);
      setError(null);
      try {
        const result = await supportService.getConversationDetail(
          idToken,
          conversationId,
          messageLimit
        );
        setConversation(result.conversation);
        setMessages(result.messages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch conversation');
        console.error('Error fetching conversation:', err);
      } finally {
        setLoading(false);
      }
    },
    [idToken]
  );

  const sendMessage = useCallback(
    async (conversationId: string, content: string, contentType?: 'text' | 'image' | 'document') => {
      if (!idToken) return false;
      setSending(true);
      setError(null);
      try {
        const result = await supportService.sendMessage(idToken, conversationId, content, contentType);
        // Add message to local state
        setMessages((prev) => [...prev, result.message]);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
        console.error('Error sending message:', err);
        return false;
      } finally {
        setSending(false);
      }
    },
    [idToken]
  );

  const addNote = useCallback(
    async (conversationId: string, note: string) => {
      if (!idToken) return false;
      try {
        await supportService.addConversationNote(idToken, conversationId, note);
        // Refresh conversation to get updated notes
        await fetchConversation(conversationId);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add note');
        return false;
      }
    },
    [idToken, fetchConversation]
  );

  const sendDocument = useCallback(
    async (conversationId: string, documentId: string, message?: string) => {
      if (!idToken) return false;
      setSending(true);
      setError(null);
      try {
        await supportService.sendDocument(idToken, conversationId, documentId, message);
        // Refresh messages
        await fetchConversation(conversationId);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send document');
        console.error('Error sending document:', err);
        return false;
      } finally {
        setSending(false);
      }
    },
    [idToken, fetchConversation]
  );

  const clearConversation = useCallback(() => {
    setConversation(null);
    setMessages([]);
    setError(null);
  }, []);

  return {
    conversation,
    messages,
    loading,
    sending,
    error,
    fetchConversation,
    sendMessage,
    addNote,
    sendDocument,
    clearConversation,
  };
};

/**
 * Hook for user lookup and document search
 */
export const useUserLookup = () => {
  const { idToken } = useAuth();
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = useCallback(
    async (query: string, limit?: number) => {
      if (!idToken || query.length < 2) {
        setUsers([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const result = await supportService.searchUsers(idToken, query, limit);
        setUsers(result.users);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search users');
        console.error('Error searching users:', err);
      } finally {
        setLoading(false);
      }
    },
    [idToken]
  );

  const fetchUserDocuments = useCallback(
    async (userId: string, filters?: { status?: string; limit?: number }) => {
      if (!idToken) return;
      setLoading(true);
      setError(null);
      try {
        const result = await supportService.getUserDocuments(idToken, userId, filters);
        setDocuments(result.documents);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch documents');
        console.error('Error fetching documents:', err);
      } finally {
        setLoading(false);
      }
    },
    [idToken]
  );

  const clearResults = useCallback(() => {
    setUsers([]);
    setDocuments([]);
    setError(null);
  }, []);

  return {
    users,
    documents,
    loading,
    error,
    searchUsers,
    fetchUserDocuments,
    clearResults,
  };
};

/**
 * Hook for support agent statistics
 */
export const useSupportStats = () => {
  const { idToken } = useAuth();
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [agents, setAgents] = useState<SupportAgent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(
    async (period?: 'day' | 'week' | 'month' | 'year' | 'all') => {
      if (!idToken) return;
      setLoading(true);
      setError(null);
      try {
        const result = await supportService.getSupportStats(idToken, period);
        setStats(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    },
    [idToken]
  );

  const fetchTeamStats = useCallback(async () => {
    if (!idToken) return;
    setLoading(true);
    setError(null);
    try {
      const result = await supportService.getTeamStats(idToken);
      setTeamStats(result.teamStats);
      setAgents(result.agents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch team stats');
      console.error('Error fetching team stats:', err);
    } finally {
      setLoading(false);
    }
  }, [idToken]);

  return {
    stats,
    teamStats,
    agents,
    loading,
    error,
    fetchStats,
    fetchTeamStats,
  };
};

/**
 * Hook for message templates
 */
export const useMessageTemplates = () => {
  const { idToken } = useAuth();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    if (!idToken) return;
    setLoading(true);
    setError(null);
    try {
      const result = await supportService.getMessageTemplates(idToken);
      setTemplates(result.templates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
      console.error('Error fetching templates:', err);
    } finally {
      setLoading(false);
    }
  }, [idToken]);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
  };
};
