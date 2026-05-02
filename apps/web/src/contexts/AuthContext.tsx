'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { setAccessToken } from '@/lib/api';

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
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
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
    document.cookie = `accessToken=${data.accessToken}; path=/; max-age=900; SameSite=lax`;
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
    await fetch(`${apiUrl}/auth/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
    setToken(null);
    setAccessToken('');
    document.cookie = 'accessToken=; path=/; max-age=0; SameSite=lax';
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
