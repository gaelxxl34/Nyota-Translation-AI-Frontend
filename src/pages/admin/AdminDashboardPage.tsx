// Admin Dashboard Page for NTC
// Main admin interface with overview, user management, partner management

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../AuthProvider';
import { getAdminSubPage } from '../../App';
import {
  RoleGuard,
  AdminSidebar,
  AdminHeader,
  StatsCard,
  UserTable,
  UserForm,
  PartnerTable,
  PartnerForm,
  type AdminPage,
} from '../../components/admin';
import {
  useAdminUsers,
  useAdminPartners,
  useAdminAnalytics,
} from '../../hooks/useAdmin';
import type { User, Partner, CreateUserData, CreatePartnerData } from '../../services/adminService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const AdminDashboardPage: React.FC = () => {
  const { logout, currentUser } = useAuth();
  
  // Initialize from URL
  const [currentPage, setCurrentPage] = useState<AdminPage>(() => {
    const subPage = getAdminSubPage(window.location.pathname);
    const validPages: AdminPage[] = ['overview', 'users', 'partners', 'statistics', 'analytics', 'logs', 'settings'];
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
      const validPages: AdminPage[] = ['overview', 'users', 'partners', 'statistics', 'analytics', 'logs', 'settings'];
      setCurrentPage(validPages.includes(subPage as AdminPage) ? (subPage as AdminPage) : 'overview');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  // User management state
  const { users, stats: userStats, loading: usersLoading, fetchUsers, fetchStats, createUser, updateRole, deactivate, reactivate } = useAdminUsers();
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormMode, setUserFormMode] = useState<'create' | 'editRole'>('create');
  const [roleFilter, setRoleFilter] = useState<string>('');

  // Partner management state
  const { partners, loading: partnersLoading, fetchPartners, createPartner, updatePartner } = useAdminPartners();
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  // Analytics state
  const { analytics, fetchAnalytics } = useAdminAnalytics();

  // Statistics state (revenue & document statistics)
  interface DocumentStats {
    totalDocuments: number;
    totalRevenue: number;
    pricePerDocument: number;
    documentsByUser: Array<{
      userId: string;
      email: string;
      count: number;
      revenue: number;
      documents?: Array<{
        id: string;
        studentName: string;
        formType: string;
        uploadedAt: Date;
      }>;
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
  const [documentStats, setDocumentStats] = useState<DocumentStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

  // Fetch document statistics
  const fetchDocumentStats = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setStatsLoading(true);
      setStatsError(null);
      
      const idToken = await currentUser.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/dashboard/stats`, {
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
        setDocumentStats(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch statistics');
      }
    } catch (err) {
      console.error('❌ Failed to fetch dashboard stats:', err);
      setStatsError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setStatsLoading(false);
    }
  }, [currentUser]);

  // Toggle user expansion for statistics
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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get form type label
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
    };
    return labels[formType] || formType;
  };

  // Fetch data on mount - only once
  useEffect(() => {
    fetchUsers();
    fetchStats();
    fetchPartners();
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch document statistics when statistics page is visited
  useEffect(() => {
    if (currentPage === 'statistics' && !documentStats && !statsLoading) {
      fetchDocumentStats();
    }
  }, [currentPage, documentStats, statsLoading, fetchDocumentStats]);

  // Filter users when role filter changes (skip initial)
  const isInitialMount = React.useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchUsers(roleFilter ? { role: roleFilter } : undefined);
  }, [roleFilter, fetchUsers]);

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

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  // Prepare chart data
  const roleChartData = userStats ? Object.entries(userStats.byRole).map(([role, count]) => ({
    name: role,
    value: count,
  })) : [];

  const documentStatusData = analytics?.documents.byStatus 
    ? Object.entries(analytics.documents.byStatus).map(([status, count]) => ({
        name: status,
        count,
      }))
    : [];

  const documentTypeData = analytics?.documents.byFormType
    ? Object.entries(analytics.documents.byFormType).map(([type, count]) => ({
        name: type,
        count,
      }))
    : [];

  // Render page content based on current page
  const renderContent = () => {
    switch (currentPage) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Users"
                value={userStats?.total || 0}
                icon={
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
                iconBgColor="bg-blue-500/10"
                subtitle={`${userStats?.active || 0} active`}
              />
              <StatsCard
                title="Documents"
                value={analytics?.documents.total || 0}
                icon={
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                iconBgColor="bg-green-500/10"
              />
              <StatsCard
                title="Partners"
                value={analytics?.partners.total || 0}
                icon={
                  <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
                iconBgColor="bg-purple-500/10"
                subtitle={`${analytics?.partners.active || 0} active`}
              />
              <StatsCard
                title="Translators"
                value={userStats?.byRole?.translator || 0}
                icon={
                  <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                }
                iconBgColor="bg-yellow-500/10"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Users by Role */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Users by Role</h3>
                {roleChartData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={roleChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        >
                          {roleChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                          labelStyle={{ color: '#F8FAFC' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-400">
                    No data available
                  </div>
                )}
              </div>

              {/* Documents by Status */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Documents by Status</h3>
                {documentStatusData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={documentStatusData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" tick={{ fill: '#94A3B8' }} axisLine={{ stroke: '#334155' }} />
                        <YAxis tick={{ fill: '#94A3B8' }} axisLine={{ stroke: '#334155' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                          labelStyle={{ color: '#F8FAFC' }}
                        />
                        <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-slate-400">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => { handleNavigate('users'); handleCreateUser(); }}
                  className="flex items-center p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg hover:bg-blue-500/20 transition-colors"
                >
                  <div className="p-2 bg-blue-500/20 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">Create User</p>
                    <p className="text-sm text-slate-400">Add translator, partner, or support</p>
                  </div>
                </button>
                
                <button
                  onClick={() => { handleNavigate('partners'); handleCreatePartner(); }}
                  className="flex items-center p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg hover:bg-purple-500/20 transition-colors"
                >
                  <div className="p-2 bg-purple-500/20 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">Add Partner</p>
                    <p className="text-sm text-slate-400">Register school or university</p>
                  </div>
                </button>
                
                <button
                  onClick={() => handleNavigate('analytics')}
                  className="flex items-center p-4 bg-green-500/10 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition-colors"
                >
                  <div className="p-2 bg-green-500/20 rounded-lg mr-4">
                    <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">View Analytics</p>
                    <p className="text-sm text-slate-400">System performance insights</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            {/* Header with actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Roles</option>
                  <option value="superadmin">Super Admin</option>
                  <option value="translator">Translator</option>
                  <option value="partner">Partner</option>
                  <option value="support">Support</option>
                  <option value="user">User</option>
                </select>
              </div>
              <button
                onClick={handleCreateUser}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create User
              </button>
            </div>

            {/* Users Table */}
            <UserTable
              users={users}
              loading={usersLoading}
              onEditRole={handleEditUserRole}
              onDeactivate={handleDeactivateUser}
              onReactivate={handleReactivateUser}
              onViewDetails={(user) => console.log('View user:', user)}
            />
          </div>
        );

      case 'partners':
        return (
          <div className="space-y-6">
            {/* Header with actions */}
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

            {/* Partners Table */}
            <PartnerTable
              partners={partners}
              loading={partnersLoading}
              onEdit={handleEditPartner}
              onViewDetails={(partner) => console.log('View partner:', partner)}
            />
          </div>
        );

      case 'statistics':
        return (
          <div className="space-y-6">
            {statsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span className="ml-4 text-slate-400">Loading statistics...</span>
              </div>
            ) : statsError ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-center">
                <p className="text-red-400 font-medium">{statsError}</p>
                <button
                  onClick={fetchDocumentStats}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            ) : documentStats ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatsCard
                    title="Total Documents"
                    value={documentStats.totalDocuments}
                    icon={
                      <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    }
                    iconBgColor="bg-blue-500/10"
                    subtitle="Documents translated"
                  />
                  <StatsCard
                    title="Total Users"
                    value={documentStats.documentsByUser.length}
                    icon={
                      <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    }
                    iconBgColor="bg-green-500/10"
                    subtitle="Active users"
                  />
                  <StatsCard
                    title="Total Revenue"
                    value={formatCurrency(documentStats.totalRevenue)}
                    icon={
                      <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                    iconBgColor="bg-yellow-500/10"
                    subtitle={`@ ${formatCurrency(documentStats.pricePerDocument)} per document`}
                  />
                </div>

                {/* Documents by Form Type */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">📑 Documents by Type</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(documentStats.documentsByFormType).map(([formType, count]) => (
                      <div key={formType} className="bg-slate-700/50 rounded-lg p-4">
                        <p className="text-sm text-slate-400">{getFormTypeLabel(formType)}</p>
                        <p className="text-2xl font-bold text-white mt-1">{count}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Users and Documents */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">👥 Users & Activity</h3>
                  <div className="space-y-4">
                    {documentStats.documentsByUser.map((user) => (
                      <div key={user.userId} className="border border-slate-600 rounded-lg p-4">
                        <div 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => toggleUserExpansion(user.userId)}
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-white">{user.email}</p>
                            <p className="text-sm text-slate-400 mt-1">
                              {user.count} document{user.count !== 1 ? 's' : ''} • {formatCurrency(user.revenue)}
                            </p>
                          </div>
                          <svg 
                            className={`w-5 h-5 text-slate-400 transform transition-transform ${
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
                          <div className="mt-4 pt-4 border-t border-slate-600">
                            <p className="text-sm font-medium text-slate-300 mb-2">Documents:</p>
                            <div className="space-y-2">
                              {user.documents.map((doc) => (
                                <div key={doc.id} className="bg-slate-700/50 rounded p-3 text-sm">
                                  <p className="font-medium text-white">{doc.studentName}</p>
                                  <p className="text-slate-400">
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

                {/* Recent Documents */}
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">🕒 Recent Activity</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-600">
                      <thead className="bg-slate-700/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Student Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Document Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-600">
                        {documentStats.recentDocuments.map((doc) => (
                          <tr key={doc.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                              {doc.studentName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                              {getFormTypeLabel(doc.formType)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                              {doc.userEmail}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                              {formatDate(doc.uploadedAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                title="Total Documents"
                value={analytics?.documents.total || 0}
                icon={
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                iconBgColor="bg-blue-500/10"
              />
              <StatsCard
                title="Active Users"
                value={userStats?.active || 0}
                icon={
                  <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
                iconBgColor="bg-green-500/10"
              />
              <StatsCard
                title="Active Partners"
                value={analytics?.partners.active || 0}
                icon={
                  <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
                iconBgColor="bg-purple-500/10"
              />
            </div>

            {/* Document Types Chart */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Documents by Type</h3>
              {documentTypeData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={documentTypeData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" tick={{ fill: '#94A3B8' }} axisLine={{ stroke: '#334155' }} />
                      <YAxis dataKey="name" type="category" tick={{ fill: '#94A3B8' }} axisLine={{ stroke: '#334155' }} width={120} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#F8FAFC' }}
                      />
                      <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-slate-400">
                  No data available
                </div>
              )}
            </div>

            {/* Last Updated */}
            {analytics?.generatedAt && (
              <p className="text-sm text-slate-500 text-center">
                Last updated: {new Date(analytics.generatedAt).toLocaleString()}
              </p>
            )}
          </div>
        );

      case 'logs':
        return (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
            <div className="text-center">
              <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">Activity Logs</h3>
              <p className="text-slate-400">Activity logging will be implemented in a future update.</p>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
            <div className="text-center">
              <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">System Settings</h3>
              <p className="text-slate-400">System settings will be implemented in a future update.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getPageTitle = (): { title: string; subtitle?: string } => {
    switch (currentPage) {
      case 'overview':
        return { title: 'Dashboard Overview', subtitle: 'Welcome back! Here\'s what\'s happening.' };
      case 'users':
        return { title: 'User Management', subtitle: 'Manage all users, roles, and permissions' };
      case 'partners':
        return { title: 'Partner Organizations', subtitle: 'Manage schools and universities' };
      case 'statistics':
        return { title: 'Revenue & Statistics', subtitle: 'Document translations, users, and revenue' };
      case 'analytics':
        return { title: 'System Analytics', subtitle: 'Performance metrics and insights' };
      case 'logs':
        return { title: 'Activity Logs', subtitle: 'System audit trail' };
      case 'settings':
        return { title: 'Settings', subtitle: 'System configuration' };
      default:
        return { title: 'Admin Dashboard' };
    }
  };

  const { title, subtitle } = getPageTitle();

  return (
    <RoleGuard allowedRoles={['superadmin']}>
      <div className="min-h-screen bg-slate-900 lg:flex lg:h-screen lg:overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-screen lg:h-screen">
          {/* Header */}
          <AdminHeader title={title} subtitle={subtitle} />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            {renderContent()}
          </main>
        </div>

        {/* User Form Modal */}
        <UserForm
          isOpen={showUserForm}
          onClose={() => { setShowUserForm(false); setEditingUser(null); }}
          onSubmit={handleUserSubmit}
          partners={partners}
          editUser={editingUser}
          mode={userFormMode}
        />

        {/* Partner Form Modal */}
        <PartnerForm
          isOpen={showPartnerForm}
          onClose={() => { setShowPartnerForm(false); setEditingPartner(null); }}
          onSubmit={handlePartnerSubmit}
          editPartner={editingPartner}
        />
      </div>
    </RoleGuard>
  );
};

export default AdminDashboardPage;
