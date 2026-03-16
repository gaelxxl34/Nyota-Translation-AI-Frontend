// Support Service for NTC
// API calls for support dashboard functionality

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Helper to get auth headers
const getAuthHeaders = async (idToken: string) => ({
  'Authorization': `Bearer ${idToken}`,
  'Content-Type': 'application/json',
});

// ============================================
// TYPES
// ============================================

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

// ============================================
// SUPPORT TICKET TYPES
// ============================================

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketCategory = 'document_issue' | 'account_issue' | 'payment_issue' | 'translation_quality' | 'technical_issue' | 'general_inquiry' | 'other';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo?: string;
  assignedToName?: string;
  documentId?: string;
  messageCount: number;
  lastMessageAt?: string;
  lastMessageBy?: 'user' | 'agent' | 'system';
  rating?: number;
  ratingComment?: string;
  ratedAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'agent' | 'system';
  timestamp: string;
}

export interface TicketStats {
  open: number;
  inProgress: number;
  resolved: number;
  total: number;
}

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
// SUPPORT TICKET API CALLS
// ============================================

/**
 * Create a support ticket
 */
export const createTicket = async (
  idToken: string,
  data: {
    subject: string;
    message: string;
    category?: TicketCategory;
    priority?: TicketPriority;
    documentId?: string;
  }
): Promise<{ ticket: SupportTicket }> => {
  const response = await fetch(`${API_URL}/api/support/tickets`, {
    method: 'POST',
    headers: await getAuthHeaders(idToken),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create ticket');
  }

  return response.json();
};

/**
 * Get tickets (users see own, agents see all)
 */
export const getTickets = async (
  idToken: string,
  filters?: {
    status?: string;
    category?: string;
    priority?: string;
    limit?: number;
    startAfter?: string;
  }
): Promise<{ tickets: SupportTicket[]; stats: TicketStats | null; count: number }> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.priority) params.append('priority', filters.priority);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.startAfter) params.append('startAfter', filters.startAfter);

  const queryString = params.toString();
  const url = `${API_URL}/api/support/tickets${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch tickets');
  }

  return response.json();
};

/**
 * Get ticket detail with messages
 */
export const getTicketDetail = async (
  idToken: string,
  ticketId: string
): Promise<{ ticket: SupportTicket; messages: TicketMessage[] }> => {
  const response = await fetch(`${API_URL}/api/support/tickets/${ticketId}`, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch ticket');
  }

  return response.json();
};

/**
 * Reply to a ticket
 */
export const replyToTicket = async (
  idToken: string,
  ticketId: string,
  content: string
): Promise<{ message: TicketMessage }> => {
  const response = await fetch(`${API_URL}/api/support/tickets/${ticketId}/reply`, {
    method: 'POST',
    headers: await getAuthHeaders(idToken),
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to reply to ticket');
  }

  return response.json();
};

/**
 * Update ticket status (agents only)
 */
export const updateTicketStatus = async (
  idToken: string,
  ticketId: string,
  status: TicketStatus,
  note?: string
): Promise<{ status: string }> => {
  const response = await fetch(`${API_URL}/api/support/tickets/${ticketId}/status`, {
    method: 'POST',
    headers: await getAuthHeaders(idToken),
    body: JSON.stringify({ status, note }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update ticket status');
  }

  return response.json();
};

/**
 * Assign ticket to agent
 */
export const assignTicket = async (
  idToken: string,
  ticketId: string,
  agentId?: string
): Promise<{ assignedTo: string; assignedToName: string }> => {
  const response = await fetch(`${API_URL}/api/support/tickets/${ticketId}/assign`, {
    method: 'POST',
    headers: await getAuthHeaders(idToken),
    body: JSON.stringify({ agentId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to assign ticket');
  }

  return response.json();
};

/**
 * Rate a resolved ticket
 */
export const rateTicket = async (
  idToken: string,
  ticketId: string,
  rating: number,
  comment?: string
): Promise<void> => {
  const response = await fetch(`${API_URL}/api/support/tickets/${ticketId}/rate`, {
    method: 'POST',
    headers: await getAuthHeaders(idToken),
    body: JSON.stringify({ rating, comment }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to rate ticket');
  }
};
