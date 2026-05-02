'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { LessonListItem } from '@liveaula/shared';

const EMOTION_EMOJI: Record<string, string> = {
  GREAT: '😊',
  GOOD: '🙂',
  NEUTRAL: '😐',
  DIFFICULT: '😤',
  CHALLENGING: '💪',
};

// Aurora gradient escolhido pelo horário da aula (DESIGN.md v1.1)
function gradientClassForHour(dateStr: string): string {
  const h = new Date(dateStr).getHours();
  if (h >= 5 && h < 12) return 'bg-aurora-morning';
  if (h >= 12 && h < 18) return 'bg-aurora-afternoon';
  return 'bg-aurora-evening';
}

interface Props {
  lesson: LessonListItem;
}

export function LessonFeedCard({ lesson }: Props) {
  const relativeTime = formatDistanceToNow(new Date(lesson.createdAt), {
    addSuffix: true,
    locale: ptBR,
  });
  const gradient = gradientClassForHour(lesson.createdAt);

  return (
    <Link href={`/parent/lessons/${lesson.id}`} className="block group">
      <article
        className={`${gradient} rounded-aurora p-5 border shadow-parent-soft group-hover:shadow-parent-lifted transition-shadow duration-200`}
        style={{ borderColor: 'var(--border-whisper-parent)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold font-nunito">
              {lesson.professor.name
                .split(' ')
                .slice(0, 2)
                .map((w) => w[0])
                .join('')
                .toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-warm-900 leading-tight">{lesson.professor.name}</p>
              <p className="text-xs text-warm-500">{relativeTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {lesson.confirmedByParentAt ? (
              <span
                className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                style={{ backgroundColor: '#DCFCE7', color: '#166534' }}
                title="Você confirmou esta aula"
              >
                ✓ Confirmada
              </span>
            ) : (
              <span
                className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
                title="Aguarda sua confirmação"
              >
                Pendente
              </span>
            )}
            <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-md">
              {lesson.subject.name}
            </span>
          </div>
        </div>

        {/* Body */}
        <p className="text-[15px] text-warm-900 leading-relaxed mb-3 font-nunito">
          {lesson.whatWasDone}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-xl" aria-label={lesson.emotion}>
            {EMOTION_EMOJI[lesson.emotion] ?? '😐'}
          </span>
          <span className="text-warm-600 text-xs font-medium">{lesson.durationMin} min</span>
        </div>
      </article>
    </Link>
  );
}
