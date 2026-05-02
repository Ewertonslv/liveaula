export type LessonEmotion = 'GREAT' | 'GOOD' | 'NEUTRAL' | 'DIFFICULT' | 'CHALLENGING';
export const LESSON_DURATION_OPTIONS = [15, 30, 45, 60, 90, 120] as const;
export type LessonDuration = typeof LESSON_DURATION_OPTIONS[number];

export interface LessonListItem {
  id: string;
  durationMin: number;
  whatWasDone: string;
  observation: string | null;
  emotion: LessonEmotion;
  notifiedAt: string | null;
  createdAt: string;
  confirmedByParentAt: string | null;
  confirmedByParentId: string | null;
  student: { id: string; name: string; gradeLevel: string; avatarUrl: string | null };
  subject: { id: string; name: string };
  professor: { id: string; name: string; avatarUrl: string | null };
}

export interface CreateLessonInput {
  studentId: string;
  subjectId: string;
  durationMin: LessonDuration;
  whatWasDone: string;
  observation?: string;
  emotion?: LessonEmotion;
}
