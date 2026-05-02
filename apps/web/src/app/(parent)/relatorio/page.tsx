import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from '@/lib/auth';
import type { CursorPage, LessonListItem } from '@liveaula/shared';
import { PrintButton } from './_components/PrintButton';

interface ParentStudent {
  id: string;
  name: string;
  gradeLevel: string;
}

const MONTHS_PT = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

const EMOTION_EMOJI: Record<string, string> = {
  GREAT: '😊', GOOD: '🙂', NEUTRAL: '😐', DIFFICULT: '😤', CHALLENGING: '💪',
};

async function serverFetch<T>(path: string, token?: string): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${baseUrl}${path}`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json();
}

interface Props {
  searchParams: Promise<{ month?: string; studentId?: string }>;
}

export default async function RelatorioPage({ searchParams }: Props) {
  const session = await getServerSession();
  if (!session || session.role !== 'PARENT') redirect('/login');

  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  const params = await searchParams;
  const today = new Date();
  const [yStr, mStr] = (params.month ?? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`).split('-');
  const year = parseInt(yStr, 10) || today.getFullYear();
  const month = parseInt(mStr, 10) || today.getMonth() + 1;
  const monthLabel = MONTHS_PT[month - 1];

  const students = await serverFetch<ParentStudent[]>('/me/students', token).catch(() => [] as ParentStudent[]);
  const studentId = params.studentId ?? students[0]?.id ?? '';
  const student = students.find((s) => s.id === studentId) ?? students[0];

  const from = new Date(year, month - 1, 1).toISOString();
  const to = new Date(year, month, 0, 23, 59, 59).toISOString();

  const lessonsPage = studentId
    ? await serverFetch<CursorPage<LessonListItem>>(
        `/lessons/student/${studentId}?limit=50&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
        token,
      ).catch(() => ({ data: [] as LessonListItem[], meta: { nextCursor: null, hasMore: false } }))
    : { data: [] as LessonListItem[], meta: { nextCursor: null, hasMore: false } };

  const lessons = [...lessonsPage.data].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  const totalLessons = lessons.length;
  const totalMinutes = lessons.reduce((s, l) => s + l.durationMin, 0);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;
  const confirmedCount = lessons.filter((l) => l.confirmedByParentAt).length;
  const pendingCount = totalLessons - confirmedCount;

  // Group by subject
  const bySubject = new Map<string, { name: string; count: number; minutes: number }>();
  for (const l of lessons) {
    const cur = bySubject.get(l.subject.id) ?? { name: l.subject.name, count: 0, minutes: 0 };
    cur.count++;
    cur.minutes += l.durationMin;
    bySubject.set(l.subject.id, cur);
  }
  const subjects = Array.from(bySubject.values()).sort((a, b) => b.count - a.count);

  return (
    <div className="max-w-[800px] mx-auto px-4 py-6 print:py-0 print:px-0 font-nunito">
      {/* Top bar — hidden on print */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link
          href="/feed"
          className="text-primary font-semibold text-sm hover:underline"
        >
          ← Voltar ao feed
        </Link>
        <PrintButton />
      </div>

      {/* Report content */}
      <div className="bg-white rounded-aurora p-8 print:p-0 print:rounded-none border print:border-0"
           style={{ borderColor: 'var(--border-whisper-parent)', boxShadow: 'var(--shadow-parent-soft)' }}>
        {/* Header */}
        <div className="border-b pb-6 mb-6" style={{ borderColor: 'var(--border-whisper-parent)' }}>
          <p className="text-xs uppercase tracking-widest text-primary font-bold mb-2">liveaula</p>
          <h1 className="text-3xl font-bold font-jakarta text-warm-900 tracking-tight">
            Relatório de {monthLabel} de {year}
          </h1>
          {student && (
            <p className="text-warm-700 mt-2">
              <span className="font-semibold">{student.name}</span>
              <span className="text-warm-500"> · {student.gradeLevel}</span>
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-aurora-afternoon rounded-xl p-4 border" style={{ borderColor: 'var(--border-whisper-parent)' }}>
            <p className="text-[11px] uppercase tracking-wide text-warm-500 font-bold">Aulas</p>
            <p className="text-3xl font-bold font-jakarta text-warm-900 mt-1">{totalLessons}</p>
          </div>
          <div className="bg-aurora-morning rounded-xl p-4 border" style={{ borderColor: 'var(--border-whisper-parent)' }}>
            <p className="text-[11px] uppercase tracking-wide text-warm-500 font-bold">Tempo total</p>
            <p className="text-3xl font-bold font-jakarta text-warm-900 mt-1">
              {totalHours.toString().replace('.', ',')}<span className="text-lg text-warm-500">h</span>
            </p>
          </div>
          <div className="bg-aurora-evening rounded-xl p-4 border" style={{ borderColor: 'var(--border-whisper-parent)' }}>
            <p className="text-[11px] uppercase tracking-wide text-warm-500 font-bold">Confirmadas</p>
            <p className="text-3xl font-bold font-jakarta mt-1" style={{ color: '#15803D' }}>{confirmedCount}</p>
          </div>
          <div className="rounded-xl p-4 border" style={{ borderColor: '#FCD34D', backgroundColor: '#FEF3C7' }}>
            <p className="text-[11px] uppercase tracking-wide text-amber-800 font-bold">Pendentes</p>
            <p className="text-3xl font-bold font-jakarta text-amber-900 mt-1">{pendingCount}</p>
          </div>
        </div>

        {/* By subject */}
        {subjects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wide text-warm-500 mb-3">
              Distribuição por matéria
            </h2>
            <ul className="space-y-2">
              {subjects.map((s) => {
                const pct = totalLessons > 0 ? Math.round((s.count / totalLessons) * 100) : 0;
                return (
                  <li key={s.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-warm-900">{s.name}</span>
                      <span className="text-warm-500">
                        {s.count} {s.count === 1 ? 'aula' : 'aulas'} · {Math.round(s.minutes / 60 * 10) / 10}h
                      </span>
                    </div>
                    <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Lessons list */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wide text-warm-500 mb-3">
            Aulas do mês ({totalLessons})
          </h2>
          {lessons.length === 0 ? (
            <p className="text-warm-500 text-sm py-6 text-center">
              Nenhuma aula registrada em {monthLabel} de {year}.
            </p>
          ) : (
            <ul className="space-y-3">
              {lessons.map((l) => {
                const dt = new Date(l.createdAt);
                const dateStr = dt.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
                const timeStr = dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                return (
                  <li
                    key={l.id}
                    className="border rounded-lg p-4 print:break-inside-avoid"
                    style={{ borderColor: 'var(--border-whisper-parent)' }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="text-sm">
                          <span className="font-bold text-warm-900">{dateStr}</span>
                          <span className="text-warm-500"> · {timeStr}</span>
                          <span className="text-warm-500"> · {l.durationMin} min</span>
                        </p>
                        <p className="text-xs text-warm-700 mt-0.5">
                          {l.subject.name} · com {l.professor.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xl">{EMOTION_EMOJI[l.emotion] ?? '😐'}</span>
                        {l.confirmedByParentAt ? (
                          <span
                            className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: '#DCFCE7', color: '#166534' }}
                          >
                            ✓ Confirmada
                          </span>
                        ) : (
                          <span
                            className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
                          >
                            Pendente
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-warm-900 leading-relaxed">{l.whatWasDone}</p>
                    {l.observation && (
                      <p className="text-xs text-warm-700 mt-2 italic border-l-2 pl-3" style={{ borderColor: 'var(--border-whisper-parent)' }}>
                        Observação: {l.observation}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t text-xs text-warm-500 text-center print:mt-12" style={{ borderColor: 'var(--border-whisper-parent)' }}>
          Relatório gerado por liveaula em {new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>
    </div>
  );
}
