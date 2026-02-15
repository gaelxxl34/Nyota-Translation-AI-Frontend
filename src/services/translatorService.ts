// Translator Service for NTC
// API calls for translator dashboard functionality

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Helper to get auth headers
const getAuthHeaders = async (idToken: string) => ({
  'Authorization': `Bearer ${idToken}`,
  'Content-Type': 'application/json',
});

// Document types
export interface QueueDocument {
  id: string;
  userId: string;
  userEmail: string;
  formType: string;
  status: 'pending_review' | 'in_review' | 'ai_completed' | 'approved' | 'rejected';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  studentName?: string;
  schoolName?: string;
  assignedTo?: string;
  assignedToName?: string;
  aiConfidenceScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentDetail extends QueueDocument {
  originalFileUrl?: string;
  extractedData?: Record<string, unknown>;
  translatedData?: Record<string, unknown>;
  aiNotes?: string;
  reviewNotes?: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  assignedAt?: string;
}

export interface DocumentRevision {
  id: string;
  translatorId: string;
  translatorName: string;
  changes: string;
  comment?: string;
  createdAt: string;
}

export interface QueueStats {
  pendingReview: number;
  inReview: number;
  aiCompleted: number;
  approved: number;
  rejected: number;
  totalInQueue: number;
  approvedToday: number;
}

export interface TranslatorStats {
  period: string;
  approved: number;
  rejected: number;
  inProgress: number;
  totalReviewed: number;
  approvalRate: number;
  avgReviewTimeMinutes?: number;
  allTimeStats: {
    documentsApproved: number;
    documentsRejected?: number;
  };
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL?: string;
  documentsApproved: number;
  stats: Record<string, unknown>;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  documentId?: string;
  read: boolean;
  createdAt: string;
}

// ============================================
// QUEUE API CALLS
// ============================================

/**
 * Get document queue for translators
 */
export const getDocumentQueue = async (
  idToken: string,
  filters?: {
    status?: string;
    priority?: string;
    limit?: number;
    startAfter?: string;
  }
): Promise<{ documents: QueueDocument[]; count: number }> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.startAfter) params.append('startAfter', filters.startAfter);

  const queryString = params.toString();
  const url = `${API_URL}/api/translator/queue${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch document queue');
  }

  return response.json();
};

/**
 * Get queue statistics
 */
export const getQueueStats = async (idToken: string): Promise<QueueStats> => {
  const response = await fetch(`${API_URL}/api/translator/queue/stats`, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch queue stats');
  }

  const data = await response.json();
  return data.stats;
};

/**
 * Get documents assigned to current translator
 */
export const getAssignedDocuments = async (
  idToken: string,
  filters?: { status?: string; limit?: number }
): Promise<{ documents: QueueDocument[]; count: number }> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const queryString = params.toString();
  const url = `${API_URL}/api/translator/assigned${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch assigned documents');
  }

  return response.json();
};

// ============================================
// DOCUMENT REVIEW API CALLS
// ============================================

/**
 * Get full document details for review
 */
export const getDocumentDetail = async (
  idToken: string,
  docId: string
): Promise<{ document: DocumentDetail; revisions: DocumentRevision[] }> => {
  const response = await fetch(`${API_URL}/api/translator/document/${docId}`, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch document');
  }

  return response.json();
};

/**
 * Claim a document for review
 */
export const claimDocument = async (
  idToken: string,
  docId: string
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_URL}/api/translator/document/${docId}/claim`, {
    method: 'POST',
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Failed to claim document');
  }

  return response.json();
};

/**
 * Release a document back to queue
 */
export const releaseDocument = async (
  idToken: string,
  docId: string,
  reason?: string
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_URL}/api/translator/document/${docId}/release`, {
    method: 'POST',
    headers: await getAuthHeaders(idToken),
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to release document');
  }

  return response.json();
};

/**
 * Update document translation (save draft)
 */
export const updateDocument = async (
  idToken: string,
  docId: string,
  data: {
    translatedData: Record<string, unknown>;
    reviewNotes?: string;
    changes?: string;
  }
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_URL}/api/translator/document/${docId}/update`, {
    method: 'PUT',
    headers: await getAuthHeaders(idToken),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update document');
  }

  return response.json();
};

/**
 * Approve document translation
 */
export const approveDocument = async (
  idToken: string,
  docId: string,
  finalNotes?: string
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_URL}/api/translator/document/${docId}/approve`, {
    method: 'POST',
    headers: await getAuthHeaders(idToken),
    body: JSON.stringify({ finalNotes }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to approve document');
  }

  return response.json();
};

/**
 * Reject document translation
 */
export const rejectDocument = async (
  idToken: string,
  docId: string,
  reason: string,
  rejectionType?: 'quality' | 'illegible' | 'incomplete' | 'wrong_format'
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_URL}/api/translator/document/${docId}/reject`, {
    method: 'POST',
    headers: await getAuthHeaders(idToken),
    body: JSON.stringify({ reason, rejectionType }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to reject document');
  }

  return response.json();
};

// ============================================
// STATISTICS API CALLS
// ============================================

/**
 * Get translator performance statistics
 */
export const getTranslatorStats = async (
  idToken: string,
  period?: 'day' | 'week' | 'month' | 'year' | 'all'
): Promise<TranslatorStats> => {
  const url = period
    ? `${API_URL}/api/translator/stats?period=${period}`
    : `${API_URL}/api/translator/stats`;

  const response = await fetch(url, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch translator stats');
  }

  const data = await response.json();
  return data.stats;
};

/**
 * Get translator leaderboard
 */
export const getLeaderboard = async (
  idToken: string,
  options?: { period?: string; limit?: number }
): Promise<LeaderboardEntry[]> => {
  const params = new URLSearchParams();
  if (options?.period) params.append('period', options.period);
  if (options?.limit) params.append('limit', options.limit.toString());

  const queryString = params.toString();
  const url = `${API_URL}/api/translator/stats/leaderboard${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch leaderboard');
  }

  const data = await response.json();
  return data.leaderboard;
};

// ============================================
// NOTIFICATION API CALLS
// ============================================

/**
 * Get translator notifications
 */
export const getNotifications = async (
  idToken: string,
  options?: { unreadOnly?: boolean; limit?: number }
): Promise<{ notifications: Notification[]; count: number }> => {
  const params = new URLSearchParams();
  if (options?.unreadOnly) params.append('unreadOnly', 'true');
  if (options?.limit) params.append('limit', options.limit.toString());

  const queryString = params.toString();
  const url = `${API_URL}/api/translator/notifications${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch notifications');
  }

  return response.json();
};

/**
 * Mark notification as read
 */
export const markNotificationRead = async (
  idToken: string,
  notifId: string
): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_URL}/api/translator/notifications/${notifId}/read`, {
    method: 'POST',
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to mark notification as read');
  }

  return response.json();
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsRead = async (
  idToken: string
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_URL}/api/translator/notifications/read-all`, {
    method: 'POST',
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to mark notifications as read');
  }

  return response.json();
};
