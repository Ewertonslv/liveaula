import { z } from 'zod';
const GRADE_LEVELS = ['1º EF','2º EF','3º EF','4º EF','5º EF','6º EF','7º EF','8º EF','9º EF','1ª EM','2ª EM','3ª EM'] as const;
export const createStudentSchema = z.object({ name: z.string().min(2).max(100), gradeLevel: z.enum(GRADE_LEVELS), subjectId: z.string().cuid(), avatarUrl: z.string().url().optional() }).strict();
export const updateStudentSchema = z.object({ name: z.string().min(2).max(100).optional(), gradeLevel: z.enum(GRADE_LEVELS).optional(), subjectId: z.string().cuid().optional(), avatarUrl: z.string().url().optional(), isActive: z.boolean().optional() }).strict();
export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
