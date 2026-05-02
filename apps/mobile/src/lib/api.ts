import NetInfo from '@react-native-community/netinfo';
import { secureStorage } from './secureStorage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

class NetworkError extends Error {
  constructor() {
    super('Sem conexão com a internet');
    this.name = 'NetworkError';
  }
}

async function apiFetch<T = unknown>(url: string, init: RequestInit = {}): Promise<T> {
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) throw new NetworkError();

  const accessToken = await secureStorage.get('liveaula.accessToken');
  const headers: Record<string, string> = {
    'X-Client': 'mobile',
    ...(init.headers as Record<string, string>),
  };
  // Only set Content-Type when there is a body — Fastify rejects empty JSON requests
  if (init.body !== undefined && init.body !== null && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  let res = await fetch(`${API_URL}${url}`, { ...init, headers });

  if (res.status === 401 && accessToken) {
    const refreshToken = await secureStorage.get('liveaula.refreshToken');
    if (refreshToken) {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Client': 'mobile' },
        body: JSON.stringify({ refreshToken }),
      });
      if (refreshRes.ok) {
        const { accessToken: newToken, refreshToken: newRefresh } = await refreshRes.json();
        await secureStorage.save('liveaula.accessToken', newToken);
        await secureStorage.save('liveaula.refreshToken', newRefresh);
        headers['Authorization'] = `Bearer ${newToken}`;
        res = await fetch(`${API_URL}${url}`, { ...init, headers });
      } else {
        await secureStorage.delete('liveaula.accessToken');
        await secureStorage.delete('liveaula.refreshToken');
        throw new Error('SESSION_EXPIRED');
      }
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw Object.assign(new Error(error.message || 'Request failed'), { status: res.status });
  }

  return res.json() as Promise<T>;
}

export { apiFetch, NetworkError };
