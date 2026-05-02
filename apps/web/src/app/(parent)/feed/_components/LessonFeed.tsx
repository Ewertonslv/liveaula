'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import type { CursorPage, LessonListItem } from '@liveaula/shared';
import { apiFetch } from '@/lib/api';
import { LessonFeedCard } from './LessonFeedCard';

interface Props {
  initialData: CursorPage<LessonListItem>;
  studentId: string;
}

type Page = CursorPage<LessonListItem>;

const EMOTION_LABEL: Record<string, string> = {
  GREAT: '😊 Ótimo',
  GOOD: '🙂 Bem',
  NEUTRAL: '😐 Normal',
  DIFFICULT: '😕 Difícil',
  CHALLENGING: '💪 Desafiador',
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 text-center min-w-[90px]">
      <p className="text-lg font-bold text-[#1A6B74]">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

export function LessonFeed({ initialData, studentId }: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');

  const getKey = (pageIndex: number, previousPageData: Page | null) => {
    if (previousPageData && !previousPageData.meta.nextCursor) return null;
    const cursor = previousPageData?.meta.nextCursor;
    return `/lessons/student/${studentId}?limit=20${cursor ? '&cursor=' + cursor : ''}`;
  };

  const { data, setSize, isValidating, mutate } = useSWRInfinite<Page>(
    getKey,
    (url: string) => apiFetch<Page>(url),
    { fallbackData: [initialData], revalidateOnFocus: false },
  );

  useEffect(() => {
    const t = setInterval(() => mutate(), 60_000);
    return () => clearInterval(t);
  }, [mutate]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) setSize((s) => s + 1); },
      { rootMargin: '200px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [setSize]);

  const allLessons = data?.flatMap((page) => page.data) ?? [];

  // Stats
  const stats = useMemo(() => {
    if (allLessons.length === 0) return null;
    const thisMonth = allLessons.filter(l => {
      const d = new Date(l.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const avgMin = Math.round(allLessons.reduce((s, l) => s + (l.durationMin ?? 0), 0) / allLessons.length);
    const emotionCounts: Record<string, number> = {};
    allLessons.forEach(l => { if (l.emotion) emotionCounts[l.emotion] = (emotionCounts[l.emotion] ?? 0) + 1; });
    const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    return { total: allLessons.length, thisMonth, avgMin, topEmotion };
  }, [allLessons]);

  // Search filter (client-side over loaded lessons)
  const filtered = useMemo(() => {
    if (!search.trim()) return allLessons;
    const q = search.toLowerCase();
    return allLessons.filter(l =>
      l.whatWasDone?.toLowerCase().includes(q) ||
      (l as any).subject?.name?.toLowerCase().includes(q) ||
      (l as any).professor?.name?.toLowerCase().includes(q)
    );
  }, [allLessons, search]);

  return (
    <div>
      {/* Stats strip */}
      {stats && (
        <div className="flex gap-3 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          <StatCard label="Total de aulas" value={String(stats.total)} />
          <StatCard label="Este mês" value={String(stats.thisMonth)} />
          <StatCard label="Duração média" value={`${stats.avgMin}min`} />
          {stats.topEmotion && (
            <StatCard label="Humor mais comum" value={EMOTION_LABEL[stats.topEmotion] ?? stats.topEmotion} />
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-5">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="search"
          placeholder="Buscar por conteúdo, matéria ou professor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A6B74]/30 focus:border-[#1A6B74] bg-white"
        />
      </div>

      {/* Lesson list */}
      {filtered.length === 0 && !isValidating ? (
        <p className="text-center text-gray-400 mt-12 text-sm">
          {search ? 'Nenhuma aula encontrada para essa busca.' : 'Ainda não há aulas registradas.'}
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((lesson) => (
            <LessonFeedCard key={lesson.id} lesson={lesson} />
          ))}
          <div ref={sentinelRef} className="h-1" />
          {isValidating && (
            <div className="flex justify-center py-4">
              <div className="h-6 w-6 rounded-full border-2 border-[#1A6B74] border-t-transparent animate-spin" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
