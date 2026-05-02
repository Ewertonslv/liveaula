'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import useSWRInfinite from 'swr/infinite';
import { format } from 'date-fns';
import { apiFetch } from '@/lib/api';

interface Lesson {
  id: string;
  createdAt: string;
  whatWasDone: string;
  emotion?: string;
  subject: { name: string };
  durationMin: number;
}

interface LessonsPage {
  data: Lesson[];
  meta: { nextCursor: string | null; hasMore: boolean };
}

interface LessonTimelineProps {
  studentId: string;
}

function getKey(studentId: string) {
  return (pageIndex: number, previousPageData: LessonsPage | null): string | null => {
    if (previousPageData && !previousPageData.meta.nextCursor) return null;
    const cursor = previousPageData?.meta.nextCursor;
    return `/lessons/student/${studentId}?limit=10${cursor ? `&cursor=${cursor}` : ''}`;
  };
}

export default function LessonTimeline({ studentId }: LessonTimelineProps) {
  const { data, size, setSize, isValidating } = useSWRInfinite<LessonsPage>(
    getKey(studentId),
    (url: string) => apiFetch<LessonsPage>(url),
    { revalidateFirstPage: false },
  );

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [subjectFilter, setSubjectFilter] = useState<string>('Todas');
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Flatten all loaded lessons
  const allLessons = useMemo(() => data?.flatMap((page) => page.data) ?? [], [data]);

  // Unique subjects from loaded data
  const subjects = useMemo(() => {
    const names = new Set(allLessons.map((l) => l.subject.name));
    return ['Todas', ...Array.from(names)];
  }, [allLessons]);

  // Filtered lessons
  const filteredLessons = useMemo(() => {
    if (subjectFilter === 'Todas') return allLessons;
    return allLessons.filter((l) => l.subject.name === subjectFilter);
  }, [allLessons, subjectFilter]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isValidating) {
          const lastPage = data?.[data.length - 1];
          if (lastPage?.meta.nextCursor) {
            setSize(size + 1);
          }
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [data, isValidating, setSize, size]);

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (!data && isValidating) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Subject filter chips */}
      {subjects.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => setSubjectFilter(subject)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                subjectFilter === subject
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={subjectFilter === subject ? { backgroundColor: '#1A6B74' } : undefined}
            >
              {subject}
            </button>
          ))}
        </div>
      )}

      {/* Lesson cards */}
      {filteredLessons.length === 0 && !isValidating ? (
        <p className="text-gray-400 text-sm text-center py-8">Nenhuma aula registrada ainda</p>
      ) : (
        <div className="space-y-3">
          {filteredLessons.map((lesson, idx) => {
            const isExpanded = expandedIds.has(lesson.id);
            const isLast = idx === filteredLessons.length - 1;
            return (
              <div
                key={lesson.id}
                ref={isLast ? sentinelRef : undefined}
                className="bg-white rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => toggleExpand(lesson.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">
                    {format(new Date(lesson.createdAt), 'd MMM yyyy')}
                  </span>
                  <span
                    className="text-xs text-white px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: '#1A6B74' }}
                  >
                    {lesson.subject.name}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  {lesson.emotion && (
                    <span className="text-lg flex-shrink-0">{lesson.emotion}</span>
                  )}
                  <p
                    className={`text-sm text-gray-700 ${isExpanded ? '' : 'line-clamp-2'}`}
                  >
                    {lesson.whatWasDone}
                  </p>
                </div>
                {!isExpanded && lesson.whatWasDone.length > 120 && (
                  <span className="text-xs text-primary mt-1 block">Ver mais</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Loading spinner */}
      {isValidating && (
        <div className="flex justify-center py-6">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
