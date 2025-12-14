// Partner Dashboard Page
// Main dashboard for partners to view their students' documents, reports, and statistics

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthProvider';
import { StudentDocuments, PartnerReports, PartnerStats } from '../../components/partner';
import {
  usePartnerProfile,
  usePartnerDocuments,
  usePartnerStats,
  usePartnerReports,
} from '../../hooks/usePartner';
import type { PartnerReportConfig, PartnerReportItem } from '../../hooks/usePartner';

type TabType = 'documents' | 'reports' | 'statistics' | 'settings';

const PartnerDashboardPage: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('documents');

  // Local state for filters
  const [statusFilter, setStatusFilter] = useState('');
  const [formTypeFilter, setFormTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Local state for reports
  const [generatedReports, setGeneratedReports] = useState<PartnerReportItem[]>([]);
  const [generating, setGenerating] = useState(false);

  // Hooks for data fetching
  const { partner, loading: _profileLoading, fetchProfile, updateBranding } = usePartnerProfile();
  const {
    documents,
    selectedDocument,
    loading: documentsLoading,
    fetchDocuments,
    fetchDocumentDetail,
    clearSelectedDocument,
  } = usePartnerDocuments();
  const { stats, loading: statsLoading, fetchStats } = usePartnerStats();
  const {
    documentsReport: _documentsReport,
    loading: reportsLoading,
    downloading: _downloading,
    fetchDocumentsReport,
    downloadCSV,
  } = usePartnerReports();

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [brandingForm, setBrandingForm] = useState({
    logo: '',
    primaryColor: '#3B82F6',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, [fetchProfile, fetchStats]);

  // Fetch documents when filters change
  useEffect(() => {
    fetchDocuments({
      status: statusFilter || undefined,
      formType: formTypeFilter || undefined,
      search: searchQuery || undefined,
    });
  }, [fetchDocuments, statusFilter, formTypeFilter, searchQuery]);

  // Initialize settings form when partner profile loads
  useEffect(() => {
    if (partner) {
      setSettingsForm({
        name: partner.name || '',
        email: partner.email || '',
        phone: partner.phone || '',
        address: partner.address || '',
      });
      setBrandingForm({
        logo: partner.logo || '',
        primaryColor: partner.primaryColor || '#3B82F6',
      });
    }
  }, [partner]);

  // Handle document selection
  const handleSelectDocument = (docId: string) => {
    fetchDocumentDetail(docId);
  };

  // Handle report generation
  const handleGenerateReport = async (config: PartnerReportConfig) => {
    setGenerating(true);
    try {
      await fetchDocumentsReport({
        startDate: config.startDate,
        endDate: config.endDate,
        status: config.status,
        formType: config.formType,
      });
      // Add to generated reports list
      const newReport: PartnerReportItem = {
        id: Date.now().toString(),
        reportType: config.reportType,
        startDate: config.startDate,
        endDate: config.endDate,
        status: 'completed',
        format: config.format,
        generatedAt: new Date().toISOString(),
      };
      setGeneratedReports((prev) => [newReport, ...prev]);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setGenerating(false);
    }
  };

  // Handle CSV download
  const handleDownloadCsv = async (_reportId: string) => {
    await downloadCSV({
      startDate: undefined,
      endDate: undefined,
    });
  };

  // Refresh reports
  const handleRefreshReports = () => {
    fetchDocumentsReport();
  };

  // Refresh stats
  const handleRefreshStats = () => {
    fetchStats();
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await updateBranding({
        logo: brandingForm.logo,
        primaryColor: brandingForm.primaryColor,
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSavingSettings(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'documents',
      label: 'Documents',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: 'statistics',
      label: 'Statistics',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-center">
          <img src="/logo-wide.png" alt="NTC" className="h-8 object-contain" />
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-white truncate">Partner Portal</h1>
                <p className="text-gray-400 text-sm truncate">
                  {partner?.name || 'Loading...'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">{currentUser?.email}</span>
              <button
                onClick={async () => { await logout(); window.location.href = '/'; }}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pt-[72px] lg:pt-8">
        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 sm:mb-8 bg-gray-800/50 rounded-xl p-1 border border-gray-700 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm sm:text-base flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab.icon}
              <span className="hidden xs:inline sm:inline">{tab.label}</span>
            </button>
          ))}
          {/* Mobile Logout Button */}
          <button
            onClick={async () => { await logout(); window.location.href = '/'; }}
            className="lg:hidden flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm sm:text-base flex-shrink-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-auto"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden xs:inline sm:inline">Logout</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'documents' && (
          <StudentDocuments
            documents={documents}
            selectedDocument={selectedDocument}
            loading={documentsLoading}
            statusFilter={statusFilter}
            formTypeFilter={formTypeFilter}
            searchQuery={searchQuery}
            onStatusFilterChange={setStatusFilter}
            onFormTypeFilterChange={setFormTypeFilter}
            onSearchChange={setSearchQuery}
            onDocumentSelect={handleSelectDocument}
            onBackToList={clearSelectedDocument}
          />
        )}

        {activeTab === 'reports' && (
          <PartnerReports
            reports={generatedReports}
            loading={reportsLoading}
            generating={generating}
            onGenerateReport={handleGenerateReport}
            onDownloadCsv={handleDownloadCsv}
            onRefresh={handleRefreshReports}
          />
        )}

        {activeTab === 'statistics' && (
          <PartnerStats stats={stats} loading={statsLoading} onRefresh={handleRefreshStats} />
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Organization Settings */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Organization Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={settingsForm.name}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, name: e.target.value })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settingsForm.email}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, email: e.target.value })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={settingsForm.phone}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, phone: e.target.value })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                  <textarea
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    rows={2}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Branding Settings */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Branding</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Logo URL</label>
                  <input
                    type="url"
                    value={brandingForm.logo}
                    onChange={(e) => setBrandingForm({ ...brandingForm, logo: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Primary Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={brandingForm.primaryColor}
                      onChange={(e) =>
                        setBrandingForm({ ...brandingForm, primaryColor: e.target.value })
                      }
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={brandingForm.primaryColor}
                      onChange={(e) =>
                        setBrandingForm({ ...brandingForm, primaryColor: e.target.value })
                      }
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors"
              >
                {savingSettings ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PartnerDashboardPage;
