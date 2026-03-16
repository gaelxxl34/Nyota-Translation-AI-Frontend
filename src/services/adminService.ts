// Admin Service for NTC
// API calls for admin dashboard functionality

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Helper to get auth headers
const getAuthHeaders = async (idToken: string) => ({
  'Authorization': `Bearer ${idToken}`,
  'Content-Type': 'application/json',
});

// User types
export interface User {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  role: 'superadmin' | 'translator' | 'partner' | 'support' | 'user';
  isActive: boolean;
  partnerId?: string;
  partnerName?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  displayName: string;
  role: string;
  phoneNumber?: string;
  partnerId?: string;
  partnerName?: string;
}

export interface UserStats {
  total: number;
  byRole: Record<string, number>;
  active: number;
  inactive: number;
}

// Commission tier for partners
export interface CommissionTier {
  minStudents: number;
  maxStudents: number | null; // null means unlimited
  percentage: number;
}

// Partner types
export interface Partner {
  id: string;
  partnerId: string;
  name: string;
  shortCode: string;
  type: 'university' | 'highschool' | 'organization' | 'individual';
  email?: string;
  phone?: string;
  address?: string;
  adminUsers: string[];
  logo?: string;
  primaryColor: string;
  stats: {
    totalStudents: number;
    documentsThisMonth: number;
    documentsTotal: number;
  };
  pricing: {
    discountPercent: number;
    bulkRates: boolean;
  };
  // Commission settings
  commissionEnabled: boolean;
  commissionTiers: CommissionTier[];
  isActive: boolean;
  createdAt: string;
}

export interface CreatePartnerData {
  name: string;
  shortCode: string;
  type: 'university' | 'highschool' | 'organization' | 'individual';
  email?: string;
  phone?: string;
  address?: string;
  // Commission settings (optional)
  commissionEnabled?: boolean;
  commissionTiers?: CommissionTier[];
}

// Analytics types
export interface SystemAnalytics {
  users: UserStats;
  documents: {
    total: number;
    byStatus: Record<string, number>;
    byFormType: Record<string, number>;
  };
  partners: {
    total: number;
    active: number;
  };
  generatedAt: string;
}

// ============================================
// USER MANAGEMENT
// ============================================

export const getUsers = async (
  idToken: string,
  filters?: { role?: string; isActive?: boolean; limit?: number }
): Promise<User[]> => {
  const params = new URLSearchParams();
  if (filters?.role) params.append('role', filters.role);
  if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
  if (filters?.limit) params.append('limit', String(filters.limit));

  const response = await fetch(
    `${API_URL}/api/admin/users?${params.toString()}`,
    { headers: await getAuthHeaders(idToken) }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch users');
  }

  const data = await response.json();
  return data.users;
};

export const getUserStats = async (idToken: string): Promise<UserStats> => {
  const response = await fetch(
    `${API_URL}/api/admin/users/stats`,
    { headers: await getAuthHeaders(idToken) }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch user stats');
  }

  const data = await response.json();
  return data.stats;
};

export const getUserById = async (idToken: string, uid: string): Promise<User> => {
  const response = await fetch(
    `${API_URL}/api/admin/users/${uid}`,
    { headers: await getAuthHeaders(idToken) }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch user');
  }

  const data = await response.json();
  return data.user;
};

