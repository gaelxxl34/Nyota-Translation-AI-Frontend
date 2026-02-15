// Partner Service for NTC
// API calls for partner dashboard functionality

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Helper to get auth headers
const getAuthHeaders = async (idToken: string) => ({
  'Authorization': `Bearer ${idToken}`,
  'Content-Type': 'application/json',
});

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
  commissionEnabled: boolean;
  commissionTiers: Array<{
    minStudents: number;
    maxStudents: number | null;
    percentage: number;
  }>;
  isActive: boolean;
  createdAt: string;
}

export interface PartnerDocument {
  id: string;
  userId: string;
  userEmail: string;
  formType: string;
  status: string;
  studentName?: string;
  schoolName?: string;
  className?: string;
  academicYear?: string;
  createdAt: string;
  approvedAt?: string;
  pdfUrl?: string;
}

export interface PartnerDocumentDetail extends PartnerDocument {
  extractedData?: Record<string, unknown>;
  translatedData?: Record<string, unknown>;
  originalFileUrl?: string;
  approvedByName?: string;
}

export interface PartnerStats {
  totalDocuments: number;
  documentsInPeriod: number;
  byStatus: Record<string, number>;
  byFormType: Record<string, number>;
  byMonth: Array<{ month: string; count: number }>;
  uniqueStudents: number;
  approvedDocuments: number;
  pendingDocuments: number;
}

export interface UsageStats {
  month: number;
  year: number;
  totalDocuments: number;
  byFormType: Record<string, number>;
  byDay: Record<number, number>;
  estimatedCost: number;
  discountPercent?: number;
  discountAmount?: number;
  finalCost: number;
}

export interface Student {
  id: string;
  email: string;
  name: string;
  documentsCount: number;
  lastDocument: string;
}

export interface DocumentsReport {
  generatedAt: string;
  totalDocuments: number;
  filters: {
    startDate?: string;
    endDate?: string;
    status?: string;
    formType?: string;
  };
  documents: PartnerDocument[];
}

export interface SummaryReport {
  partner: {
    name: string;
    shortCode: string;
    type: string;
  } | null;
  period: {
    month: number;
    year: number;
    monthName: string;
  };
  totals: {
    documents: number;
    byStatus: Record<string, number>;
    byFormType: Record<string, number>;
  };
  uniqueStudents: number;
}

// ============================================
// PROFILE API CALLS
// ============================================

/**
 * Get partner profile
 */
export const getPartnerProfile = async (idToken: string): Promise<Partner | null> => {
  const response = await fetch(`${API_URL}/api/partner/profile`, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch partner profile');
  }

  const data = await response.json();
  return data.partner;
};

// ============================================
// DOCUMENTS API CALLS
// ============================================

/**
 * Get partner documents
 */
export const getPartnerDocuments = async (
  idToken: string,
  filters?: {
    status?: string;
    formType?: string;
    search?: string;
    limit?: number;
    startAfter?: string;
    startDate?: string;
    endDate?: string;
  }
): Promise<{ documents: PartnerDocument[]; count: number }> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.formType) params.append('formType', filters.formType);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.startAfter) params.append('startAfter', filters.startAfter);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const queryString = params.toString();
  const url = `${API_URL}/api/partner/documents${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch documents');
  }

  return response.json();
};

/**
 * Get single document detail
 */
export const getDocumentDetail = async (
  idToken: string,
  docId: string
): Promise<PartnerDocumentDetail> => {
  const response = await fetch(`${API_URL}/api/partner/documents/${docId}`, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch document');
  }

  const data = await response.json();
  return data.document;
};

// ============================================
// STATISTICS API CALLS
// ============================================

/**
 * Get partner statistics
 */
export const getPartnerStats = async (
  idToken: string,
  period?: 'week' | 'month' | 'quarter' | 'year'
): Promise<PartnerStats> => {
  const url = period
    ? `${API_URL}/api/partner/stats?period=${period}`
    : `${API_URL}/api/partner/stats`;

  const response = await fetch(url, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch statistics');
  }

  const data = await response.json();
  return data.stats;
};

/**
 * Get usage statistics for billing
 */
export const getUsageStats = async (
  idToken: string,
  month?: number,
  year?: number
): Promise<UsageStats> => {
  const params = new URLSearchParams();
  if (month) params.append('month', month.toString());
  if (year) params.append('year', year.toString());

  const queryString = params.toString();
  const url = `${API_URL}/api/partner/stats/usage${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch usage statistics');
  }

  const data = await response.json();
  return data.usage;
};

// ============================================
// REPORTS API CALLS
// ============================================

/**
 * Get documents report
 */
export const getDocumentsReport = async (
  idToken: string,
  filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    formType?: string;
  }
): Promise<DocumentsReport> => {
  const params = new URLSearchParams();
  params.append('format', 'json');
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.formType) params.append('formType', filters.formType);

  const url = `${API_URL}/api/partner/reports/documents?${params.toString()}`;

  const response = await fetch(url, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate report');
  }

  const data = await response.json();
  return data.report;
};

/**
 * Download documents report as CSV
 */
export const downloadDocumentsCSV = async (
  idToken: string,
  filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    formType?: string;
  }
): Promise<void> => {
  const params = new URLSearchParams();
  params.append('format', 'csv');
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.formType) params.append('formType', filters.formType);

  const url = `${API_URL}/api/partner/reports/documents?${params.toString()}`;

  const response = await fetch(url, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    throw new Error('Failed to download report');
  }

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `documents-report-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
};

/**
 * Get summary report
 */
export const getSummaryReport = async (
  idToken: string,
  month?: number,
  year?: number
): Promise<SummaryReport> => {
  const params = new URLSearchParams();
  if (month) params.append('month', month.toString());
  if (year) params.append('year', year.toString());

  const queryString = params.toString();
  const url = `${API_URL}/api/partner/reports/summary${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to generate summary report');
  }

  const data = await response.json();
  return data.summary;
};

// ============================================
// BRANDING API CALLS
// ============================================

/**
 * Update partner branding
 */
export const updateBranding = async (
  idToken: string,
  data: { logo?: string; primaryColor?: string }
): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_URL}/api/partner/branding`, {
    method: 'PUT',
    headers: await getAuthHeaders(idToken),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update branding');
  }

  return response.json();
};

// ============================================
// STUDENTS API CALLS
// ============================================

/**
 * Get partner students
 */
export const getPartnerStudents = async (
  idToken: string,
  options?: { limit?: number; search?: string }
): Promise<{ students: Student[]; count: number }> => {
  const params = new URLSearchParams();
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.search) params.append('search', options.search);

  const queryString = params.toString();
  const url = `${API_URL}/api/partner/students${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    headers: await getAuthHeaders(idToken),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch students');
  }

  return response.json();
};
