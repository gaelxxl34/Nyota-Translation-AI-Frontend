// Custom hooks for partner functionality
// Provides documents, statistics, and reports access for partner organizations

import { useState, useCallback } from 'react';
import { useAuth } from '../AuthProvider';
import * as partnerService from '../services/partnerService';
import type {
  Partner,
  PartnerDocument,
  PartnerDocumentDetail,
  PartnerStats,
  UsageStats,
  Student,
  DocumentsReport,
  SummaryReport,
} from '../services/partnerService';

// Re-export types for convenience
export type {
  Partner,
  PartnerDocument,
  PartnerDocumentDetail,
  PartnerStats,
  UsageStats,
  Student,
  DocumentsReport,
  SummaryReport,
};

// Additional types for reports UI
export interface PartnerReportConfig {
  reportType: 'document_summary' | 'student_activity' | 'monthly_usage' | 'translation_status';
  startDate: string;
  endDate: string;
  format: 'pdf' | 'csv';
  includeDetails?: boolean;
  status?: string;
  formType?: string;
}

export interface PartnerReportItem {
  id: string;
  reportType: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  format?: string;
  generatedAt?: string;
  downloadUrl?: string;
}

/**
 * Hook for partner profile management
 */
export const usePartnerProfile = () => {
  const { idToken } = useAuth();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!idToken) return;
    setLoading(true);
    setError(null);
    try {
      const result = await partnerService.getPartnerProfile(idToken);
      setPartner(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      console.error('Error fetching partner profile:', err);
    } finally {
      setLoading(false);
    }
  }, [idToken]);

  const updateBranding = useCallback(
    async (data: { logo?: string; primaryColor?: string }) => {
      if (!idToken) return false;
      setLoading(true);
      setError(null);
      try {
        await partnerService.updateBranding(idToken, data);
        // Refresh profile after update
        await fetchProfile();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update branding');
        console.error('Error updating branding:', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [idToken, fetchProfile]
  );

  return {
    partner,
    loading,
    error,
    fetchProfile,
    updateBranding,
  };
};

/**
 * Hook for partner documents management
 */
export const usePartnerDocuments = () => {
  const { idToken } = useAuth();
  const [documents, setDocuments] = useState<PartnerDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<PartnerDocumentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(
    async (filters?: {
      status?: string;
      formType?: string;
      search?: string;
      limit?: number;
      startDate?: string;
      endDate?: string;
    }) => {
      if (!idToken) return;
      setLoading(true);
      setError(null);
      try {
        const result = await partnerService.getPartnerDocuments(idToken, filters);
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

  const fetchDocumentDetail = useCallback(
    async (docId: string) => {
      if (!idToken) return;
      setLoading(true);
      setError(null);
      try {
        const result = await partnerService.getDocumentDetail(idToken, docId);
        setSelectedDocument(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch document');
        console.error('Error fetching document detail:', err);
      } finally {
        setLoading(false);
      }
    },
    [idToken]
  );

  const clearSelectedDocument = useCallback(() => {
    setSelectedDocument(null);
  }, []);

  return {
    documents,
    selectedDocument,
    loading,
    error,
    fetchDocuments,
    fetchDocumentDetail,
    clearSelectedDocument,
  };
};

/**
 * Hook for partner statistics
 */
export const usePartnerStats = () => {
  const { idToken } = useAuth();
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(
    async (period?: 'week' | 'month' | 'quarter' | 'year') => {
      if (!idToken) return;
      setLoading(true);
      setError(null);
      try {
        const result = await partnerService.getPartnerStats(idToken, period);
        setStats(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    },
    [idToken]
  );

  const fetchUsageStats = useCallback(
    async (month?: number, year?: number) => {
      if (!idToken) return;
      setLoading(true);
      setError(null);
      try {
        const result = await partnerService.getUsageStats(idToken, month, year);
        setUsageStats(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch usage statistics');
        console.error('Error fetching usage stats:', err);
      } finally {
        setLoading(false);
      }
    },
    [idToken]
  );

  return {
    stats,
    usageStats,
    loading,
    error,
    fetchStats,
    fetchUsageStats,
  };
};

/**
 * Hook for partner reports
 */
export const usePartnerReports = () => {
  const { idToken } = useAuth();
  const [documentsReport, setDocumentsReport] = useState<DocumentsReport | null>(null);
  const [summaryReport, setSummaryReport] = useState<SummaryReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocumentsReport = useCallback(
    async (filters?: {
      startDate?: string;
      endDate?: string;
      status?: string;
      formType?: string;
    }) => {
      if (!idToken) return;
      setLoading(true);
      setError(null);
      try {
        const result = await partnerService.getDocumentsReport(idToken, filters);
        setDocumentsReport(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate report');
        console.error('Error fetching documents report:', err);
      } finally {
        setLoading(false);
      }
    },
    [idToken]
  );

  const downloadCSV = useCallback(
    async (filters?: {
      startDate?: string;
      endDate?: string;
      status?: string;
      formType?: string;
    }) => {
      if (!idToken) return;
      setDownloading(true);
      setError(null);
      try {
        await partnerService.downloadDocumentsCSV(idToken, filters);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to download report');
        console.error('Error downloading CSV:', err);
      } finally {
        setDownloading(false);
      }
    },
    [idToken]
  );

  const fetchSummaryReport = useCallback(
    async (month?: number, year?: number) => {
      if (!idToken) return;
      setLoading(true);
      setError(null);
      try {
        const result = await partnerService.getSummaryReport(idToken, month, year);
        setSummaryReport(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate summary report');
        console.error('Error fetching summary report:', err);
      } finally {
        setLoading(false);
      }
    },
    [idToken]
  );

  return {
    documentsReport,
    summaryReport,
    loading,
    downloading,
    error,
    fetchDocumentsReport,
    downloadCSV,
    fetchSummaryReport,
  };
};

/**
 * Hook for partner students
 */
export const usePartnerStudents = () => {
  const { idToken } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(
    async (options?: { limit?: number; search?: string }) => {
      if (!idToken) return;
      setLoading(true);
      setError(null);
      try {
        const result = await partnerService.getPartnerStudents(idToken, options);
        setStudents(result.students);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch students');
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    },
    [idToken]
  );

  return {
    students,
    loading,
    error,
    fetchStudents,
  };
};