export const createUser = async (
  idToken: string,
  userData: CreateUserData
): Promise<User> => {
  const response = await fetch(`${API_URL}/api/admin/users`, {
    method: 'POST',
    headers: await getAuthHeaders(idToken),
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create user');
  }

  const data = await response.json();
  return data.user;
};

export const updateUserRole = async (
  idToken: string,
  uid: string,
  role: string
): Promise<User> => {
  const response = await fetch(`${API_URL}/api/admin/users/${uid}/role`, {
    method: 'PATCH',
    headers: await getAuthHeaders(idToken),
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update user role');
  }

  const data = await response.json();
  return data.user;
};

export const deactivateUser = async (idToken: string, uid: string): Promise<User> => {
  const response = await fetch(`${API_URL}/api/admin/users/${uid}/deactivate`, {
    method: 'PATCH',
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to deactivate user');
  }

  const data = await response.json();
  return data.user;
};

export const reactivateUser = async (idToken: string, uid: string): Promise<User> => {
  const response = await fetch(`${API_URL}/api/admin/users/${uid}/reactivate`, {
    method: 'PATCH',
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to reactivate user');
  }

  const data = await response.json();
  return data.user;
};

export const deleteUser = async (idToken: string, uid: string): Promise<{ deletedData: Record<string, unknown> }> => {
  const response = await fetch(`${API_URL}/api/admin/users/${uid}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete user');
  }

  return response.json();
};

// ============================================
// PARTNER MANAGEMENT
// ============================================

export const getPartners = async (idToken: string): Promise<Partner[]> => {
  const response = await fetch(`${API_URL}/api/admin/partners`, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch partners');
  }

  const data = await response.json();
  return data.partners;
};

export const getPartnerById = async (idToken: string, partnerId: string): Promise<Partner> => {
  const response = await fetch(`${API_URL}/api/admin/partners/${partnerId}`, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch partner');
  }

  const data = await response.json();
  return data.partner;
};

export const createPartner = async (
  idToken: string,
  partnerData: CreatePartnerData
): Promise<Partner> => {
  const response = await fetch(`${API_URL}/api/admin/partners`, {
    method: 'POST',
    headers: await getAuthHeaders(idToken),
    body: JSON.stringify(partnerData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create partner');
  }

  const data = await response.json();
  return data.partner;
};

export const updatePartner = async (
  idToken: string,
  partnerId: string,
  updates: Partial<Partner>
): Promise<Partner> => {
  const response = await fetch(`${API_URL}/api/admin/partners/${partnerId}`, {
    method: 'PATCH',
    headers: await getAuthHeaders(idToken),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update partner');
  }

  const data = await response.json();
  return data.partner;
};

// ============================================
// ANALYTICS
// ============================================

export const getSystemAnalytics = async (idToken: string): Promise<SystemAnalytics> => {
  const response = await fetch(`${API_URL}/api/admin/analytics/overview`, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch analytics');
  }

  const data = await response.json();
  return data.analytics;
};

export const getAvailableRoles = async (idToken: string): Promise<{ roles: string[]; permissions: string[] }> => {
  const response = await fetch(`${API_URL}/api/admin/roles`, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch roles');
  }

  const data = await response.json();
  return { roles: data.roles, permissions: data.permissions };
};

// ============================================
// ACTIVITY LOGS
// ============================================

export interface ActivityLog {
  id: string;
  action: string;
  performedBy: string;
  performedByEmail: string | null;
  targetId: string | null;
  targetType: string | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export const getActivityLogs = async (
  idToken: string,
  filters?: { action?: string; targetType?: string; limit?: number; startAfter?: string }
): Promise<ActivityLog[]> => {
  const params = new URLSearchParams();
  if (filters?.action) params.append('action', filters.action);
  if (filters?.targetType) params.append('targetType', filters.targetType);
  if (filters?.limit) params.append('limit', String(filters.limit));
  if (filters?.startAfter) params.append('startAfter', filters.startAfter);

  const response = await fetch(
    `${API_URL}/api/admin/logs?${params.toString()}`,
    { headers: await getAuthHeaders(idToken) }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch activity logs');
  }

  const data = await response.json();
  return data.logs;
};

// ============================================
// DOCUMENTS
// ============================================

export interface AdminDocument {
  id: string;
  studentName: string;
  formType: string;
  status: string;
  userId: string | null;
  userEmail: string | null;
  uploadedAt: string | null;
  certificationId: string | null;
  isCertified: boolean;
}

export const getDocuments = async (
  idToken: string,
  filters?: { status?: string; formType?: string; userId?: string; limit?: number; startAfter?: string }
): Promise<AdminDocument[]> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.formType) params.append('formType', filters.formType);
  if (filters?.userId) params.append('userId', filters.userId);
  if (filters?.limit) params.append('limit', String(filters.limit));
  if (filters?.startAfter) params.append('startAfter', filters.startAfter);

  const response = await fetch(
    `${API_URL}/api/admin/documents?${params.toString()}`,
    { headers: await getAuthHeaders(idToken) }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch documents');
  }

  const data = await response.json();
  return data.documents;
};

export const deleteDocument = async (idToken: string, id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/admin/documents/${id}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete document');
  }
};

// ============================================
// SETTINGS
// ============================================

export interface SystemSettings {
  pricePerDocument: number;
  currency: string;
  aiProvider: 'openai' | 'anthropic';
  aiModel: string;
  maxFileSize: number;
  allowedFileTypes: string[];
  maintenanceMode: boolean;
  emailNotifications: boolean;
}

export const getSettings = async (idToken: string): Promise<SystemSettings> => {
  const response = await fetch(`${API_URL}/api/admin/settings`, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch settings');
  }

  const data = await response.json();
  return data.settings;
};

export const updateSettings = async (
  idToken: string,
  updates: Partial<SystemSettings>
): Promise<SystemSettings> => {
  const response = await fetch(`${API_URL}/api/admin/settings`, {
    method: 'PATCH',
    headers: await getAuthHeaders(idToken),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update settings');
  }

  const data = await response.json();
  return data.settings;
};

// ============================================
// PAYMENT SETTINGS
// ============================================

export interface PricingTier {
  amount: number;
  currency: string;
  label: string;
}

export interface PaymentSettings {
  stripeSecretKey: string;
  stripePublishableKey: string;
  stripeWebhookSecret: string;
  paymentsEnabled: boolean;
  pricing: {
    standard: PricingTier;
    rush: PricingTier;
    express: PricingTier;
  };
  hasSecretKey: boolean;
  hasPublishableKey: boolean;
  hasWebhookSecret: boolean;
}

export interface StripeTestResult {
  success: boolean;
  message: string;
  account?: {
    id: string;
    country: string;
    defaultCurrency: string;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
  };
  error?: string;
}

export const getPaymentSettings = async (idToken: string): Promise<PaymentSettings> => {
  const response = await fetch(`${API_URL}/api/admin/payment-settings`, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch payment settings');
  }

  const data = await response.json();
  return data.paymentSettings;
};

export const updatePaymentSettings = async (
  idToken: string,
  updates: {
    stripeSecretKey?: string;
    stripePublishableKey?: string;
    stripeWebhookSecret?: string;
    paymentsEnabled?: boolean;
    pricing?: {
      standard?: PricingTier;
      rush?: PricingTier;
      express?: PricingTier;
    };
  }
): Promise<void> => {
  const response = await fetch(`${API_URL}/api/admin/payment-settings`, {
    method: 'PATCH',
    headers: await getAuthHeaders(idToken),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update payment settings');
  }
};

export const testStripeConnection = async (idToken: string): Promise<StripeTestResult> => {
  const response = await fetch(`${API_URL}/api/admin/payment-settings/test`, {
    method: 'POST',
    headers: await getAuthHeaders(idToken),
  });

  const data = await response.json();
  return data;
};

// ============================================
// USER SEARCH
// ============================================

export const searchUsers = async (idToken: string, query: string): Promise<User[]> => {
  const params = new URLSearchParams({ q: query });

  const response = await fetch(
    `${API_URL}/api/admin/users/search?${params.toString()}`,
    { headers: await getAuthHeaders(idToken) }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to search users');
  }

  const data = await response.json();
  return data.users;
};

// ============================================
// TRANSLATOR MANAGEMENT
// ============================================

export interface AdminTranslator {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  isActive: boolean;
  role: string;
  createdAt: string | null;
  assignedCount: number;
  approvedCount: number;
}

export interface QueueDocument {
  id: string;
  studentName: string;
  formType: string;
  status: string;
  assignedTo: string | null;
  assignedToName: string | null;
  userEmail: string;
  source: 'documents' | 'certifiedDocuments';
  createdAt: string;
}

export const getTranslators = async (idToken: string): Promise<AdminTranslator[]> => {
  const response = await fetch(`${API_URL}/api/admin/translators`, {
    headers: await getAuthHeaders(idToken),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch translators');
  }
  const data = await response.json();
  return data.translators;
};

export const getTranslatorDocuments = async (
  idToken: string,
  translatorUid: string
): Promise<{ id: string; studentName: string; formType: string; status: string; source: string; assignedAt: string; createdAt: string }[]> => {
  const response = await fetch(`${API_URL}/api/admin/translators/${encodeURIComponent(translatorUid)}/documents`, {
    headers: await getAuthHeaders(idToken),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch translator documents');
  }
  const data = await response.json();
  return data.documents;
};

export const assignDocument = async (
  idToken: string,
  docId: string,
  translatorUid: string
): Promise<void> => {
  const response = await fetch(`${API_URL}/api/admin/documents/${encodeURIComponent(docId)}/assign`, {
    method: 'POST',
    headers: await getAuthHeaders(idToken),
    body: JSON.stringify({ translatorUid }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to assign document');
  }
};

export const unassignDocument = async (
  idToken: string,
  docId: string
): Promise<void> => {
  const response = await fetch(`${API_URL}/api/admin/documents/${encodeURIComponent(docId)}/unassign`, {
    method: 'POST',
    headers: await getAuthHeaders(idToken),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to unassign document');
  }
};

export const getAdminQueue = async (
  idToken: string,
  filters?: { status?: string; limit?: number }
): Promise<QueueDocument[]> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  const qs = params.toString();

  const response = await fetch(`${API_URL}/api/admin/queue${qs ? `?${qs}` : ''}`, {
    headers: await getAuthHeaders(idToken),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch queue');
  }
  const data = await response.json();
  return data.documents;
};

// ============================================
// ORPHAN DATA MANAGEMENT
// ============================================

export interface OrphanItem {
  id: string;
  collection: 'bulletins' | 'certifiedDocuments' | 'documents';
  type: 'no_user' | 'inactive';
  reason: string;
  studentName: string;
  formType: string;
  createdAt: string;
  userId?: string | null;
  userEmail?: string | null;
  isActive: boolean;
}

export interface OrphanSummary {
  total: number;
  byType: { no_user: number; inactive: number };
  byCollection: { bulletins: number; certifiedDocuments: number; documents: number };
}

export const scanOrphanData = async (
  idToken: string
): Promise<{ orphans: OrphanItem[]; summary: OrphanSummary }> => {
  const response = await fetch(`${API_URL}/api/admin/orphans`, {
    headers: await getAuthHeaders(idToken),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to scan orphan data');
  }
  const data = await response.json();
  return { orphans: data.orphans, summary: data.summary };
};

export const deleteOrphanItem = async (
  idToken: string,
  collection: string,
  id: string,
  type?: string
): Promise<void> => {
  const url = `${API_URL}/api/admin/orphans/${encodeURIComponent(collection)}/${encodeURIComponent(id)}${type ? `?type=${type}` : ''}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: await getAuthHeaders(idToken),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete orphan item');
  }
};

export const bulkDeleteOrphans = async (
  idToken: string,
  items: Array<{ collection: string; id: string }>
): Promise<{ deletedCount: number }> => {
  const response = await fetch(`${API_URL}/api/admin/orphans/bulk-delete`, {
    method: 'POST',
    headers: await getAuthHeaders(idToken),
    body: JSON.stringify({ items }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to bulk delete orphans');
  }
  return response.json();
};

// ============================================
// PROMO CODE MANAGEMENT
// ============================================

export interface PromoCode {
  id: string;
  code: string;
  partnerId: string;
  partnerName: string;
  type: 'percentage' | 'flat';
  value: number;
  maxUses: number | null;
  currentUses: number;
  validFrom: string | null;
  validUntil: string | null;
  applicableTo: string[];
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePromoCodeData {
  code: string;
  partnerId: string;
  type: 'percentage' | 'flat';
  value: number;
  maxUses?: number | null;
  validFrom?: string | null;
  validUntil?: string | null;
  applicableTo?: string[];
  description?: string;
}

export const getPromoCodes = async (
  idToken: string,
  filters?: { partnerId?: string; isActive?: boolean; type?: string }
): Promise<PromoCode[]> => {
  const params = new URLSearchParams();
  if (filters?.partnerId) params.append('partnerId', filters.partnerId);
  if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
  if (filters?.type) params.append('type', filters.type);

  const response = await fetch(
    `${API_URL}/api/admin/promo-codes?${params.toString()}`,
    { headers: await getAuthHeaders(idToken) }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch promo codes');
  }

  const data = await response.json();
  return data.promoCodes;
};

export const createPromoCode = async (
  idToken: string,
  promoData: CreatePromoCodeData
): Promise<PromoCode> => {
  const response = await fetch(`${API_URL}/api/admin/promo-codes`, {
    method: 'POST',
    headers: await getAuthHeaders(idToken),
    body: JSON.stringify(promoData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create promo code');
  }

  const data = await response.json();
  return data.promoCode;
};

export const updatePromoCode = async (
  idToken: string,
  promoCodeId: string,
  updates: Partial<PromoCode>
): Promise<PromoCode> => {
  const response = await fetch(`${API_URL}/api/admin/promo-codes/${promoCodeId}`, {
    method: 'PATCH',
    headers: await getAuthHeaders(idToken),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update promo code');
  }

  const data = await response.json();
  return data.promoCode;
};

export const deletePromoCode = async (
  idToken: string,
  promoCodeId: string
): Promise<void> => {
  const response = await fetch(`${API_URL}/api/admin/promo-codes/${promoCodeId}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete promo code');
  }
};

// ============================================
// ADMIN PAYMENTS & INVOICES
// ============================================

export interface AdminPayment {
  id: string;
  userId: string;
  userEmail: string;
  certDocId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  speedTier: string;
  formType: string;
  documentTitle: string | null;
  status: string;
  failureReason: string | null;
  invoiceId: string | null;
  createdAt: string | null;
  completedAt: string | null;
}

export interface AdminPaymentStats {
  totalRevenue: number;
  totalTransactions: number;
  byTier: { standard: number; rush: number; express: number };
  byMonth: Record<string, number>;
}

export const getAdminPayments = async (
  idToken: string,
  filters?: { limit?: number; status?: string }
): Promise<AdminPayment[]> => {
  const params = new URLSearchParams();
  if (filters?.limit) params.append('limit', String(filters.limit));
  if (filters?.status) params.append('status', filters.status);

  const response = await fetch(
    `${API_URL}/api/payments/admin/all?${params.toString()}`,
    { headers: await getAuthHeaders(idToken) }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch payments');
  }

  const data = await response.json();
  return data.payments;
};

export const getAdminPaymentStats = async (idToken: string): Promise<AdminPaymentStats> => {
  const response = await fetch(
    `${API_URL}/api/payments/admin/stats`,
    { headers: await getAuthHeaders(idToken) }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch payment stats');
  }

  const data = await response.json();
  return data.stats;
};
