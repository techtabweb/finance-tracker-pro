import { useState, useEffect, useCallback } from 'react';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  profile?: {
    avatar?: string;
    phone?: string;
    location?: string;
    occupation?: string;
    monthlyIncome?: number;
  };
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Simple password hashing (in production, use proper backend authentication)
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'finance-tracker-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const generateUserId = (): string => {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useKV<User | null>('current-user', null);
  const [users, setUsers] = useKV<Record<string, User>>('users-db', {});
  const [userCredentials, setUserCredentials] = useKV<Record<string, { hashedPassword: string; userId: string }>>('user-credentials', {});
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = !!currentUser;

  const signup = useCallback(async (credentials: SignupCredentials): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const { name, email, password, confirmPassword } = credentials;

      // Validation
      if (!name || !email || !password || !confirmPassword) {
        return { success: false, error: 'All fields are required' };
      }

      if (password !== confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
      }

      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long' };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: 'Please enter a valid email address' };
      }

      // Check if user already exists
      if (userCredentials && userCredentials[email.toLowerCase()]) {
        return { success: false, error: 'An account with this email already exists' };
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const userId = generateUserId();
      const newUser: User = {
        id: userId,
        email: email.toLowerCase(),
        name: name.trim(),
        createdAt: new Date().toISOString(),
        profile: {}
      };

      // Save user and credentials
      setUsers(currentUsers => ({
        ...currentUsers,
        [userId]: newUser
      }));

      setUserCredentials(currentCreds => ({
        ...currentCreds,
        [email.toLowerCase()]: {
          hashedPassword,
          userId
        }
      }));

      // Auto-login after signup
      setCurrentUser(newUser);

      toast.success('Account created successfully! Welcome to Finance Tracker! 🎉');
      return { success: true };

    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  }, [userCredentials, setUsers, setUserCredentials, setCurrentUser]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      const { email, password } = credentials;

      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      const emailLower = email.toLowerCase();
      const userCred = userCredentials && userCredentials[emailLower];

      if (!userCred) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Verify password
      const hashedPassword = await hashPassword(password);
      if (hashedPassword !== userCred.hashedPassword) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Get user data
      const user = users && users[userCred.userId];
      if (!user) {
        return { success: false, error: 'User account not found' };
      }

      setCurrentUser(user);
      toast.success(`Welcome back, ${user.name}! 👋`);
      return { success: true };

    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  }, [userCredentials, users, setCurrentUser]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    toast.success('Logged out successfully. See you soon! 👋');
  }, [setCurrentUser]);

  const updateProfile = useCallback(async (updates: Partial<User['profile']>): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      const updatedUser = {
        ...currentUser,
        profile: {
          ...currentUser.profile,
          ...updates
        }
      };

      setCurrentUser(updatedUser);
      setUsers(currentUsers => ({
        ...currentUsers,
        [currentUser.id]: updatedUser
      }));

      toast.success('Profile updated successfully! ✨');
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  }, [currentUser, setCurrentUser, setUsers]);

  const deleteAccount = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'No user logged in' };
    }

    try {
      // Remove user data
      setUsers(currentUsers => {
        if (!currentUsers) return {};
        const { [currentUser.id]: removed, ...rest } = currentUsers;
        return rest;
      });

      // Remove credentials
      setUserCredentials(currentCreds => {
        if (!currentCreds) return {};
        const { [currentUser.email]: removed, ...rest } = currentCreds;
        return rest;
      });

      // Clear current user
      setCurrentUser(null);

      toast.success('Account deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Delete account error:', error);
      return { success: false, error: 'Failed to delete account' };
    }
  }, [currentUser, setCurrentUser, setUsers, setUserCredentials]);

  return {
    user: currentUser,
    isLoading,
    isAuthenticated,
    signup,
    login,
    logout,
    updateProfile,
    deleteAccount
  };
};