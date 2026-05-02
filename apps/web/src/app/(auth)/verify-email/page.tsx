'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMsg('Link inválido.');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? ''}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (res.ok) {
          setStatus('success');
          setTimeout(() => router.push('/dashboard'), 3000);
        } else {
          const data = await res.json().catch(() => ({}));
          setStatus('error');
          setErrorMsg(data.error ?? 'Link inválido ou expirado.');
        }
      })
      .catch(() => {
        setStatus('error');
        setErrorMsg('Erro ao conectar. Tente novamente.');
      });
  }, [token, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm text-center">
        <div className="text-5xl mb-5">
          {status === 'verifying' && '⏳'}
          {status === 'success' && '✅'}
          {status === 'error' && '❌'}
        </div>

        {status === 'verifying' && (
          <>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Verificando seu email...</h1>
            <p className="text-sm text-gray-500">Aguarde um instante.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Email confirmado!</h1>
            <p className="text-sm text-gray-500 mb-4">
              Sua conta está ativa. Redirecionando...
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-2.5 bg-[#1A6B74] text-white text-sm font-semibold rounded-xl hover:bg-[#155960] transition-colors"
            >
              Ir para o painel
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Link inválido</h1>
            <p className="text-sm text-gray-500 mb-4">{errorMsg}</p>
            <Link
              href="/login"
              className="inline-block px-6 py-2.5 bg-[#1A6B74] text-white text-sm font-semibold rounded-xl hover:bg-[#155960] transition-colors"
            >
              Ir para o login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
