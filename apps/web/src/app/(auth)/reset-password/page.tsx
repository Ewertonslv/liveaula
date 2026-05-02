'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="text-center space-y-3">
        <p className="text-red-600 font-medium">Link inválido ou expirado.</p>
        <Link href="/forgot-password" className="text-primary hover:underline text-sm">
          Solicitar novo link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError('A senha deve ter no mínimo 8 caracteres'); return; }
    if (password !== confirm) { setError('As senhas não coincidem'); return; }
    setLoading(true);
    try {
      await apiFetch('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setDone(true);
      setTimeout(() => router.push('/login'), 2500);
    } catch {
      setError('Token inválido ou expirado. Solicite um novo link.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center space-y-3">
        <div className="text-4xl">✅</div>
        <p className="text-gray-700 font-medium">Senha redefinida com sucesso!</p>
        <p className="text-gray-500 text-sm">Redirecionando para o login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoFocus
          minLength={8}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Mínimo 8 caracteres"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nova senha</label>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Repita a senha"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-primary text-white rounded font-medium hover:bg-primary-hover transition-colors disabled:opacity-60"
      >
        {loading ? 'Salvando...' : 'Redefinir senha'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-surface-professor flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
          <h1 className="text-2xl font-semibold font-jakarta text-gray-900 mb-2">Redefinir senha</h1>
          <p className="text-gray-500 text-sm mb-6">Digite sua nova senha abaixo.</p>
          <Suspense fallback={<p className="text-gray-400 text-sm">Carregando...</p>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
