import { cookies } from 'next/headers';
import Link from 'next/link';
import { StudentGrid } from './_components/StudentGrid';
import { EmptyState } from './_components/EmptyState';

interface Student {
  id: string;
  name: string;
  gradeLevel: string;
  avatarUrl?: string;
  isActive: boolean;
  subject: { id: string; name: string };
}

interface Lesson {
  id: string;
  durationMin: number;
  whatWasDone: string;
  emotion: string;
  createdAt: string;
  student: { id: string; name: string };
  subject: { id: string; name: string };
}

interface BillingData {
  professorPlanStatus: 'FREE' | 'PAID';
  paidParentsCount: number;
  paidParentsTarget: number;
}

async function fetchData() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const headers: Record<string, string> = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

  const [studentsRes, meRes, lessonsRes, billingRes] = await Promise.allSettled([
    fetch(`${apiUrl}/students?isActive=true`, { headers, cache: 'no-store' }),
    fetch(`${apiUrl}/auth/me`, { headers, cache: 'no-store' }),
    fetch(`${apiUrl}/lessons?limit=10`, { headers, cache: 'no-store' }),
    fetch(`${apiUrl}/me/billing/parents`, { headers, cache: 'no-store' }),
  ]);

  const students: Student[] =
    studentsRes.status === 'fulfilled' && studentsRes.value.ok
      ? await studentsRes.value.json()
      : [];

  const me =
    meRes.status === 'fulfilled' && meRes.value.ok
      ? await meRes.value.json()
      : null;

  const lessonsPage =
    lessonsRes.status === 'fulfilled' && lessonsRes.value.ok
      ? await lessonsRes.value.json()
      : { data: [] };
  const lessons: Lesson[] = lessonsPage.data ?? [];

  const billing: BillingData | null =
    billingRes.status === 'fulfilled' && billingRes.value.ok
      ? await billingRes.value.json()
      : null;

  return { students, me, lessons, billing };
}

function calcStreak(lessons: Lesson[]): number {
  if (lessons.length === 0) return 0;
  const days = new Set(
    lessons.map((l) => new Date(l.createdAt).toISOString().slice(0, 10)),
  );
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    if (days.has(iso)) streak++;
    else if (i > 0) break;
  }
  return streak;
}

function lessonsToday(lessons: Lesson[]): number {
  const todayISO = new Date().toISOString().slice(0, 10);
  return lessons.filter((l) => l.createdAt.slice(0, 10) === todayISO).length;
}

