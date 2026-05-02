'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import type { SubscriptionStatus } from '@liveaula/shared';

const STATUS_BADGE: Record<SubscriptionStatus, string> = {
  TRIAL: 'bg-yellow-100 text-yellow-700',
  ACTIVE: 'bg-green-100 text-green-700',
  PAST_DUE: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-slate-100 text-slate-500',
  SUSPENDED: 'bg-orange-100 text-orange-700',
};

export interface AdminSubscription {
  id: string;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  parent: { name: string; email: string };
  student: { name: string };
}

interface Props {
  initialSubscriptions: AdminSubscription[];
  nextCursor: string | null;
}

export default function SubscriptionsTable({ initialSubscriptions, nextCursor: initialCursor }: Props) {
  const [subs, setSubs] = useState<AdminSubscription[]>(initialSubscriptions);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  async function handleCancel(id: string) {
    if (!confirm('Cancelar esta assinatura?')) return;
    setCancelling(id);
    try {
      await apiFetch(`/subscription/${id}`, { method: 'DELETE' });
      setSubs((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'CANCELLED' as SubscriptionStatus } : s)),
      );
    } catch {
      // silent
    } finally {
      setCancelling(null);
    }
  }

  async function loadMore() {
    if (!cursor) return;
    setLoading(true);
    try {
      const data = await apiFetch<{ subscriptions: AdminSubscription[]; nextCursor: string | null }>(
        `/admin/subscriptions?limit=20&cursor=${cursor}`,
      );
      setSubs((prev) => [...prev, ...data.subscriptions]);
      setCursor(data.nextCursor);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Pai', 'Filho', 'Status', 'Próxima cobrança', 'Ações'].map((col) => (
                <th key={col} className="text-left px-4 py-2.5 font-medium text-slate-500 text-xs uppercase tracking-wide">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subs.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{sub.parent.name}</div>
                  <div className="text-xs text-slate-400">{sub.parent.email}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">{sub.student.name}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[sub.status]}`}>
                    {sub.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">
                  {sub.currentPeriodEnd
                    ? new Date(sub.currentPeriodEnd).toLocaleDateString('pt-BR')
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  {sub.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleCancel(sub.id)}
                      disabled={cancelling === sub.id}
                      className="text-xs text-red-600 hover:underline disabled:opacity-50"
                    >
                      {cancelling === sub.id ? 'Cancelando…' : 'Cancelar'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {subs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">
                  Nenhuma assinatura encontrada.
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
