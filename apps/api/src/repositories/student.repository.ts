import { PrismaClient } from '@prisma/client';

const STUDENT_SELECT = {
  id: true, name: true, gradeLevel: true, avatarUrl: true,
  isActive: true, createdAt: true,
  subject: { select: { id: true, name: true } },
} as const;

export function createStudentRepository(prisma: PrismaClient) {
  return {
    async create(data: { name: string; gradeLevel: string; subjectId: string; professorId: string; avatarUrl?: string }) {
      return prisma.student.create({ data, select: STUDENT_SELECT });
    },

    async findById(id: string) {
      return prisma.student.findUnique({ where: { id }, select: STUDENT_SELECT });
    },

    async findManyByProfessor(professorId: string, opts?: { search?: string; isActive?: boolean }) {
      return prisma.student.findMany({
        where: {
          professorId,
          isActive: opts?.isActive ?? true,
          ...(opts?.search ? { name: { contains: opts.search, mode: 'insensitive' } } : {}),
        },
        select: STUDENT_SELECT,
        orderBy: { name: 'asc' },
      });
    },

    async update(id: string, data: Partial<{ name: string; gradeLevel: string; subjectId: string; avatarUrl: string; isActive: boolean }>) {
      return prisma.student.update({ where: { id }, data, select: STUDENT_SELECT });
    },

    async checkParentAccess(studentId: string, parentId: string) {
      return prisma.studentParent.findFirst({ where: { studentId, parentId } });
    },
  };
}
