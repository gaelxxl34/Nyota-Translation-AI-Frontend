// Custom hooks for support functionality
// Provides ticket management, user lookup, and statistics access

import { useState, useCallback } from 'react';
import { useAuth } from '../AuthProvider';
import * as supportService from '../services/supportService';
import type {
  SupportStats,
  TeamStats,
  SupportAgent,
  SupportTicket,
  TicketMessage,
  TicketStats,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from '../services/supportService';

// Re-export types for convenience
export type {
  SupportStats,
  TeamStats,
  SupportAgent,
  SupportTicket,
  TicketMessage,
  TicketStats,
  TicketCategory,
  TicketPriority,
  TicketStatus,
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

// ============================================
// SUPPORT TICKET HOOKS
// ============================================

/**
 * Hook for managing support tickets
 */
export const useTickets = () => {
  const { idToken } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(
    async (filters?: { status?: string; category?: string; priority?: string; limit?: number }) => {
      if (!idToken) return;
      setLoading(true);
      setError(null);
      try {
        const result = await supportService.getTickets(idToken, filters);
        setTickets(result.tickets);
        if (result.stats) setStats(result.stats);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
        console.error('Error fetching tickets:', err);
      } finally {
        setLoading(false);
      }
    },
    [idToken]
  );

  const createTicket = useCallback(
    async (data: {
      subject: string;
      message: string;
      category?: TicketCategory;
      priority?: TicketPriority;
      documentId?: string;
    }) => {
      if (!idToken) return null;
      setLoading(true);
      setError(null);
      try {
        const result = await supportService.createTicket(idToken, data);
        await fetchTickets();
        return result.ticket;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create ticket');
        console.error('Error creating ticket:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [idToken, fetchTickets]
  );

  const assignTicket = useCallback(
    async (ticketId: string, agentId?: string) => {
      if (!idToken) return false;
      try {
        await supportService.assignTicket(idToken, ticketId, agentId);
        await fetchTickets();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to assign ticket');
        return false;
      }
    },
    [idToken, fetchTickets]
  );

  const updateTicketStatus = useCallback(
    async (ticketId: string, status: TicketStatus, note?: string) => {
      if (!idToken) return false;
      try {
        await supportService.updateTicketStatus(idToken, ticketId, status, note);
        await fetchTickets();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update ticket status');
        return false;
      }
    },
    [idToken, fetchTickets]
  );

  return {
    tickets,
    stats,
    loading,
    error,
    fetchTickets,
    createTicket,
    assignTicket,
    updateTicketStatus,
  };
};

/**
 * Hook for single ticket detail with messages
 */
export const useTicketDetail = () => {
  const { idToken } = useAuth();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = useCallback(
    async (ticketId: string) => {
      if (!idToken) return;
      setLoading(true);
      setError(null);
      try {
        const result = await supportService.getTicketDetail(idToken, ticketId);
        setTicket(result.ticket);
        setMessages(result.messages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch ticket');
        console.error('Error fetching ticket:', err);
      } finally {
        setLoading(false);
      }
    },
    [idToken]
  );

  const replyToTicket = useCallback(
    async (ticketId: string, content: string) => {
      if (!idToken) return false;
      setSending(true);
      setError(null);
      try {
        const result = await supportService.replyToTicket(idToken, ticketId, content);
        setMessages((prev) => [...prev, result.message]);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to reply');
        console.error('Error replying to ticket:', err);
        return false;
      } finally {
        setSending(false);
      }
    },
    [idToken]
  );

  const rateTicket = useCallback(
    async (ticketId: string, rating: number, comment?: string) => {
      if (!idToken) return false;
      try {
        await supportService.rateTicket(idToken, ticketId, rating, comment);
        await fetchTicket(ticketId);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to rate ticket');
        return false;
      }
    },
    [idToken, fetchTicket]
  );

  const clearTicket = useCallback(() => {
    setTicket(null);
    setMessages([]);
    setError(null);
  }, []);

  return {
    ticket,
    messages,
    loading,
    sending,
    error,
    fetchTicket,
    replyToTicket,
    rateTicket,
    clearTicket,
  };
};
