import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { secureStorage } from '../lib/secureStorage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'PROFESSOR' | 'PARENT' | 'ADMIN';
  avatarUrl?: string;
  planStatus?: 'FREE' | 'PAID';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Client': 'mobile' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Credenciais inválidas');
      const data = await res.json();
      await secureStorage.save('liveaula.accessToken', data.accessToken);
      await secureStorage.save('liveaula.refreshToken', data.refreshToken);
      await secureStorage.save('liveaula.userId', data.user.id);
      await secureStorage.save('liveaula.userRole', data.user.role);
      setUser(data.user);
      return data.user as User;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const accessToken = await secureStorage.get('liveaula.accessToken');
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Client': 'mobile',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    }).catch(() => {});
    await secureStorage.delete('liveaula.accessToken');
    await secureStorage.delete('liveaula.refreshToken');
    await secureStorage.delete('liveaula.userId');
    await secureStorage.delete('liveaula.userRole');
    setUser(null);
    router.replace('/(auth)/login');
  }, []);

  return { user, setUser, login, logout, isLoading };
}
