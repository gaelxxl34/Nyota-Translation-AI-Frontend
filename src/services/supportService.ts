// Support Service for NTC
// API calls for support dashboard functionality

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper to get auth headers
const getAuthHeaders = async (idToken: string) => ({
  'Authorization': `Bearer ${idToken}`,
  'Content-Type': 'application/json',
});

// ============================================
// TYPES
// ============================================

export interface Conversation {
  id: string;
  phoneNumber: string;
  waId: string;
  displayName: string;
  status: 'active' | 'pending' | 'resolved' | 'archived';
  conversationState: string;
  unreadCount: number;
  lastMessage?: string;
  lastMessageAt?: string;
  linkedUserId?: string;
  linkedUserEmail?: string;
  documentsSubmitted: number;
  assignedTo?: string;
  assignedToName?: string;
  tags: string[];
  createdAt: string;
}

export interface Message {
  id: string;
  type: 'incoming' | 'outgoing';
  content: string;
  contentType: 'text' | 'image' | 'document';
  mediaUrl?: string;
  documentId?: string;
  timestamp: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  sentBy?: string;
  sentByName?: string;
}

export interface ConversationDetail extends Conversation {
  notes?: Array<{
    content: string;
    createdAt: string;
    createdBy: string;
    createdByName: string;
  }>;
}

export interface ConversationStats {
  total: number;
  active: number;
  pending: number;
  resolved: number;
  withUnread: number;
  newToday: number;
}

export interface UserSearchResult {
  uid: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface UserDocument {
  id: string;
  formType: string;
  status: string;
  studentName?: string;
  schoolName?: string;
  createdAt: string;
  approvedAt?: string;
}

export interface SupportStats {
  period: string;
  conversationsResolved: number;
  messagesSent: number;
  documentsDelivered: number;
  avgResponseTimeMinutes: number;
  allTimeStats: {
    conversationsResolved: number;
    documentsDelivered: number;
  };
}

export interface TeamStats {
  totalAgents: number;
  totalConversations: number;
  resolvedConversations: number;
  pendingConversations: number;
}

export interface SupportAgent {
  uid: string;
  displayName: string;
  email: string;
  stats: Record<string, unknown>;
}

export interface MessageTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
}

// ============================================
// CONVERSATION API CALLS
// ============================================

/**
 * Get WhatsApp conversations
 */
export const getConversations = async (
  idToken: string,
  filters?: {
    status?: string;
    search?: string;
    limit?: number;
    startAfter?: string;
  }
): Promise<{ conversations: Conversation[]; count: number }> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.startAfter) params.append('startAfter', filters.startAfter);

  const queryString = params.toString();
  const url = `${API_URL}/api/support/conversations${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch conversations');
  }

  return response.json();
};

/**
 * Get conversation statistics
 */
export const getConversationStats = async (idToken: string): Promise<ConversationStats> => {
  const response = await fetch(`${API_URL}/api/support/conversations/stats`, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch conversation stats');
  }

  const data = await response.json();
  return data.stats;
};

/**
 * Get conversation with messages
 */
export const getConversationDetail = async (
  idToken: string,
  conversationId: string,
  messageLimit?: number
): Promise<{ conversation: ConversationDetail; messages: Message[] }> => {
  const params = messageLimit ? `?messageLimit=${messageLimit}` : '';
  const response = await fetch(
    `${API_URL}/api/support/conversations/${conversationId}${params}`,
    {
      headers: await getAuthHeaders(idToken),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch conversation');
  }

  return response.json();
};

/**
 * Send a message to a conversation
 */
export const sendMessage = async (
  idToken: string,
  conversationId: string,
  content: string,
  contentType: 'text' | 'image' | 'document' = 'text'
): Promise<{ message: Message }> => {
  const response = await fetch(
    `${API_URL}/api/support/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      headers: await getAuthHeaders(idToken),
      body: JSON.stringify({ content, contentType }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send message');
  }

  return response.json();
};

