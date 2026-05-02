'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiFetch } from '@/lib/api';
import { NotificationPreview } from './NotificationPreview';

const schema = z.object({
  studentId: z.string().min(1, 'Selecione um aluno'),
  subjectId: z.string().min(1, 'Matéria obrigatória'),
  durationMin: z.number().min(1, 'Duração obrigatória'),
  whatWasDone: z.string().min(1, 'Campo obrigatório').max(280, 'Máximo 280 caracteres'),
  observation: z.string().max(500).optional(),
  emotion: z.enum(['GREAT', 'GOOD', 'NEUTRAL', 'DIFFICULT', 'CHALLENGING']).optional(),
});

type FormData = z.infer<typeof schema>;
type LessonEmotion = 'GREAT' | 'GOOD' | 'NEUTRAL' | 'DIFFICULT' | 'CHALLENGING';

interface Student { id: string; name: string; subject: { id: string; name: string } }
interface LessonResult { id: string; whatWasDone: string; student: { id: string; name: string } }

const DURATIONS = [15, 30, 45, 60, 90, 120];
const EMOTIONS: { value: LessonEmotion; emoji: string; label: string }[] = [
  { value: 'GREAT', emoji: '😊', label: 'Ótimo' },
  { value: 'GOOD', emoji: '🙂', label: 'Bem' },
  { value: 'NEUTRAL', emoji: '😐', label: 'Normal' },
  { value: 'DIFFICULT', emoji: '😕', label: 'Difícil' },
  { value: 'CHALLENGING', emoji: '💪', label: 'Desafiador' },
];

