'use client';

let accessTokenMemory: string | null = null;

export function setAccessToken(token: string) {
  accessTokenMemory = token;
  // Mirror to a JS-readable cookie so refresh of the page restores memory.
  // 15 min = JWT TTL.
  if (typeof document !== 'undefined') {
    document.cookie = `accessToken=${token}; path=/; max-age=900; SameSite=lax`;
  }
}

export function getAccessToken(): string | null {
  if (accessTokenMemory) return accessTokenMemory;
  // Hydrate from cookie when memory is empty (e.g. after page refresh).
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]+)/);
    if (match) {
      accessTokenMemory = decodeURIComponent(match[1]);
      return accessTokenMemory;
    }
  }
  return null;
}

function clearAccessToken() {
  accessTokenMemory = null;
  if (typeof document !== 'undefined') {
    document.cookie = 'accessToken=; path=/; max-age=0; SameSite=lax';
  }
}

async function refreshAccessToken(baseUrl: string): Promise<string | null> {
  const res = await fetch(`${baseUrl}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) return null;
  try {
    const { accessToken } = await res.json();
    if (typeof accessToken === 'string') {
      setAccessToken(accessToken);
      return accessToken;
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
  let token = getAccessToken();

  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string>),
  };
  // Only set Content-Type when there is a body — Fastify rejects empty JSON requests
  if (init.body !== undefined && init.body !== null && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res = await fetch(`${baseUrl}${url}`, { ...init, headers, credentials: 'include' });

  // 401 → try to refresh ONCE using refresh-token cookie, regardless of in-memory state
  if (res.status === 401) {
    const refreshed = await refreshAccessToken(baseUrl);
    if (refreshed) {
      headers['Authorization'] = `Bearer ${refreshed}`;
      res = await fetch(`${baseUrl}${url}`, { ...init, headers, credentials: 'include' });
    } else {
      clearAccessToken();
      throw Object.assign(new Error('SESSION_EXPIRED'), { status: 401 });
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw Object.assign(new Error(error.message || 'Request failed'), { status: res.status, data: error });
  }

  return res.json() as Promise<T>;
}
