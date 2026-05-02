'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  gradeLevel: z.string().min(1, 'Série obrigatória'),
  subjectId: z.string().min(1, 'Matéria obrigatória'),
});

type FormData = z.infer<typeof schema>;

export default function NewStudentPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    apiFetch<{ id: string; name: string }[]>('/subjects')
      .then(setSubjects)
      .catch(() => {});
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      await apiFetch('/students', { method: 'POST', body: JSON.stringify(data) });
      setToast('Aluno adicionado com sucesso!');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch {
      setToast('Erro ao adicionar aluno. Tente novamente.');
    }
  };

  const grades = ['1º EF', '2º EF', '3º EF', '4º EF', '5º EF', '6º EF', '7º EF', '8º EF', '9º EF', '1ª EM', '2ª EM', '3ª EM'];

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <button onClick={() => router.back()} className="text-primary text-sm hover:underline mb-2 block">← Voltar</button>
        <h1 className="text-2xl font-semibold font-jakarta text-gray-900">Novo aluno</h1>
      </div>

      {toast && (
        <div className={`mb-4 p-3 rounded text-sm ${toast.includes('Erro') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {toast}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome do aluno</label>
          <input {...register('name')} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary" />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Série</label>
          <select {...register('gradeLevel')} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">Selecione...</option>
            {grades.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          {errors.gradeLevel && <p className="text-xs text-red-600 mt-1">{errors.gradeLevel.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Matéria</label>
          <select {...register('subjectId')} className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">Selecione...</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {errors.subjectId && <p className="text-xs text-red-600 mt-1">{errors.subjectId.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full py-2.5 bg-primary text-white rounded font-medium hover:bg-primary-hover disabled:opacity-60">
          {isSubmitting ? 'Salvando...' : 'Adicionar aluno'}
        </button>
      </form>
    </div>
  );
}
