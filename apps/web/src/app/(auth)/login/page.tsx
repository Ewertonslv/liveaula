'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

type LoginForm = z.infer<typeof schema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    try {
      const user = await login(data.email, data.password);
      if (user.role === 'PROFESSOR') router.push('/dashboard');
      else if (user.role === 'PARENT') router.push('/feed');
      else if (user.role === 'ADMIN') router.push('/admin/users');
    } catch {
      setError('Email ou senha inválidos');
    }
  };

  return (
    <div className="min-h-screen bg-surface-parent flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-jakarta text-warm-900 tracking-tight">liveaula</h1>
          <p className="text-sm text-warm-500 mt-1.5">Aulas que ficam na memória</p>
        </div>
        <div
          className="bg-surface-parent-raised rounded-aurora p-8 border"
          style={{
            borderColor: 'var(--border-whisper-parent)',
            boxShadow: 'var(--shadow-parent-soft)',
          }}
        >
          <h2 className="text-xl font-semibold font-jakarta text-warm-900 mb-1">Entrar</h2>
          <p className="text-sm text-warm-500 mb-6">Continue acompanhando as aulas</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-md text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-1.5">Email</label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="w-full px-3.5 py-2.5 bg-white border rounded-md text-warm-900 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                style={{ borderColor: 'var(--border-whisper-parent)' }}
                placeholder="seu@email.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-warm-700">Senha</label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                  Esqueceu sua senha?
                </Link>
              </div>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="w-full px-3.5 py-2.5 bg-white border rounded-md text-warm-900 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                style={{ borderColor: 'var(--border-whisper-parent)' }}
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-primary text-white rounded-md font-semibold tracking-tight hover:bg-primary-hover active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-parent-soft"
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-warm-600">
            Não tem conta?{' '}
            <a href="/register" className="text-primary hover:underline font-semibold">
              Cadastre-se como professor
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
