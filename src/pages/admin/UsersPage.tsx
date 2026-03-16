// Users Page - Customers vs Team segmentation

import React, { useState, useMemo } from 'react';
import { UserTable } from '../../components/admin';
import type { User, UserStats } from '../../services/adminService';

type UserSegment = 'customers' | 'team';

const TEAM_ROLES = ['superadmin', 'translator', 'partner', 'support'];

interface UsersPageProps {
  users: User[];
  loading: boolean;
  stats: UserStats | null;
  onCreateUser: () => void;
  onEditRole: (user: User) => void;
  onDeactivate: (user: User) => void;
  onReactivate: (user: User) => void;
  onViewDetails: (user: User) => void;
  onDelete: (user: User) => void;
  deleting?: string | null;
}

const UsersPage: React.FC<UsersPageProps> = ({
  users,
  loading,
  stats,
  onCreateUser,
  onEditRole,
  onDeactivate,
  onReactivate,
  onViewDetails,
  onDelete,
  deleting,
}) => {
  const [segment, setSegment] = useState<UserSegment>('customers');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Split users into customers vs team
  const customers = useMemo(() => users.filter(u => u.role === 'user'), [users]);
  const teamMembers = useMemo(() => users.filter(u => TEAM_ROLES.includes(u.role)), [users]);

  // Active list based on selected segment
  const activeList = segment === 'customers' ? customers : teamMembers;

  // Apply role filter and search
  const filteredList = useMemo(() => {
    let list = activeList;
    if (roleFilter) {
      list = list.filter(u => u.role === roleFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(u =>
        u.displayName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeList, roleFilter, searchQuery]);

  // Stat counts
  const customerCount = customers.length;
  const teamCount = teamMembers.length;
  const activeCustomers = customers.filter(u => u.isActive).length;
  const activeTeam = teamMembers.filter(u => u.isActive).length;

  // Role breakdown for team
  const teamByRole = useMemo(() => {
    const counts: Record<string, number> = {};
    teamMembers.forEach(u => {
      counts[u.role] = (counts[u.role] || 0) + 1;
    });
    return counts;
  }, [teamMembers]);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-700" />
                <div className="space-y-2">
                  <div className="h-6 w-10 bg-slate-700 rounded" />
                  <div className="h-3 w-16 bg-slate-700/60 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats?.total ?? users.length}</p>
              <p className="text-xs text-slate-400">Total Users</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{customerCount}</p>
              <p className="text-xs text-slate-400">Customers</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{teamCount}</p>
              <p className="text-xs text-slate-400">Team Members</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{segment === 'customers' ? activeCustomers : activeTeam}</p>
              <p className="text-xs text-slate-400">Active {segment === 'customers' ? 'Customers' : 'Team'}</p>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Segment Tabs + Filters + Actions */}
      <div className="flex flex-col gap-4">
        {/* Segment Tabs */}
        <div className="flex items-center gap-1 bg-slate-800 rounded-xl border border-slate-700 p-1 w-fit">
          <button
            onClick={() => { setSegment('customers'); setRoleFilter(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              segment === 'customers'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Customers
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              segment === 'customers'
                ? 'bg-blue-500/30 text-blue-100'
                : 'bg-slate-700 text-slate-400'
            }`}>
              {customerCount}
            </span>
          </button>
          <button
            onClick={() => { setSegment('team'); setRoleFilter(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              segment === 'team'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Team
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              segment === 'team'
                ? 'bg-purple-500/30 text-purple-100'
                : 'bg-slate-700 text-slate-400'
            }`}>
              {teamCount}
            </span>
          </button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={`Search ${segment === 'customers' ? 'customers' : 'team members'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>

            {/* Role filter - only show for Team segment since customers are all 'user' role */}
            {segment === 'team' && (
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                <option value="superadmin">Super Admin ({teamByRole['superadmin'] || 0})</option>
                <option value="translator">Translator ({teamByRole['translator'] || 0})</option>
                <option value="partner">Partner ({teamByRole['partner'] || 0})</option>
                <option value="support">Support ({teamByRole['support'] || 0})</option>
              </select>
            )}
          </div>

          <button
            onClick={onCreateUser}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {segment === 'customers' ? 'Add Customer' : 'Add Team Member'}
          </button>
        </div>
      </div>

      {/* Team Role Breakdown Pills */}
      {segment === 'team' && !loading && (
        <div className="flex flex-wrap gap-2">
          {TEAM_ROLES.map(role => {
            const count = teamByRole[role] || 0;
            if (count === 0) return null;
            const styles: Record<string, string> = {
              superadmin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
              translator: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
              partner: 'bg-green-500/10 text-green-400 border-green-500/20',
              support: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            };
            const labels: Record<string, string> = {
              superadmin: 'Super Admins',
              translator: 'Translators',
              partner: 'Partners',
              support: 'Support Staff',
            };
            return (
              <button
                key={role}
                onClick={() => setRoleFilter(roleFilter === role ? '' : role)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  roleFilter === role
                    ? 'ring-2 ring-offset-1 ring-offset-slate-900 ring-blue-500'
                    : ''
                } ${styles[role]}`}
              >
                <span className="font-semibold">{count}</span>
                {labels[role]}
              </button>
            );
          })}
        </div>
      )}

      {/* User Table */}
      <UserTable
        users={filteredList}
        loading={loading}
        onEditRole={onEditRole}
        onDeactivate={onDeactivate}
        onReactivate={onReactivate}
        onViewDetails={onViewDetails}
        onDelete={onDelete}
        deleting={deleting}
      />

      {/* Empty state for filtered results */}
      {!loading && filteredList.length === 0 && activeList.length > 0 && (
        <div className="text-center py-8">
          <p className="text-slate-400 text-sm">No results match your filters.</p>
          <button
            onClick={() => { setRoleFilter(''); setSearchQuery(''); }}
            className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
