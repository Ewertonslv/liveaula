'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function InviteParentPage({ params }: { params: { studentId: string } }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<{ token: string; inviteUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const webUrl = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch<{ token: string }>('/invitations', {
        method: 'POST',
        body: JSON.stringify({ studentId: params.studentId, parentEmail: email }),
      });
      setResult({ token: data.token, inviteUrl: `${webUrl}/invite/${data.token}` });
    } catch (err: any) {
      setError(err.message || 'Erro ao criar convite');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (result) navigator.clipboard.writeText(result.inviteUrl);
  };

  return (
    <div className="max-w-lg">
      <button onClick={() => router.back()} className="text-primary text-sm hover:underline mb-4 block">
        ← Voltar
      </button>
      <h1 className="text-2xl font-semibold font-jakarta text-gray-900 mb-2">Convidar pai/mãe</h1>
      <p className="text-gray-500 text-sm mb-6">
        O link de convite será enviado para o email informado. Válido por 7 dias.
      </p>

      {!result ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email do pai/mãe</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="pai@email.com"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-white rounded font-medium hover:bg-primary-hover disabled:opacity-60 transition-colors"
          >
            {loading ? 'Enviando...' : '📧 Enviar convite'}
          </button>
        </form>
      ) : (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-green-600 text-lg">✅</span>
            <p className="font-medium text-gray-900">Convite criado com sucesso!</p>
          </div>
          <p className="text-sm text-gray-600 mb-3">Compartilhe o link abaixo com o pai/mãe:</p>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border border-gray-200">
            <span className="text-xs text-gray-700 flex-1 break-all">{result.inviteUrl}</span>
            <button
              onClick={copyLink}
              className="flex-shrink-0 px-3 py-1.5 bg-primary text-white rounded text-xs font-medium hover:bg-primary-hover transition-colors"
            >
              Copiar
            </button>
          </div>
          <button
            onClick={() => router.push('/invitations')}
            className="mt-4 text-sm text-primary hover:underline"
          >
            Ver todos os convites →
          </button>
        </div>
      )}
    </div>
  );
}
