'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';

type Step = 1 | 2 | 3;

interface Step2Data { name: string; gradeLevel: string; subjectId: string }

export default function ProfessorOnboarding() {
  const [step, setStep] = useState<Step>(1);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-surface-professor flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${step >= s ? 'bg-primary' : 'bg-gray-300'}`}
            />
          ))}
        </div>

        {step === 1 && <Step1 onNext={() => setStep(2)} />}
        {step === 2 && <Step2 onNext={() => setStep(3)} onSkip={() => setStep(3)} />}
        {step === 3 && <Step3 onFinish={() => router.push('/dashboard')} />}
      </div>
    </div>
  );
}

function Step1({ onNext }: { onNext: () => void }) {
  const { user } = useAuth();
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (bio.trim()) await apiFetch('/me', { method: 'PATCH', body: JSON.stringify({ bio }) });
    } finally {
      setIsLoading(false);
      onNext();
    }
  };

  return (
    <div className="bg-white rounded-lg p-8 shadow-sm">
      <h2 className="text-xl font-semibold font-jakarta mb-4">Olá, {user?.name?.split(' ')[0]}! Conte um pouco sobre você</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio (opcional)</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={300}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Ex: Professor de Matemática com 10 anos de experiência..."
        />
        <p className="text-xs text-gray-400 mt-1">{bio.length}/300</p>
      </div>
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full py-2.5 bg-primary text-white rounded font-medium hover:bg-primary-hover transition-colors disabled:opacity-60"
      >
        {isLoading ? 'Salvando...' : 'Continuar'}
      </button>
    </div>
  );
}

function Step2({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const { register, handleSubmit, formState: { errors } } = useForm<Step2Data>();

  useState(() => {
    apiFetch<{ id: string; name: string }[]>('/subjects').then(setSubjects).catch(() => {});
  });

  const onSubmit = async (data: Step2Data) => {
    setIsLoading(true);
    try {
      await apiFetch('/students', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      onNext();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-8 shadow-sm">
      <h2 className="text-xl font-semibold font-jakarta mb-4">Adicione seu primeiro aluno</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome do aluno</label>
          <input {...register('name', { required: 'Nome obrigatório' })}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Ex: João Silva" />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Série</label>
          <select {...register('gradeLevel', { required: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">Selecione...</option>
            {['1º EF', '2º EF', '3º EF', '4º EF', '5º EF', '6º EF', '7º EF', '8º EF', '9º EF', '1ª EM', '2ª EM', '3ª EM'].map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Matéria</label>
          <select {...register('subjectId', { required: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">Selecione...</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onSkip} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded font-medium hover:bg-gray-50">
            Pular
          </button>
          <button type="submit" disabled={isLoading} className="flex-1 py-2.5 bg-primary text-white rounded font-medium hover:bg-primary-hover disabled:opacity-60">
            {isLoading ? 'Salvando...' : 'Continuar'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Step3({ onFinish }: { onFinish: () => void }) {
  return (
    <div className="bg-white rounded-lg p-8 shadow-sm text-center">
      <div className="text-5xl mb-4">🎉</div>
      <h2 className="text-xl font-semibold font-jakarta mb-2">Tudo pronto!</h2>
      <p className="text-gray-600 mb-6">Seu perfil está configurado. Comece a registrar as aulas dos seus alunos.</p>
      <div className="mb-6 p-4 bg-primary-muted rounded-lg">
        <p className="text-sm text-primary font-medium">📱 Baixe o app para registrar aulas rapidamente pelo celular</p>
      </div>
      <button onClick={onFinish} className="w-full py-2.5 bg-primary text-white rounded font-medium hover:bg-primary-hover transition-colors">
        Ir para o Dashboard
      </button>
    </div>
  );
}
