export interface Student {
  id: string; name: string; gradeLevel: string; avatarUrl: string | null;
  isActive: boolean; createdAt: string;
  subject: { id: string; name: string };
}
