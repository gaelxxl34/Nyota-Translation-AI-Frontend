// Admin Dashboard Page - Main orchestrator for all admin sub-pages

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../AuthProvider';
import { getAdminSubPage } from '../../App';
import {
  RoleGuard,
  AdminSidebar,
  AdminHeader,
  UserForm,
  PartnerTable,
  PartnerForm,
  PromoCodeTable,
  PromoCodeForm,
  type AdminPage,
} from '../../components/admin';
import {
  useAdminUsers,
  useAdminPartners,
  useAdminAnalytics,
  useAdminPromoCodes,
} from '../../hooks/useAdmin';
import type { User, Partner, CreateUserData, CreatePartnerData, CreatePromoCodeData, PromoCode, ActivityLog, AdminDocument } from '../../services/adminService';
import { getActivityLogs, getDocuments } from '../../services/adminService';
import DocumentsPage from './DocumentsPage';
import SettingsPage from './SettingsPage';
import TranslatorsPage from './TranslatorsPage';
import OverviewTab from './OverviewTab';
import AnalyticsTab from './AnalyticsTab';
import UsersPage from './UsersPage';
import OrphanDataPage from './OrphanDataPage';
import AdminDocReviewPage from './AdminDocReviewPage';
import PaymentsPage from './PaymentsPage';

interface DocumentStats {
  totalDocuments: number;
  totalRevenue: number;
  pricePerDocument: number;
  documentsByUser: Array<{
    userId: string;
    email: string;
    count: number;
    revenue: number;
  }>;
  documentsByFormType: Record<string, number>;
  recentDocuments: Array<{
    id: string;
    studentName: string;
    formType: string;
    uploadedAt: string;
    userEmail?: string;
  }>;
  isAdmin: boolean;
}

