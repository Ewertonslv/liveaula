'use client';

let accessTokenMemory: string | null = null;
let refreshTokenMemory: string | null = null;

const ACCESS_COOKIE = 'accessToken';
const REFRESH_KEY = 'liveaula.refreshToken';
const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
const cookieFlags = `path=/; SameSite=Lax${isHttps ? '; Secure' : ''}`;

export function setAccessToken(token: string) {
  accessTokenMemory = token;
  if (typeof document !== 'undefined') {
    document.cookie = `${ACCESS_COOKIE}=${token}; max-age=900; ${cookieFlags}`;
  }
}

export function setRefreshToken(token: string) {
  refreshTokenMemory = token;
  if (typeof window !== 'undefined') {
    try { localStorage.setItem(REFRESH_KEY, token); } catch { /* ignore */ }
  }
}

export function getAccessToken(): string | null {
  if (accessTokenMemory) return accessTokenMemory;
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${ACCESS_COOKIE}=([^;]+)`));
    if (match) {
      accessTokenMemory = decodeURIComponent(match[1]);
      return accessTokenMemory;
    }
  }
  return null;
}

function getRefreshToken(): string | null {
  if (refreshTokenMemory) return refreshTokenMemory;
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(REFRESH_KEY);
      if (stored) {
        refreshTokenMemory = stored;
        return stored;
      }
    } catch { /* ignore */ }
  }
  return null;
}

export function clearTokens() {
  accessTokenMemory = null;
  refreshTokenMemory = null;
  if (typeof document !== 'undefined') {
    document.cookie = `${ACCESS_COOKIE}=; max-age=0; ${cookieFlags}`;
  }
  if (typeof window !== 'undefined') {
    try { localStorage.removeItem(REFRESH_KEY); } catch { /* ignore */ }
  }
}

async function refreshAccessToken(baseUrl: string): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  // Use the X-Client: mobile pattern so the API reads refreshToken from body
  // (cross-site cookies don't work between Vercel and Railway domains)
  const res = await fetch(`${baseUrl}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client': 'mobile',
    },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return null;
  try {
    const data = await res.json();
    if (typeof data.accessToken === 'string') {
      setAccessToken(data.accessToken);
      if (typeof data.refreshToken === 'string') setRefreshToken(data.refreshToken);
      return data.accessToken;
    }
  } catch {
    /* fall through */
  }
  return null;
}

export async function apiFetch<T = unknown>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  const token = getAccessToken();

  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string>),
  };
  if (init.body !== undefined && init.body !== null && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(`${baseUrl}${url}`, { ...init, headers });

  if (res.status === 401) {
    const refreshed = await refreshAccessToken(baseUrl);
    if (refreshed) {
      headers['Authorization'] = `Bearer ${refreshed}`;
      res = await fetch(`${baseUrl}${url}`, { ...init, headers });
    } else {
      clearTokens();
      throw Object.assign(new Error('SESSION_EXPIRED'), { status: 401 });
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw Object.assign(new Error(error.message || 'Request failed'), { status: res.status, data: error });
  }

  return res.json() as Promise<T>;
}
