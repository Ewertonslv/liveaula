'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export function EmailVerificationBanner() {
  const [show, setShow] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch<{ emailVerifiedAt: string | null }>('/auth/me')
      .then((me) => { if (!me.emailVerifiedAt) setShow(true); })
      .catch(() => {});
  }, []);

  if (!show) return null;

  async function resend() {
    setLoading(true);
    try {
      await apiFetch('/auth/resend-verification', { method: 'POST' });
      setSent(true);
    } catch {
      /* silencia */
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between gap-4 text-sm">
      <span className="text-amber-800">
        📧 Confirme seu email para garantir acesso contínuo à sua conta.
      </span>
      {sent ? (
        <span className="text-amber-700 font-medium shrink-0">Email reenviado ✓</span>
      ) : (
        <button
          onClick={resend}
          disabled={loading}
          className="shrink-0 text-amber-700 font-semibold underline underline-offset-2 hover:text-amber-900 disabled:opacity-60"
        >
          {loading ? 'Enviando...' : 'Reenviar email'}
        </button>
      )}
      <button
        onClick={() => setShow(false)}
        className="shrink-0 text-amber-500 hover:text-amber-700 text-lg leading-none"
        aria-label="Fechar"
      >
        ×
      </button>
    </div>
  );
}
