// User Table Component for NTC Admin Dashboard
// Displays list of users with actions

import React from 'react';
import type { User } from '../../services/adminService';

interface UserTableProps {
  users: User[];
  loading: boolean;
  onEditRole: (user: User) => void;
  onDeactivate: (user: User) => void;
  onReactivate: (user: User) => void;
  onViewDetails: (user: User) => void;
}

const getRoleBadgeColor = (role: string): string => {
  const colors: Record<string, string> = {
    superadmin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    translator: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    partner: 'bg-green-500/20 text-green-400 border-green-500/30',
    support: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    user: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  return colors[role] || colors.user;
};

const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  onEditRole,
  onDeactivate,
  onReactivate,
  onViewDetails,
}) => {
  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <div className="space-y-4 animate-pulse">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4 bg-slate-900/40 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-700" />
                <div>
                  <div className="h-3 w-28 bg-slate-700 rounded" />
                  <div className="h-3 w-40 bg-slate-800 rounded mt-2" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-20 bg-slate-700 rounded-full" />
                <div className="h-6 w-16 bg-slate-700 rounded-full" />
                <div className="h-6 w-16 bg-slate-700 rounded-full" />
                <div className="h-6 w-24 bg-slate-700 rounded" />
                <div className="flex gap-2">
                  <div className="h-9 w-9 bg-slate-700 rounded" />
                  <div className="h-9 w-9 bg-slate-700 rounded" />
                  <div className="h-9 w-9 bg-slate-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
        <div className="text-center">
          <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-slate-400">No users found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Partner
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Last Login
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-white">{user.displayName || 'No name'}</p>
                      <p className="text-sm text-slate-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.isActive 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      user.isActive ? 'bg-green-400' : 'bg-red-400'
                    }`}></span>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-slate-400">
                    {user.partnerName || '—'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-slate-400">
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleDateString() 
                      : 'Never'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onViewDetails(user)}
                      className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      aria-label="View details"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onEditRole(user)}
                      className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      aria-label="Change role"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {user.isActive ? (
                      <button
                        onClick={() => onDeactivate(user)}
                        className="p-2 text-red-400 hover:text-red-200 hover:bg-red-500/10 rounded-lg transition-colors"
                        aria-label="Deactivate user"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={() => onReactivate(user)}
                        className="p-2 text-green-400 hover:text-green-200 hover:bg-green-500/10 rounded-lg transition-colors"
                        aria-label="Reactivate user"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
