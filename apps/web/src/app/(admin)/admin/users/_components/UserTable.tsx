'use client';

import { useState, useMemo } from 'react';
import { apiFetch } from '@/lib/api';
import type { UserPublic } from '@liveaula/shared';

const ROLE_BADGE: Record<string, string> = {
  PROFESSOR: 'bg-blue-100 text-blue-700',
  PARENT: 'bg-green-100 text-green-700',
  ADMIN: 'bg-slate-100 text-slate-600',
};

interface Props {
  initialUsers: UserPublic[];
  nextCursor: string | null;
}

export default function UserTable({ initialUsers, nextCursor: initialCursor }: Props) {
  const [users, setUsers] = useState<UserPublic[]>(initialUsers);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()),
      ),
    [users, search],
  );

  async function loadMore() {
    if (!cursor) return;
    setLoading(true);
    try {
      const data = await apiFetch<{ users: UserPublic[]; nextCursor: string | null }>(
        `/admin/users?limit=20&cursor=${cursor}`,
      );
      setUsers((prev) => [...prev, ...data.users]);
      setCursor(data.nextCursor);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(user: UserPublic) {
    setToggling(user.id);
    try {
      await apiFetch(`/admin/users/${user.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u)),
      );
    } catch {
      // silent
    } finally {
      setToggling(null);
    }
  }

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Buscar por nome ou email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm border border-slate-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A6B74]/40"
      />

      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Nome', 'Email', 'Role', 'Status', 'Criado em'].map((col) => (
                <th key={col} className="text-left px-4 py-2.5 font-medium text-slate-500 text-xs uppercase tracking-wide">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800">{user.name}</td>
                <td className="px-4 py-3 text-slate-500">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${ROLE_BADGE[user.role] ?? 'bg-slate-100 text-slate-600'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleStatus(user)}
                    disabled={toggling === user.id}
                    aria-label={user.isActive ? 'Desativar' : 'Ativar'}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#1A6B74]/40 disabled:opacity-50 ${
                      user.isActive ? 'bg-[#1A6B74]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                        user.isActive ? 'translate-x-4' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">
                  {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {cursor && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="text-sm text-[#1A6B74] hover:underline disabled:opacity-50 disabled:no-underline"
        >
          {loading ? 'Carregando…' : 'Carregar mais'}
        </button>
      )}
    </div>
  );
}
