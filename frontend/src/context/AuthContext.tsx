import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'owner' | 'admin';
  status: string;
  isVerified: boolean;
  ownerProfile?: any;
  customerProfile?: any;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (identifier: string, pass: string) => Promise<AuthUser>;
  registerCustomer: (data: any) => Promise<void>;
  registerOwner: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('shaadiyatra_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      if (!localStorage.getItem('shaadiyatra_token')) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await api.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (identifier: string, pass: string): Promise<AuthUser> => {
    const res = await api.login({ identifier, password: pass });
    if (res.success && res.token) {
      localStorage.setItem('shaadiyatra_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.error || 'Login failed');
  };

  const registerCustomer = async (data: any) => {
    const res = await api.registerCustomer(data);
    if (res.success && res.token) {
      localStorage.setItem('shaadiyatra_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } else {
      throw new Error(res.error || 'Registration failed');
    }
  };

  const registerOwner = async (data: any) => {
    const res = await api.registerOwner(data);
    if (res.success && res.token) {
      localStorage.setItem('shaadiyatra_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } else {
      throw new Error(res.error || 'Owner registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('shaadiyatra_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        registerCustomer,
        registerOwner,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
