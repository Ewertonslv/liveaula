export type UserRole = 'PROFESSOR' | 'PARENT' | 'ADMIN';
export type ProfessorPlanStatus = 'FREE' | 'PAID';

export interface UserPublic {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string | null;
  bio: string | null;
  isActive: boolean;
  planStatus: ProfessorPlanStatus;
  createdAt: string;
}
