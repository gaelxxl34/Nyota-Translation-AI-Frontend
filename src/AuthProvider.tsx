// Authentication Context Provider for NTC
// Manages user authentication state and provides auth methods to the app

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type AuthError
} from 'firebase/auth';
import { auth } from './firebase';

// User interface extending Firebase User with additional fields
interface AuthUser extends User {
  displayName: string | null;
  email: string | null;
  uid: string;
}

// Authentication context interface
interface AuthContextType {
  currentUser: AuthUser | null;
  loading: boolean;
  idToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

// Create authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Authentication provider component
interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Clear error message
  const clearError = () => setError(null);

  // Register new user with email, password, and display name
  const register = async (email: string, password: string, name: string): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      // Get ID token for API authentication
      const token = await userCredential.user.getIdToken();
      setIdToken(token);
      
      console.log('✅ User registered successfully:', userCredential.user.email);
    } catch (err) {
      const authError = err as AuthError;
      console.error('🚨 Registration failed:', authError.message);
      
      // Handle specific Firebase auth errors
      switch (authError.code) {
        case 'auth/email-already-in-use':
          setError('An account with this email already exists.');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters long.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        default:
          setError('Failed to create account. Please try again.');
      }
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  // Login user with email and password
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      
      // Sign in user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get ID token for API authentication
      const token = await userCredential.user.getIdToken();
      setIdToken(token);
      
      console.log('✅ User logged in successfully:', userCredential.user.email);
    } catch (err) {
      const authError = err as AuthError;
      console.error('🚨 Login failed:', authError.message);
      
      // Handle specific Firebase auth errors
      switch (authError.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError('Invalid email or password. Please try again.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        default:
          setError('Failed to sign in. Please try again.');
      }
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async (): Promise<void> => {
    try {
      setError(null);
      await signOut(auth);
      setIdToken(null);
      console.log('✅ User logged out successfully');
    } catch (err) {
      const authError = err as AuthError;
      console.error('🚨 Logout failed:', authError.message);
      setError('Failed to log out. Please try again.');
      throw authError;
    }
  };

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setCurrentUser(user as AuthUser);
          // Get fresh ID token
          const token = await user.getIdToken();
          setIdToken(token);
          console.log('👤 User authenticated:', user.email);
        } else {
          setCurrentUser(null);
          setIdToken(null);
          console.log('👤 User not authenticated');
        }
      } catch (err) {
        console.error('🚨 Auth state change error:', err);
        setCurrentUser(null);
        setIdToken(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Refresh ID token periodically (every 50 minutes)
  useEffect(() => {
    let tokenRefreshInterval: NodeJS.Timeout;

    if (currentUser) {
      tokenRefreshInterval = setInterval(async () => {
        try {
          const token = await currentUser.getIdToken(true); // Force refresh
          setIdToken(token);
          console.log('🔄 ID token refreshed');
        } catch (err) {
          console.error('🚨 Token refresh failed:', err);
        }
      }, 50 * 60 * 1000); // 50 minutes
    }

    return () => {
      if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
      }
    };
  }, [currentUser]);

  const value: AuthContextType = {
    currentUser,
    loading,
    idToken,
    login,
    register,
    logout,
    error,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
