// Admin Dashboard Component
// Displays comprehensive statistics about document translations, users, and revenue

import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthProvider';
import { useTranslation } from 'react-i18next';
import { SEOHead, LanguageSwitcher, AuthNavigation } from '../components/common';
import type { NavigateToPage } from '../App';

interface DashboardPageProps {
  onNavigate: NavigateToPage;
}

interface DocumentStats {
  totalDocuments: number;
  totalRevenue: number;
  pricePerDocument: number;
  documentsByUser: UserStats[];
  documentsByFormType: Record<string, number>;
  recentDocuments: RecentDocument[];
  isAdmin: boolean;
}

interface UserStats {
  userId: string;
  email: string;
  count: number;
  revenue: number;
  documents?: DocumentInfo[];
}

interface DocumentInfo {
  id: string;
  studentName: string;
  formType: string;
  uploadedAt: Date;
}

interface RecentDocument {
  id: string;
  studentName: string;
  formType: string;
  uploadedAt: string;
  userEmail?: string;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { i18n } = useTranslation();

  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  // Set French as default language
  useEffect(() => {
    if (i18n.language !== 'fr') {
      i18n.changeLanguage('fr');
    }
  }, [i18n]);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser) {
        onNavigate('login');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const idToken = await currentUser.getIdToken();
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/dashboard/stats`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch statistics: ${response.statusText}`);
        }

        const result = await response.json();
        if (result.success) {
          setStats(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch statistics');
        }
      } catch (err) {
        console.error('❌ Failed to fetch dashboard stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [currentUser, onNavigate]);

  const toggleUserExpansion = (userId: string) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFormTypeLabel = (formType: string) => {
    const labels: Record<string, string> = {
      form4: 'Form 4',
      form6: 'Form 6',
      collegeTranscript: 'College Transcript',
      collegeAttestation: 'College Attestation',
      stateDiploma: 'State Diploma',
      bachelorDiploma: 'Bachelor Diploma',
      highSchoolAttestation: 'High School Attestation',
      stateExamAttestation: 'State Exam Attestation',
      generalDocument: 'General Document',
    };
    return labels[formType] || formType;
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="Dashboard - Nyota Translation Center | Statistics & Analytics"
        description="View comprehensive statistics about document translations, user activity, and revenue"
        keywords="dashboard, statistics, analytics, translations, revenue"
      />

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onNavigate('dashboard')}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                ← Back to Documents
              </button>
              <h1 className="text-2xl font-bold text-gray-900">📊 Dashboard Statistics</h1>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <AuthNavigation onNavigate={onNavigate} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <span className="ml-4 text-gray-600">Loading statistics...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Documents */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Documents</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalDocuments}</p>
                  </div>
                  <div className="bg-blue-100 rounded-full p-3">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Documents translated</p>
              </div>

              {/* Total Users */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stats.isAdmin ? 'Total Users' : 'Your Account'}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.documentsByUser.length}
                    </p>
                  </div>
                  <div className="bg-green-100 rounded-full p-3">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Active users</p>
              </div>

              {/* Total Revenue */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {formatCurrency(stats.totalRevenue)}
                    </p>
                  </div>
                  <div className="bg-yellow-100 rounded-full p-3">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  @ {formatCurrency(stats.pricePerDocument)} per document
                </p>
              </div>
            </div>

            {/* Documents by Form Type */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📑 Documents by Type</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.documentsByFormType).map(([formType, count]) => (
                  <div key={formType} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">{getFormTypeLabel(formType)}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Users and Documents */}
            {stats.isAdmin && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">👥 Users & Activity</h2>
                <div className="space-y-4">
                  {stats.documentsByUser.map((user) => (
                    <div key={user.userId} className="border border-gray-200 rounded-lg p-4">
                      <div 
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleUserExpansion(user.userId)}
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{user.email}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {user.count} document{user.count !== 1 ? 's' : ''} • {formatCurrency(user.revenue)}
                          </p>
                        </div>
                        <svg 
                          className={`w-5 h-5 text-gray-400 transform transition-transform ${
                            expandedUsers.has(user.userId) ? 'rotate-180' : ''
                          }`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      
                      {expandedUsers.has(user.userId) && user.documents && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm font-medium text-gray-700 mb-2">Documents:</p>
                          <div className="space-y-2">
                            {user.documents.map((doc) => (
                              <div key={doc.id} className="bg-gray-50 rounded p-3 text-sm">
                                <p className="font-medium text-gray-900">{doc.studentName}</p>
                                <p className="text-gray-600">
                                  {getFormTypeLabel(doc.formType)} • {formatDate(doc.uploadedAt.toString())}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Documents */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">🕒 Recent Activity</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Document Type
                      </th>
                      {stats.isAdmin && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.recentDocuments.map((doc) => (
                      <tr key={doc.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {doc.studentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {getFormTypeLabel(doc.formType)}
                        </td>
                        {stats.isAdmin && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {doc.userEmail}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(doc.uploadedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default DashboardPage;