const EMOTION_EMOJI: Record<string, string> = {
  GREAT: '😊',
  GOOD: '🙂',
  NEUTRAL: '😐',
  DIFFICULT: '😕',
  CHALLENGING: '💪',
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `há ${d}d`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: 'primary' | 'accent' | 'success';
}) {
  const accentColor =
    accent === 'accent' ? 'text-accent' :
    accent === 'success' ? 'text-emerald-600' :
    'text-primary';
  return (
    <div
      className="bg-white rounded-xl p-4 border"
      style={{
        borderColor: 'var(--border-whisper-professor)',
        boxShadow: 'var(--shadow-professor-soft)',
      }}
    >
      <p className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">{label}</p>
      <p className={`text-2xl font-bold font-jakarta tracking-tight mt-1 ${accentColor}`}>{value}</p>
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const { students, me, lessons, billing } = await fetchData();

  const greetingName = me?.name?.split(' ')[0] ?? 'professor';
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const streak = calcStreak(lessons);
  const todayCount = lessonsToday(lessons);
  const isFree = me?.planStatus === 'FREE';
  const paidCount = billing?.paidParentsCount ?? 0;
  const paidTarget = billing?.paidParentsTarget ?? 5;
  const remainingForFree = Math.max(0, paidTarget - paidCount);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-jakarta text-gray-900 tracking-tight">
          Olá, {greetingName} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1 capitalize">{today}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Aulas hoje"
          value={todayCount}
          hint={todayCount === 0 ? 'Registre a primeira' : todayCount === 1 ? 'aula registrada' : 'aulas registradas'}
          accent="primary"
        />
        <StatCard
          label="Sequência"
          value={streak === 0 ? '—' : `${streak}d`}
          hint={streak >= 2 ? 'dias seguidos 🔥' : streak === 1 ? 'comece a sequência hoje' : 'sem sequência'}
          accent={streak >= 2 ? 'accent' : 'primary'}
        />
        <StatCard
          label="Alunos ativos"
          value={students.length}
          hint={students.length === 0 ? 'Nenhum cadastrado' : students.length === 1 ? 'aluno' : 'alunos'}
          accent="primary"
        />
        <StatCard
          label="Plano"
          value={isFree ? 'GRÁTIS' : 'R$ 49'}
          hint={isFree
            ? `${paidCount}/${paidTarget} pais ativos`
            : remainingForFree === 0 ? 'Aguardando recálculo' : `Faltam ${remainingForFree} para grátis`}
          accent={isFree ? 'success' : 'primary'}
        />
      </div>

      {/* Two-column section: recent lessons + plan card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Recent lessons (2/3) */}
        <div className="lg:col-span-2">
          <div
            className="bg-white rounded-xl p-5 border"
            style={{
              borderColor: 'var(--border-whisper-professor)',
              boxShadow: 'var(--shadow-professor-soft)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold font-jakarta text-gray-900">Aulas recentes</h2>
              {lessons.length > 0 && (
                <Link
                  href="/students"
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Ver tudo →
                </Link>
              )}
            </div>
            {lessons.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-sm text-gray-500 mb-3">Nenhuma aula registrada ainda.</p>
                <Link
                  href="/register-lesson"
                  className="inline-block px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-hover"
                >
                  Registrar primeira aula
                </Link>
              </div>
            ) : (
              <ul className="divide-y" style={{ borderColor: 'var(--border-whisper-professor)' }}>
                {lessons.slice(0, 5).map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/students/${l.student.id}`}
                      className="flex items-center gap-3 py-3 -mx-2 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-xl shrink-0">{EMOTION_EMOJI[l.emotion] ?? '📝'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {l.student.name} <span className="text-gray-400 font-normal">·</span>{' '}
                          <span className="text-gray-600 font-medium">{l.subject.name}</span>
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{l.whatWasDone}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-400">{relativeTime(l.createdAt)}</p>
                        <p className="text-xs text-gray-600 font-medium mt-0.5">{l.durationMin}min</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Plan + actions (1/3) */}
        <div className="space-y-4">
          {/* Plan card */}
          <div
            className={`rounded-xl p-5 border ${isFree ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{isFree ? '🎉' : '💳'}</span>
              <p className="text-xs uppercase tracking-wide font-bold text-gray-700">
                {isFree ? 'Plano grátis ativo' : 'Plano pago'}
              </p>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {isFree
                ? `Você tem ${paidCount} pais com assinatura ativa. Mantenha 5 ou mais para continuar grátis.`
                : remainingForFree === 0
                  ? 'Você atingiu o critério. Recálculo no próximo ciclo.'
                  : `Faltam ${remainingForFree} ${remainingForFree === 1 ? 'pai pagante' : 'pais pagantes'} para o plano ficar grátis.`}
            </p>
            {!isFree && (
              <div className="mt-3 h-1.5 bg-white/70 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${Math.min(100, (paidCount / paidTarget) * 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div
            className="bg-white rounded-xl p-5 border space-y-2"
            style={{
              borderColor: 'var(--border-whisper-professor)',
              boxShadow: 'var(--shadow-professor-soft)',
            }}
          >
            <p className="text-xs uppercase tracking-wide font-bold text-gray-400 mb-2">Atalhos</p>
            <Link
              href="/register-lesson"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover transition-colors"
            >
              <span>📝</span> Registrar aula
            </Link>
            <Link
              href="/students/new"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 font-medium border"
              style={{ borderColor: 'var(--border-whisper-professor)' }}
            >
              <span>➕</span> Novo aluno
            </Link>
            <Link
              href="/invitations"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 font-medium border"
              style={{ borderColor: 'var(--border-whisper-professor)' }}
            >
              <span>✉️</span> Convidar pai
            </Link>
          </div>
        </div>
      </div>

      {/* Students grid */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold font-jakarta text-gray-900">Meus alunos</h2>
          {students.length > 0 && (
            <span className="text-xs text-gray-500">
              {students.length} {students.length === 1 ? 'aluno' : 'alunos'}
            </span>
          )}
        </div>
        {students.length === 0 ? <EmptyState /> : <StudentGrid initialStudents={students} />}
      </div>
    </div>
  );
}