const AdminDashboardPage: React.FC = () => {
  const { logout, currentUser } = useAuth();

  // Initialize from URL
  const [currentPage, setCurrentPage] = useState<AdminPage>(() => {
    const subPage = getAdminSubPage(window.location.pathname);
    const validPages: AdminPage[] = ['overview', 'users', 'partners', 'promo-codes', 'documents', 'translators', 'payments', 'analytics', 'settings', 'orphans', 'docreview'];
    return validPages.includes(subPage as AdminPage) ? (subPage as AdminPage) : 'overview';
  });

  // Navigation function that updates URL
  const handleNavigate = useCallback((page: AdminPage) => {
    const newPath = page === 'overview' ? '/admin' : `/admin/${page}`;
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
    }
    setCurrentPage(page);
  }, []);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const subPage = getAdminSubPage(window.location.pathname);
      const validPages: AdminPage[] = ['overview', 'users', 'partners', 'promo-codes', 'documents', 'translators', 'payments', 'analytics', 'settings', 'orphans', 'docreview'];
      setCurrentPage(validPages.includes(subPage as AdminPage) ? (subPage as AdminPage) : 'overview');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // User management
  const { users, stats: userStats, loading: usersLoading, fetchUsers, fetchStats, createUser, updateRole, deactivate, reactivate, deleteUser } = useAdminUsers();
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormMode, setUserFormMode] = useState<'create' | 'editRole'>('create');

  // Partner management
  const { partners, loading: partnersLoading, fetchPartners, createPartner, updatePartner } = useAdminPartners();
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  // Promo code management
  const { promoCodes, loading: promoCodesLoading, fetchPromoCodes, createPromoCode, updatePromoCode, deletePromoCode } = useAdminPromoCodes();
  const [showPromoCodeForm, setShowPromoCodeForm] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);

  // Analytics
  const { analytics, fetchAnalytics } = useAdminAnalytics();

  // Overview data
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [recentDocs, setRecentDocs] = useState<AdminDocument[]>([]);

  // Document statistics
  const [documentStats, setDocumentStats] = useState<DocumentStats | null>(null);

  const fetchDocumentStats = useCallback(async () => {
    if (!currentUser) return;
    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}/api/dashboard/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error(`Failed to fetch statistics: ${response.statusText}`);
      const result = await response.json();
      if (result.success) setDocumentStats(result.data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    }
  }, [currentUser]);

  // Fetch all data on mount
  useEffect(() => {
    fetchUsers();
    fetchStats();
    fetchPartners();
    fetchPromoCodes();
    fetchAnalytics();
    fetchDocumentStats();
    if (currentUser) {
      currentUser.getIdToken().then((token) => {
        getActivityLogs(token, { limit: 8 }).then(setRecentLogs).catch(console.error);
        getDocuments(token, { limit: 5 }).then(setRecentDocs).catch(console.error);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // User handlers
  const handleCreateUser = () => {
    setEditingUser(null);
    setUserFormMode('create');
    setShowUserForm(true);
  };

  const handleEditUserRole = (user: User) => {
    setEditingUser(user);
    setUserFormMode('editRole');
    setShowUserForm(true);
  };

  const handleUserSubmit = async (data: CreateUserData) => {
    if (userFormMode === 'create') {
      await createUser(data);
    } else if (editingUser) {
      await updateRole(editingUser.uid, data.role);
    }
  };

  const handleDeactivateUser = async (user: User) => {
    if (confirm(`Are you sure you want to deactivate ${user.email}?`)) {
      await deactivate(user.uid);
    }
  };

  const handleReactivateUser = async (user: User) => {
    await reactivate(user.uid);
  };

  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`PERMANENTLY delete ${user.email}?\n\nThis will delete:\n- Firebase Auth account\n- User profile\n- All uploaded documents\n- All certified documents\n- All bulletins\n\nThis action CANNOT be undone.`)) return;
    try {
      setDeletingUserId(user.uid);
      await deleteUser(user.uid);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setDeletingUserId(null);
    }
  };

  // Partner handlers
  const handleCreatePartner = () => {
    setEditingPartner(null);
    setShowPartnerForm(true);
  };

  const handleEditPartner = (partner: Partner) => {
    setEditingPartner(partner);
    setShowPartnerForm(true);
  };

  const handlePartnerSubmit = async (data: CreatePartnerData) => {
    if (editingPartner) {
      await updatePartner(editingPartner.partnerId, data);
    } else {
      await createPartner(data);
    }
  };

  // Promo code handlers
  const handleCreatePromoCode = () => {
    setEditingPromoCode(null);
    setShowPromoCodeForm(true);
  };

  const handleEditPromoCode = (code: PromoCode) => {
    setEditingPromoCode(code);
    setShowPromoCodeForm(true);
  };

  const handlePromoCodeSubmit = async (data: CreatePromoCodeData) => {
    await createPromoCode(data);
  };

  const handlePromoCodeUpdate = async (id: string, updates: Partial<PromoCode>) => {
    await updatePromoCode(id, updates);
  };

  const handleTogglePromoCode = async (code: PromoCode) => {
    await updatePromoCode(code.id, { isActive: !code.isActive });
  };

  const handleDeletePromoCode = async (code: PromoCode) => {
    if (window.confirm(`Are you sure you want to delete promo code "${code.code}"?`)) {
      await deletePromoCode(code.id);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  // Render page content
  const renderContent = () => {
    switch (currentPage) {
      case 'overview':
        return (
          <OverviewTab
            userStats={userStats}
            analytics={analytics}
            documentStats={documentStats}
            recentDocs={recentDocs}
            recentLogs={recentLogs}
            onNavigate={handleNavigate}
            onCreateUser={handleCreateUser}
            onCreatePartner={handleCreatePartner}
          />
        );

      case 'users':
        return (
          <UsersPage
            users={users}
            loading={usersLoading}
            stats={userStats}
            onCreateUser={handleCreateUser}
            onEditRole={handleEditUserRole}
            onDeactivate={handleDeactivateUser}
            onReactivate={handleReactivateUser}
            onViewDetails={(user) => console.log('View user:', user)}
            onDelete={handleDeleteUser}
            deleting={deletingUserId}
          />
        );

      case 'partners':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-end">
              <button
                onClick={handleCreatePartner}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Partner
              </button>
            </div>
            <PartnerTable
              partners={partners}
              loading={partnersLoading}
              onEdit={handleEditPartner}
              onViewDetails={(partner) => console.log('View partner:', partner)}
            />
          </div>
        );

      case 'promo-codes':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Promo Codes</h2>
                <p className="text-sm text-gray-500 mt-0.5">Manage discount codes for partners</p>
              </div>
              <button
                onClick={handleCreatePromoCode}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Code
              </button>
            </div>
            <PromoCodeTable
              promoCodes={promoCodes}
              loading={promoCodesLoading}
              onEdit={handleEditPromoCode}
              onToggleActive={handleTogglePromoCode}
              onDelete={handleDeletePromoCode}
            />
          </div>
        );

      case 'documents':
        return <DocumentsPage />;

      case 'translators':
        return <TranslatorsPage />;

      case 'analytics':
        return (
          <AnalyticsTab
            analytics={analytics}
            documentStats={documentStats}
            userStats={userStats}
          />
        );

      case 'settings':
        return <SettingsPage />;

      case 'payments':
        return <PaymentsPage />;

      case 'orphans':
        return <OrphanDataPage />;

      case 'docreview':
        return <AdminDocReviewPage />;

      default:
        return null;
    }
  };

  const getPageTitle = (): { title: string; subtitle?: string } => {
    switch (currentPage) {
      case 'overview':
        return { title: 'Dashboard', subtitle: 'Welcome back! Here\'s what\'s happening.' };
      case 'users':
        return { title: 'Users', subtitle: 'Manage all users, roles, and permissions' };
      case 'partners':
        return { title: 'Partners', subtitle: 'Manage schools and universities' };
      case 'documents':
        return { title: 'Documents', subtitle: 'All translated documents across the system' };
      case 'translators':
        return { title: 'Translators', subtitle: 'Manage translators and document assignments' };
      case 'analytics':
        return { title: 'Analytics & Revenue', subtitle: 'Performance metrics, revenue, and trends' };
      case 'settings':
        return { title: 'Settings', subtitle: 'System configuration and activity logs' };
      case 'payments':
        return { title: 'Payments', subtitle: 'All payment transactions and revenue overview' };
      case 'orphans':
        return { title: 'Orphan Data', subtitle: 'Detect and clean up orphaned records across collections' };
      case 'docreview':
        return { title: 'Document Review', subtitle: 'Review, approve, and reject documents like a translator' };
      default:
        return { title: 'Admin Dashboard' };
    }
  };

  const { title, subtitle } = getPageTitle();

  return (
    <RoleGuard allowedRoles={['superadmin']}>
      <div className="min-h-screen bg-slate-900 lg:flex lg:h-screen lg:overflow-hidden">
        <AdminSidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
        <div className="flex-1 flex flex-col overflow-hidden min-h-screen lg:h-screen">
          <AdminHeader title={title} subtitle={subtitle} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {renderContent()}
          </main>
        </div>
        <UserForm
          isOpen={showUserForm}
          onClose={() => { setShowUserForm(false); setEditingUser(null); }}
          onSubmit={handleUserSubmit}
          partners={partners}
          editUser={editingUser}
          mode={userFormMode}
        />
        <PartnerForm
          isOpen={showPartnerForm}
          onClose={() => { setShowPartnerForm(false); setEditingPartner(null); }}
          onSubmit={handlePartnerSubmit}
          editPartner={editingPartner}
        />
        <PromoCodeForm
          isOpen={showPromoCodeForm}
          onClose={() => { setShowPromoCodeForm(false); setEditingPromoCode(null); }}
          onSubmit={handlePromoCodeSubmit}
          onUpdate={handlePromoCodeUpdate}
          editPromoCode={editingPromoCode}
          partners={partners}
        />
      </div>
    </RoleGuard>
  );
};

export default AdminDashboardPage;
