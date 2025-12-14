// Admin Service for NTC
// API calls for admin dashboard functionality

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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
  type: 'university' | 'highschool' | 'organization';
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
  type: 'university' | 'highschool' | 'organization';
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
