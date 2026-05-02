import { z } from 'zod';
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  name: z.string().min(2).max(100),
  role: z.enum(['PROFESSOR', 'PARENT']),
  inviteToken: z.string().optional(),
}).strict();
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) }).strict();
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
