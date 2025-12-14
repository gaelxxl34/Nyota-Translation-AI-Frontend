// Custom hook for admin functionality
// Provides role checking and admin API access

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthProvider';
import * as adminService from '../services/adminService';
import type { User, Partner, SystemAnalytics, UserStats } from '../services/adminService';

// User role type
export type UserRole = 'superadmin' | 'translator' | 'partner' | 'support' | 'user';

// Extended user with role information
export interface AuthUserWithRole {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  partnerId?: string;
  partnerName?: string;
  isActive: boolean;
}

// Hook for checking user role and permissions
export const useUserRole = () => {
  const { currentUser, idToken, userRole: claimedRole } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>(claimedRole || 'user');
  const [userDetails, setUserDetails] = useState<AuthUserWithRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resolveRole = async () => {
      if (!currentUser || !idToken) {
        setLoading(false);
        return;
      }

      // If we already have a claimed role (from custom claims), use it immediately to avoid UI flicker
      if (claimedRole) {
        setUserRole(claimedRole);
        setUserDetails((prev) => prev || {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          role: claimedRole,
          isActive: true,
        });
        setLoading(false);

        // Optionally refresh details in the background (non-blocking)
        try {
          const userData = await adminService.getUserById(idToken, currentUser.uid);
          setUserRole(userData.role as UserRole);
          setUserDetails({
            uid: userData.uid,
            email: userData.email,
            displayName: userData.displayName,
            role: userData.role as UserRole,
            partnerId: userData.partnerId,
            partnerName: userData.partnerName,
            isActive: userData.isActive,
          });
        } catch (error) {
          // Keep claimed role; background fetch failure should not block UI
          console.warn('Could not refresh user role details, using claims role:', error);
        }
        return;
      }

      // Fallback: fetch role from API when claims not present
      try {
        const userData = await adminService.getUserById(idToken, currentUser.uid);
        setUserRole(userData.role as UserRole);
        setUserDetails({
          uid: userData.uid,
          email: userData.email,
          displayName: userData.displayName,
          role: userData.role as UserRole,
          partnerId: userData.partnerId,
          partnerName: userData.partnerName,
          isActive: userData.isActive,
        });
      } catch (error) {
        console.warn('Could not fetch user role, defaulting to user:', error);
        setUserRole('user');
        setUserDetails({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          role: 'user',
          isActive: true,
        });
      } finally {
        setLoading(false);
      }
    };

    resolveRole();
  }, [currentUser, idToken, claimedRole]);

  const isSuperAdmin = userRole === 'superadmin';
  const isTranslator = userRole === 'translator' || isSuperAdmin;
  const isPartner = userRole === 'partner' || isSuperAdmin;
  const isSupport = userRole === 'support' || isSuperAdmin;
  const isStaff = isSuperAdmin || isTranslator || isSupport;

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (Array.isArray(role)) {
      return role.includes(userRole) || isSuperAdmin;
    }
    return userRole === role || isSuperAdmin;
  };

  return {
    userRole,
    userDetails,
    loading,
    isSuperAdmin,
    isTranslator,
    isPartner,
    isSupport,
    isStaff,
    hasRole,
  };
};

// Hook for admin users management
export const useAdminUsers = () => {
  const { idToken } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (filters?: { role?: string; isActive?: boolean }) => {
    if (!idToken) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await adminService.getUsers(idToken, filters);
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [idToken]);

  const fetchStats = useCallback(async () => {
    if (!idToken) return;
    
    try {
      const data = await adminService.getUserStats(idToken);
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch user stats:', err);
    }
  }, [idToken]);

  const createUser = async (userData: adminService.CreateUserData): Promise<User> => {
    if (!idToken) throw new Error('Not authenticated');
    
    const newUser = await adminService.createUser(idToken, userData);
    await fetchUsers();
    await fetchStats();
    return newUser;
  };

  const updateRole = async (uid: string, role: string): Promise<User> => {
    if (!idToken) throw new Error('Not authenticated');
    
    const updatedUser = await adminService.updateUserRole(idToken, uid, role);
    await fetchUsers();
    await fetchStats();
    return updatedUser;
  };

  const deactivate = async (uid: string): Promise<User> => {
    if (!idToken) throw new Error('Not authenticated');
    
    const updatedUser = await adminService.deactivateUser(idToken, uid);
    await fetchUsers();
    await fetchStats();
    return updatedUser;
  };

  const reactivate = async (uid: string): Promise<User> => {
    if (!idToken) throw new Error('Not authenticated');
    
    const updatedUser = await adminService.reactivateUser(idToken, uid);
    await fetchUsers();
    await fetchStats();
    return updatedUser;
  };

  return {
    users,
    stats,
    loading,
    error,
    fetchUsers,
    fetchStats,
    createUser,
    updateRole,
    deactivate,
    reactivate,
  };
};

// Hook for admin partners management
export const useAdminPartners = () => {
  const { idToken } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPartners = useCallback(async () => {
    if (!idToken) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await adminService.getPartners(idToken);
      setPartners(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch partners');
    } finally {
      setLoading(false);
    }
  }, [idToken]);

  const createPartner = async (partnerData: adminService.CreatePartnerData): Promise<Partner> => {
    if (!idToken) throw new Error('Not authenticated');
    
    const newPartner = await adminService.createPartner(idToken, partnerData);
    await fetchPartners();
    return newPartner;
  };

  const updatePartner = async (partnerId: string, updates: Partial<Partner>): Promise<Partner> => {
    if (!idToken) throw new Error('Not authenticated');
    
    const updatedPartner = await adminService.updatePartner(idToken, partnerId, updates);
    await fetchPartners();
    return updatedPartner;
  };

  return {
    partners,
    loading,
    error,
    fetchPartners,
    createPartner,
    updatePartner,
  };
};

// Hook for system analytics
export const useAdminAnalytics = () => {
  const { idToken } = useAuth();
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!idToken) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await adminService.getSystemAnalytics(idToken);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [idToken]);

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
  };
};
