'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

interface Props {
  lessonId: string;
  initialConfirmedAt: string | null;
}

export function ConfirmPresenceButton({ lessonId, initialConfirmedAt }: Props) {
  const router = useRouter();
  const [confirmedAt, setConfirmedAt] = useState<string | null>(initialConfirmedAt);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiFetch<{ confirmedByParentAt: string }>(
        `/lessons/${lessonId}/confirm`,
        { method: 'POST' },
      );
      setConfirmedAt(res.confirmedByParentAt);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao confirmar';
      setError(message === 'Aula já confirmada' ? 'Esta aula já foi confirmada.' : message);
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmedAt) {
    const date = new Date(confirmedAt).toLocaleDateString('pt-BR', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
    return (
      <div
        className="rounded-xl p-4 mb-4 border flex items-start gap-3"
        style={{ backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }}
      >
        <span className="text-xl">✓</span>
        <div className="flex-1">
          <p className="font-semibold text-emerald-800 text-sm">Presença confirmada</p>
          <p className="text-xs text-emerald-700 mt-0.5">
            Você confirmou esta aula em {date}. Isso vira parte do seu relatório mensal.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-5 mb-4 border"
      style={{
        backgroundColor: '#FEF3C7',
        borderColor: '#FCD34D',
        boxShadow: 'var(--shadow-parent-soft)',
      }}
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="text-xl">📋</span>
        <div className="flex-1">
          <p className="font-semibold text-amber-900 text-sm">Aula aguardando sua confirmação</p>
          <p className="text-xs text-amber-800 mt-1 leading-relaxed">
            O professor declarou que essa aula aconteceu. Confirme para que ela faça parte do seu
            comprovante mensal — ou conteste se algo não bater.
          </p>
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-700 mb-2 px-1">{error}</p>
      )}
      <button
        type="button"
        onClick={onConfirm}
        disabled={submitting}
        className="w-full py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary-hover transition-colors disabled:opacity-60"
      >
        {submitting ? 'Confirmando...' : 'Confirmar que a aula aconteceu'}
      </button>
    </div>
  );
}
