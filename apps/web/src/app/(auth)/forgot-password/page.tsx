'use client';
import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await apiFetch('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    } catch {
      // Always show success to avoid enumeration
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-surface-professor flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
          <h1 className="text-2xl font-semibold font-jakarta text-gray-900 mb-2">Esqueceu sua senha?</h1>
          <p className="text-gray-500 text-sm mb-6">Digite seu email e enviaremos um link para redefinir.</p>

          {submitted ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">📧</div>
              <p className="text-gray-700 font-medium">Verifique seu email</p>
              <p className="text-gray-500 text-sm">
                Se este email estiver cadastrado, você receberá as instruções em breve.
              </p>
              <Link href="/login" className="block text-primary hover:underline text-sm">
                Voltar ao login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="seu@email.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary text-white rounded font-medium hover:bg-primary-hover transition-colors disabled:opacity-60"
              >
                {loading ? 'Enviando...' : 'Enviar link de redefinição'}
              </button>
              <p className="text-center text-sm">
                <Link href="/login" className="text-primary hover:underline">
                  Voltar ao login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
