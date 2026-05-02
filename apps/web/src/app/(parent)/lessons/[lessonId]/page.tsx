import { redirect, notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getServerSession } from '@/lib/auth';
import type { LessonListItem } from '@liveaula/shared';
import { ConfirmPresenceButton } from './_components/ConfirmPresenceButton';

const EMOTION_EMOJI: Record<string, string> = {
  GREAT: '😊',
  GOOD: '🙂',
  NEUTRAL: '😐',
  DIFFICULT: '😤',
  CHALLENGING: '💪',
};

const EMOTION_LABEL: Record<string, string> = {
  GREAT: 'Ótimo',
  GOOD: 'Bom',
  NEUTRAL: 'Neutro',
  DIFFICULT: 'Difícil',
  CHALLENGING: 'Desafiador',
};

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function gradientForHour(dateStr: string): string {
  const h = new Date(dateStr).getHours();
  if (h >= 5 && h < 12) return 'bg-aurora-morning';
  if (h >= 12 && h < 18) return 'bg-aurora-afternoon';
  return 'bg-aurora-evening';
}

async function fetchLesson(lessonId: string, accessToken: string | undefined): Promise<LessonListItem | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const headers: Record<string, string> = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  const res = await fetch(`${baseUrl}/lessons/${lessonId}`, {
    headers,
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json();
}

interface Props {
  params: Promise<{ lessonId: string }>;
}

export default async function LessonDetailPage({ params }: Props) {
  const session = await getServerSession();
  if (!session || session.role !== 'PARENT') redirect('/login');

  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  const { lessonId } = await params;
  const lesson = await fetchLesson(lessonId, accessToken);
  if (!lesson) notFound();

  const formattedDate = format(new Date(lesson.createdAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  const formattedTime = format(new Date(lesson.createdAt), "HH:mm");
  const gradient = gradientForHour(lesson.createdAt);

  return (
    <div className="max-w-[640px] mx-auto px-4 py-6 font-nunito">
      <Link
        href="/feed"
        className="inline-flex items-center gap-1 text-primary font-semibold text-sm mb-5 hover:underline"
      >
        ← Voltar ao feed
      </Link>

      {/* Confirmation banner — actionable PENDENTE / CONFIRMADA */}
      <ConfirmPresenceButton
        lessonId={lesson.id}
        initialConfirmedAt={lesson.confirmedByParentAt}
      />

      {/* Hero card with gradient */}
      <div
        className={`${gradient} rounded-aurora p-5 mb-4 border`}
        style={{
          borderColor: 'var(--border-whisper-parent)',
          boxShadow: 'var(--shadow-parent-soft)',
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          {lesson.professor.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={lesson.professor.avatarUrl}
              alt={lesson.professor.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
              {getInitials(lesson.professor.name)}
            </div>
          )}
          <div className="flex-1">
            <p className="font-semibold text-warm-900 leading-tight">{lesson.professor.name}</p>
            <p className="text-xs text-warm-500 mt-0.5">{formattedDate} às {formattedTime}</p>
          </div>
          <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-md">
            {lesson.subject.name}
          </span>
        </div>

        <h2 className="text-xs font-semibold uppercase tracking-wide text-warm-500 mb-1.5">
          O que foi feito
        </h2>
        <p className="text-warm-900 text-[15px] leading-relaxed">{lesson.whatWasDone}</p>
      </div>

      {/* Observation */}
      {lesson.observation && (
        <div
          className="bg-white rounded-xl p-5 mb-4 border"
          style={{ borderColor: 'var(--border-whisper-parent)' }}
        >
          <h3 className="text-xs font-semibold uppercase tracking-wide text-warm-500 mb-2">
            Observação do professor
          </h3>
          <p className="text-warm-900 text-sm leading-relaxed">{lesson.observation}</p>
        </div>
      )}

      {/* Emotion + duration meta row */}
      <div
        className="flex items-center justify-between bg-white rounded-xl p-4 border"
        style={{ borderColor: 'var(--border-whisper-parent)' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{EMOTION_EMOJI[lesson.emotion] ?? '😐'}</span>
          <div>
            <p className="text-xs text-warm-500 uppercase tracking-wide font-semibold">Humor</p>
            <p className="text-sm text-warm-900 font-semibold">
              {EMOTION_LABEL[lesson.emotion] ?? lesson.emotion}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🕐</span>
          <div>
            <p className="text-xs text-warm-500 uppercase tracking-wide font-semibold">Duração</p>
            <p className="text-sm text-warm-900 font-semibold">{lesson.durationMin} min</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-warm-500 text-center mt-5">
        Aluno: {lesson.student.name} · {lesson.student.gradeLevel}
      </p>
    </div>
  );
}
