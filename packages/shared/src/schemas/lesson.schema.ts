import { z } from 'zod';
export const createLessonSchema = z.object({
  studentId: z.string().cuid(),
  subjectId: z.string().cuid(),
  durationMin: z.union([z.literal(15), z.literal(30), z.literal(45), z.literal(60), z.literal(90), z.literal(120)]),
  whatWasDone: z.string().min(1).max(280),
  observation: z.string().max(500).optional(),
  emotion: z.enum(['GREAT', 'GOOD', 'NEUTRAL', 'DIFFICULT', 'CHALLENGING']).optional(),
}).strict();
export const listLessonsQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  studentId: z.string().cuid().optional(),
  subjectId: z.string().cuid().optional(),
  subjectIds: z.union([z.array(z.string().cuid()), z.string().cuid()])
    .transform(v => Array.isArray(v) ? v : [v])
    .optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
}).strict();
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type ListLessonsQuery = z.infer<typeof listLessonsQuerySchema>;
