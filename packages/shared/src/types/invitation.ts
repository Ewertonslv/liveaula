export type InvitationStatus = 'PENDING' | 'CLAIMED' | 'EXPIRED';
export interface Invitation {
  id: string; token: string; parentEmail: string; status: InvitationStatus;
  expiresAt: string; claimedAt: string | null; createdAt: string;
  student: { id: string; name: string; subject: { id: string; name: string } };
}
export interface InvitationPublic {
  studentName: string; subjectName: string; professorName: string;
  parentEmail: string; expiresAt: string;
}