export function RegisterLessonForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedStudentId = searchParams.get('studentId');

  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [createdLesson, setCreatedLesson] = useState<LessonResult | null>(null);
  const [showObservation, setShowObservation] = useState(false);

  const { control, register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { durationMin: 60, emotion: 'NEUTRAL' },
  });

  const watchedWhatWasDone = watch('whatWasDone', '');
  const watchedStudentId = watch('studentId');
  const watchedDuration = watch('durationMin');

  // Load students + apply smart defaults
  useEffect(() => {
    setStudentsLoading(true);
    setStudentsError(null);
    apiFetch<Student[]>('/students?isActive=true').then((data) => {
      setStudents(data);
      const targetId = preselectedStudentId || localStorage.getItem('liveaula.lastStudentId');
      const lastDuration = localStorage.getItem('liveaula.lastDurationMin');
      if (targetId) {
        const found = data.find((s) => s.id === targetId);
        if (found) {
          setValue('studentId', found.id);
          setValue('subjectId', found.subject.id);
        }
      }
      if (lastDuration) setValue('durationMin', parseInt(lastDuration, 10));
    }).catch((err: { status?: number; message?: string }) => {
      if (err?.status === 401 || err?.message === 'SESSION_EXPIRED') {
        setStudentsError('Sessão expirou. Faça login novamente.');
      } else {
        setStudentsError('Não foi possível carregar seus alunos. Tente recarregar a página.');
      }
    }).finally(() => setStudentsLoading(false));
  }, [setValue, preselectedStudentId]);

  // Auto-update subject when student changes
  useEffect(() => {
    if (!watchedStudentId) return;
    const s = students.find((s) => s.id === watchedStudentId);
    if (s) setValue('subjectId', s.subject.id);
  }, [watchedStudentId, students, setValue]);

  const onSubmit = async (data: FormData) => {
    const lesson = await apiFetch<LessonResult>('/lessons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    localStorage.setItem('liveaula.lastStudentId', data.studentId);
    localStorage.setItem('liveaula.lastDurationMin', String(data.durationMin));
    setCreatedLesson(lesson);
  };

  // Early returns SEMPRE depois de TODOS os hooks (regra do React).
  if (createdLesson) {
    return (
      <NotificationPreview
        lesson={createdLesson}
        onRegisterAnother={() => {
          setCreatedLesson(null);
          setValue('whatWasDone', '');
          setValue('observation', '');
        }}
        onViewHistory={() => window.location.href = `/students/${createdLesson.student.id}`}
      />
    );
  }

  if (studentsError) {
    return (
      <div className="bg-white rounded-lg p-6 border border-red-200 text-center">
        <p className="text-sm text-red-700 mb-3">{studentsError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="text-sm text-primary font-semibold hover:underline"
        >
          Recarregar página
        </button>
      </div>
    );
  }

  if (!studentsLoading && students.length === 0) {
    return (
      <div
        className="bg-white rounded-lg p-8 border text-center"
        style={{ borderColor: 'var(--border-whisper-professor)' }}
      >
        <div className="text-5xl mb-3">📚</div>
        <h2 className="text-lg font-semibold font-jakarta text-gray-900 mb-2">
          Você ainda não tem alunos
        </h2>
        <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
          Para registrar uma aula, primeiro cadastre o aluno que você atende.
          O cadastro leva menos de 30 segundos.
        </p>
        <button
          type="button"
          onClick={() => router.push('/students/new')}
          className="px-5 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors"
        >
          Cadastrar primeiro aluno →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg p-6 shadow-sm space-y-5">
      {/* Aluno */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Aluno <span className="text-red-500">*</span></label>
        <Controller
          control={control}
          name="studentId"
          render={({ field }) => (
            <select {...field} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900">
              <option value="">Selecione um aluno...</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}
        />
        {errors.studentId && <p className="text-xs text-red-600 mt-1">{errors.studentId.message}</p>}
      </div>

      {/* Duração */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Duração</label>
        <div className="flex gap-2 flex-wrap">
          {DURATIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setValue('durationMin', d)}
              className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${watchedDuration === d ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-300 hover:border-primary'}`}
            >
              {d >= 60 ? `${d / 60}h` : `${d}min`}
            </button>
          ))}
        </div>
      </div>

      {/* O que foi feito */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          O que foi feito <span className="text-red-500">*</span>
          <span className={`ml-2 text-xs ${watchedWhatWasDone.length > 250 ? 'text-red-500' : 'text-gray-400'}`}>
            {watchedWhatWasDone.length}/280
          </span>
        </label>
        <textarea
          {...register('whatWasDone')}
          autoFocus
          rows={4}
          maxLength={280}
          placeholder="Descreva o conteúdo abordado na aula..."
          className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-gray-900 ${errors.whatWasDone ? 'border-red-500' : 'border-gray-300'}`}
        />
        {errors.whatWasDone && <p className="text-xs text-red-600 mt-1">{errors.whatWasDone.message}</p>}
      </div>

      {/* Observação colapsável */}
      <div>
        <button type="button" onClick={() => setShowObservation(!showObservation)} className="text-sm text-primary font-medium hover:underline">
          {showObservation ? '▾' : '▸'} Observação ao pai (opcional)
        </button>
        {showObservation && (
          <textarea
            {...register('observation')}
            rows={2}
            maxLength={500}
            placeholder="Algo que os pais precisam saber..."
            className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
          />
        )}
      </div>

      {/* Humor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Humor do aluno</label>
        <div className="flex gap-3">
          {EMOTIONS.map(({ value, emoji, label }) => (
            <Controller
              key={value}
              control={control}
              name="emotion"
              render={({ field }) => (
                <button
                  type="button"
                  onClick={() => field.onChange(value)}
                  title={label}
                  className={`flex flex-col items-center p-2 rounded-lg border-2 transition-colors ${field.value === value ? 'border-primary bg-primary-muted' : 'border-transparent hover:border-gray-200'}`}
                >
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-xs text-gray-500 mt-0.5">{label}</span>
                </button>
              )}
            />
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition-colors disabled:opacity-60 text-base"
      >
        {isSubmitting ? 'Registrando...' : 'Registrar Aula →'}
      </button>
    </form>
  );
}
