import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from '@/lib/auth';
import type { CursorPage, LessonListItem } from '@liveaula/shared';
import { LessonFeed } from './_components/LessonFeed';

interface ParentStudent {
  id: string;
  name: string;
  gradeLevel: string;
}

async function serverFetch<T>(path: string, token?: string): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await fetch(`${baseUrl}${path}`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json();
}

const MONTHS_PT = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

function startOfMonthIso(d: Date): string {
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

export default async function FeedPage() {
  const session = await getServerSession();
  if (!session || session.role !== 'PARENT') redirect('/login');

  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  // /me/students returns an array (not { data: [...] }) — bug fix.
  const students = await serverFetch<ParentStudent[]>('/me/students', token).catch(() => [] as ParentStudent[]);
  const studentId = students[0]?.id ?? '';
  const studentName = students[0]?.name ?? 'seu filho(a)';

  const monthStart = startOfMonthIso(new Date());
  const today = new Date();
  const monthLabel = MONTHS_PT[today.getMonth()];
  const monthSlug = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  // Initial 10 most recent (used by the LessonFeed client component for pagination)
  const initialData = studentId
    ? await serverFetch<CursorPage<LessonListItem>>(
        `/lessons/student/${studentId}?limit=10`,
        token,
      ).catch(() => ({ data: [], meta: { nextCursor: null, hasMore: false } }))
    : { data: [], meta: { nextCursor: null, hasMore: false } };

  // Lessons of current month for the counter (separate fetch, larger window)
  const monthLessons = studentId
    ? await serverFetch<CursorPage<LessonListItem>>(
        `/lessons/student/${studentId}?limit=50&from=${encodeURIComponent(monthStart)}`,
        token,
      ).catch(() => ({ data: [] as LessonListItem[], meta: { nextCursor: null, hasMore: false } }))
    : { data: [] as LessonListItem[], meta: { nextCursor: null, hasMore: false } };

  const monthCount = monthLessons.data.length;
  const monthMinutes = monthLessons.data.reduce((s, l) => s + l.durationMin, 0);
  const monthHours = Math.round((monthMinutes / 60) * 10) / 10;
  const pendingCount = monthLessons.data.filter((l) => !l.confirmedByParentAt).length;

  // Irregularity detection: most recent lesson > 7 days ago (and at least 1 ever)
  const lastLessonAt = initialData.data[0]?.createdAt ?? null;
  const daysSinceLast = lastLessonAt
    ? Math.floor((Date.now() - new Date(lastLessonAt).getTime()) / (24 * 60 * 60 * 1000))
    : null;
  const showIrregularity = daysSinceLast !== null && daysSinceLast >= 7;

  return (
    <div className="pt-6">
      <h1 className="text-2xl font-bold font-jakarta text-warm-900 tracking-tight mb-1">
        Aulas de {studentName}
      </h1>
      {monthCount > 0 ? (
        <p className="text-warm-500 text-sm mb-2">
          {monthCount} {monthCount === 1 ? 'aula' : 'aulas'} em {monthLabel}
          {monthHours > 0 ? ` · ${monthHours.toString().replace('.', ',')}h totais` : ''}
          {pendingCount > 0 ? (
            <span className="text-amber-700 font-semibold"> · {pendingCount} pendente{pendingCount > 1 ? 's' : ''}</span>
          ) : null}
        </p>
      ) : (
        <p className="text-warm-500 text-sm mb-2">Nenhuma aula em {monthLabel} ainda</p>
      )}
      {monthCount > 0 && (
        <Link
          href={`/relatorio?month=${monthSlug}&studentId=${studentId}`}
          className="inline-block text-xs text-primary font-semibold mb-5 hover:underline"
        >
          Ver relatório do mês →
        </Link>
      )}

      {showIrregularity && (
        <div
          className="mt-2 mb-5 rounded-xl p-4 border flex items-start gap-3"
          style={{ backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }}
        >
          <span className="text-xl">⚠️</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">
              Sem aulas há {daysSinceLast} dias
            </p>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              A última aula registrada foi {daysSinceLast === 1 ? 'ontem' : `${daysSinceLast} dias atrás`}.
              Se isso é estranho pra você, vale conversar com o professor.
            </p>
          </div>
        </div>
      )}

      <LessonFeed initialData={initialData} studentId={studentId} />
    </div>
  );
}
