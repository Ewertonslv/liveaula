'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { setAccessToken, setRefreshToken, clearTokens, getAccessToken } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'PROFESSOR' | 'PARENT' | 'ADMIN';
  avatarUrl?: string;
  planStatus?: 'FREE' | 'PAID';
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setToken] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
    const res = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client': 'mobile', // Treat web as cross-site too — refreshToken in body
      },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Login failed');
    }
    const data = await res.json();
    setUser(data.user);
    setToken(data.accessToken);
    setAccessToken(data.accessToken);
    if (data.refreshToken) setRefreshToken(data.refreshToken);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
    const token = getAccessToken();
    try {
      await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        headers: token
          ? { 'X-Client': 'mobile', Authorization: `Bearer ${token}` }
          : { 'X-Client': 'mobile' },
      });
    } catch { /* ignore network errors on logout */ }
    setUser(null);
    setToken(null);
    clearTokens();
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
