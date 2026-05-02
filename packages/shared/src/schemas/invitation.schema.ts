import { z } from 'zod';
export const createInvitationSchema = z.object({ studentId: z.string().cuid(), parentEmail: z.string().email() }).strict();
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
