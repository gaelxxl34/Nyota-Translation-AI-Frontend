// Custom hooks for translator functionality
// Provides document queue, review, and statistics access

import { useState, useCallback } from 'react';
import { useAuth } from '../AuthProvider';
import * as translatorService from '../services/translatorService';
import type {
  QueueDocument,
  DocumentDetail,
  DocumentRevision,
  QueueStats,
  TranslatorStats,
  LeaderboardEntry,
  Notification,
} from '../services/translatorService';

// Re-export types for convenience
export type {
  QueueDocument,
  DocumentDetail,
  DocumentRevision,
  QueueStats,
  TranslatorStats,
  LeaderboardEntry,
  Notification,
};

/**
 * Hook for managing document queue
 */
export const useDocumentQueue = () => {
  const { idToken } = useAuth();
  const [documents, setDocuments] = useState<QueueDocument[]>([]);
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = useCallback(
    async (filters?: { status?: string; priority?: string; limit?: number }) => {
      if (!idToken) return;
      setLoading(true);
      setError(null);
      try {
        const result = await translatorService.getDocumentQueue(idToken, filters);
        setDocuments(result.documents);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch queue');
        console.error('Error fetching queue:', err);
      } finally {
        setLoading(false);
      }
    },
    [idToken]
  );

  const fetchStats = useCallback(async () => {
    if (!idToken) return;
    try {
      const result = await translatorService.getQueueStats(idToken);
      setStats(result);
    } catch (err) {
      console.error('Error fetching queue stats:', err);
    }
  }, [idToken]);

  const fetchAssigned = useCallback(
    async (filters?: { status?: string; limit?: number }) => {
      if (!idToken) return;
      setLoading(true);
      setError(null);
      try {
        const result = await translatorService.getAssignedDocuments(idToken, filters);
        setDocuments(result.documents);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch assigned documents');
        console.error('Error fetching assigned:', err);
      } finally {
        setLoading(false);
      }
    },
    [idToken]
  );

  return {
    documents,
    stats,
    loading,
    error,
    fetchQueue,
    fetchStats,
    fetchAssigned,
  };
};

/**
 * Hook for document review operations
 */
export const useDocumentReview = () => {
  const { idToken } = useAuth();
  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [revisions, setRevisions] = useState<DocumentRevision[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocument = useCallback(
    async (docId: string) => {
      if (!idToken) return;
      setLoading(true);
      setError(null);
      try {
        const result = await translatorService.getDocumentDetail(idToken, docId);
        setDocument(result.document);
        setRevisions(result.revisions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch document');
        console.error('Error fetching document:', err);
      } finally {
        setLoading(false);
      }
    },
    [idToken]
  );

  const claimDocument = useCallback(
    async (docId: string) => {
      if (!idToken) return false;
      setSaving(true);
      setError(null);
      try {
        await translatorService.claimDocument(idToken, docId);
        // Refetch document to get updated status
        await fetchDocument(docId);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to claim document');
        console.error('Error claiming document:', err);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [idToken, fetchDocument]
  );

  const releaseDocument = useCallback(
    async (docId: string, reason?: string) => {
      if (!idToken) return false;
      setSaving(true);
      setError(null);
      try {
        await translatorService.releaseDocument(idToken, docId, reason);
        setDocument(null);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to release document');
        console.error('Error releasing document:', err);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [idToken]
  );

  const updateDocument = useCallback(
    async (
      docId: string,
      data: {
        translatedData: Record<string, unknown>;
        reviewNotes?: string;
        changes?: string;
      }
    ) => {
      if (!idToken) return false;
      setSaving(true);
      setError(null);
      try {
        await translatorService.updateDocument(idToken, docId, data);
        // Update local state
        if (document) {
          setDocument({
            ...document,
            translatedData: data.translatedData,
            reviewNotes: data.reviewNotes,
          });
        }
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update document');
        console.error('Error updating document:', err);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [idToken, document]
  );

  const approveDocument = useCallback(
    async (docId: string, finalNotes?: string) => {
      if (!idToken) return false;
      setSaving(true);
      setError(null);
      try {
        await translatorService.approveDocument(idToken, docId, finalNotes);
        // Update local state
        if (document) {
          setDocument({
            ...document,
            status: 'approved',
          });
        }
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to approve document');
        console.error('Error approving document:', err);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [idToken, document]
  );

  const rejectDocument = useCallback(
    async (
      docId: string,
      reason: string,
      rejectionType?: 'quality' | 'illegible' | 'incomplete' | 'wrong_format'
    ) => {
      if (!idToken) return false;
      setSaving(true);
      setError(null);
      try {
        await translatorService.rejectDocument(idToken, docId, reason, rejectionType);
        // Update local state
        if (document) {
          setDocument({
            ...document,
            status: 'rejected',
          });
        }
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to reject document');
        console.error('Error rejecting document:', err);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [idToken, document]
  );

  const clearDocument = useCallback(() => {
    setDocument(null);
    setRevisions([]);
    setError(null);
  }, []);

  return {
    document,
    revisions,
    loading,
    saving,
    error,
    fetchDocument,
    claimDocument,
    releaseDocument,
    updateDocument,
    approveDocument,
    rejectDocument,
    clearDocument,
  };
};

/**
 * Hook for translator statistics
 */
export const useTranslatorStats = () => {
  const { idToken } = useAuth();
  const [stats, setStats] = useState<TranslatorStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(
    async (period?: 'day' | 'week' | 'month' | 'year' | 'all') => {
      if (!idToken) return;
      setLoading(true);
      setError(null);
      try {
        const result = await translatorService.getTranslatorStats(idToken, period);
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

  const fetchLeaderboard = useCallback(
    async (options?: { period?: string; limit?: number }) => {
      if (!idToken) return;
      try {
        const result = await translatorService.getLeaderboard(idToken, options);
        setLeaderboard(result);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      }
    },
    [idToken]
  );

  return {
    stats,
    leaderboard,
    loading,
    error,
    fetchStats,
    fetchLeaderboard,
  };
};

/**
 * Hook for translator notifications
 */
export const useTranslatorNotifications = () => {
  const { idToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(
    async (options?: { unreadOnly?: boolean; limit?: number }) => {
      if (!idToken) return;
      setLoading(true);
      setError(null);
      try {
        const result = await translatorService.getNotifications(idToken, options);
        setNotifications(result.notifications);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    },
    [idToken]
  );

  const markAsRead = useCallback(
    async (notifId: string) => {
      if (!idToken) return;
      try {
        await translatorService.markNotificationRead(idToken, notifId);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
        );
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    },
    [idToken]
  );

  const markAllAsRead = useCallback(async () => {
    if (!idToken) return;
    try {
      await translatorService.markAllNotificationsRead(idToken);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [idToken]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
};
