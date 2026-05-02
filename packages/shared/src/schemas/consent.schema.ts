import { z } from 'zod';
export const consentSchema = z.object({ consentType: z.enum(['LGPD_PARENTAL_ART14', 'TERMS_OF_USE', 'PRIVACY_POLICY']), version: z.string().default('1.0') }).strict();
export type ConsentInput = z.infer<typeof consentSchema>;