/**
 * Assign conversation to an agent
 */
export const assignConversation = async (
  idToken: string,
  conversationId: string,
  agentId?: string
): Promise<{ assignedTo: string; assignedToName: string }> => {
  const response = await fetch(
    `${API_URL}/api/support/conversations/${conversationId}/assign`,
    {
      method: 'POST',
      headers: await getAuthHeaders(idToken),
      body: JSON.stringify({ agentId }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to assign conversation');
  }

  return response.json();
};

/**
 * Update conversation status
 */
export const updateConversationStatus = async (
  idToken: string,
  conversationId: string,
  status: 'active' | 'pending' | 'resolved' | 'archived',
  note?: string
): Promise<{ status: string }> => {
  const response = await fetch(
    `${API_URL}/api/support/conversations/${conversationId}/status`,
    {
      method: 'POST',
      headers: await getAuthHeaders(idToken),
      body: JSON.stringify({ status, note }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update conversation status');
  }

  return response.json();
};

/**
 * Add note to conversation
 */
export const addConversationNote = async (
  idToken: string,
  conversationId: string,
  note: string
): Promise<void> => {
  const response = await fetch(
    `${API_URL}/api/support/conversations/${conversationId}/notes`,
    {
      method: 'POST',
      headers: await getAuthHeaders(idToken),
      body: JSON.stringify({ note }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add note');
  }
};

// ============================================
// USER LOOKUP API CALLS
// ============================================

/**
 * Search users
 */
export const searchUsers = async (
  idToken: string,
  query: string,
  limit?: number
): Promise<{ users: UserSearchResult[]; count: number }> => {
  const params = new URLSearchParams({ query });
  if (limit) params.append('limit', limit.toString());

  const response = await fetch(
    `${API_URL}/api/support/users/search?${params.toString()}`,
    {
      headers: await getAuthHeaders(idToken),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to search users');
  }

  return response.json();
};

/**
 * Get user's documents
 */
export const getUserDocuments = async (
  idToken: string,
  userId: string,
  filters?: { status?: string; limit?: number }
): Promise<{ documents: UserDocument[]; count: number }> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const queryString = params.toString();
  const url = `${API_URL}/api/support/users/${userId}/documents${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch user documents');
  }

  return response.json();
};

// ============================================
// DOCUMENT DELIVERY API CALLS
// ============================================

/**
 * Send document via WhatsApp
 */
export const sendDocument = async (
  idToken: string,
  conversationId: string,
  documentId: string,
  message?: string
): Promise<{ deliveryId: string }> => {
  const response = await fetch(`${API_URL}/api/support/send-document`, {
    method: 'POST',
    headers: await getAuthHeaders(idToken),
    body: JSON.stringify({ conversationId, documentId, message }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send document');
  }

  return response.json();
};

// ============================================
// STATS API CALLS
// ============================================

/**
 * Get support agent statistics
 */
export const getSupportStats = async (
  idToken: string,
  period?: 'day' | 'week' | 'month' | 'year' | 'all'
): Promise<SupportStats> => {
  const params = period ? `?period=${period}` : '';
  const response = await fetch(`${API_URL}/api/support/stats${params}`, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch support stats');
  }

  const data = await response.json();
  return data.stats;
};

/**
 * Get team statistics (super admin only)
 */
export const getTeamStats = async (
  idToken: string
): Promise<{ teamStats: TeamStats; agents: SupportAgent[] }> => {
  const response = await fetch(`${API_URL}/api/support/stats/team`, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch team stats');
  }

  return response.json();
};

// ============================================
// TEMPLATES API CALLS
// ============================================

/**
 * Get message templates
 */
export const getMessageTemplates = async (
  idToken: string
): Promise<{ templates: MessageTemplate[] }> => {
  const response = await fetch(`${API_URL}/api/support/templates`, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch templates');
  }

  return response.json();
};
