export type ConsentType = 'LGPD_PARENTAL_ART14' | 'TERMS_OF_USE' | 'PRIVACY_POLICY';
export interface ConsentLog { id: string; consentType: ConsentType; version: string; ip: string; revokedAt: string | null; createdAt: string }
