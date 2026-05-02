'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { LgpdConsentStep } from './_components/LgpdConsentStep';
import { TrialWelcomeStep } from './_components/TrialWelcomeStep';

type Step = 1 | 2 | 3 | 4;

const step1Schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: 'Senhas não conferem', path: ['confirmPassword'] });

type Step1Form = z.infer<typeof step1Schema>;

function ParentOnboardingInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  const [step, setStep] = useState<Step>(1);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-surface-parent flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`w-2.5 h-2.5 rounded-full transition-colors ${step >= s ? 'bg-primary' : 'bg-gray-300'}`} />
          ))}
        </div>
        {step === 1 && <ParentStep1 email={email} token={token} onNext={() => setStep(2)} />}
        {step === 2 && (
          <div className="bg-white rounded-lg p-8 shadow-sm text-center">
            <h2 className="text-xl font-semibold mb-4">Foto do seu filho (opcional)</h2>
            <p className="text-gray-500 mb-6">Você pode adicionar depois nas configurações</p>
            <button onClick={() => setStep(3)} className="w-full py-2.5 bg-primary text-white rounded font-medium">Continuar</button>
          </div>
        )}
        {step === 3 && <LgpdConsentStep onAccept={() => setStep(4)} />}
        {step === 4 && <TrialWelcomeStep onFinish={() => router.push('/feed')} />}
      </div>
    </div>
  );
}

export default function ParentOnboarding() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-parent flex items-center justify-center"><div className="text-gray-500">Carregando...</div></div>}>
      <ParentOnboardingInner />
    </Suspense>
  );
}

function ParentStep1({ email, token, onNext }: { email: string; token: string; onNext: () => void }) {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
  });

  const onSubmit = async (data: Step1Form) => {
    setError(null);
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: data.name, email, password: data.password, role: 'PARENT', inviteToken: token }),
      });
      await login(email, data.password);
      onNext();
    } catch (e: unknown) {
      const err = e as { status?: number; data?: { message?: string } };
      setError(err.data?.message || 'Erro ao criar conta');
    }
  };

  return (
    <div className="bg-white rounded-lg p-8 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Criar sua conta</h2>
      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input value={email} readOnly className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded text-gray-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Seu nome</label>
          <input {...register('name')} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary" />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
          <input {...register('password')} type="password" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary" />
          {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar senha</label>
          <input {...register('confirmPassword')} type="password" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary" />
          {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-primary text-white rounded font-medium hover:bg-primary-hover disabled:opacity-60">
          {isSubmitting ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>
    </div>
  );
}
