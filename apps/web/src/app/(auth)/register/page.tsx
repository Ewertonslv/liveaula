'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password, role: 'PROFESSOR' }),
      });
      await login(data.email, data.password);
      router.push('/onboarding/professor');
    } catch (e: unknown) {
      const err = e as { status?: number };
      if (err.status === 409) setError('Este email já está cadastrado');
      else setError('Erro ao criar conta. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-surface-professor flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100">
          <h1 className="text-2xl font-semibold font-jakarta text-gray-900 mb-2">Criar conta de professor</h1>
          <p className="text-sm text-gray-500 mb-6">Comece a acompanhar as aulas dos seus alunos</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[
              { name: 'name' as const, label: 'Nome completo', type: 'text', placeholder: 'João Silva' },
              { name: 'email' as const, label: 'Email', type: 'email', placeholder: 'seu@email.com' },
              { name: 'password' as const, label: 'Senha', type: 'password', placeholder: 'Mínimo 8 caracteres' },
              { name: 'confirmPassword' as const, label: 'Confirmar senha', type: 'password', placeholder: '••••••••' },
            ].map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  {...register(name)}
                  type={type}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {errors[name] && <p className="mt-1 text-xs text-red-600">{errors[name]?.message}</p>}
              </div>
            ))}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-primary text-white rounded font-medium hover:bg-primary-hover transition-colors disabled:opacity-60"
            >
              {isSubmitting ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <p className="mt-4 text-sm text-center text-gray-600">
            Já tem conta? <a href="/login" className="text-primary hover:underline">Entrar</a>
          </p>
        </div>
      </div>
    </div>
  );
}
