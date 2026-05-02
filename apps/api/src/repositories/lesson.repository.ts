import { PrismaClient, LessonEmotion } from '@prisma/client';

const LESSON_SELECT = {
  id: true, durationMin: true, whatWasDone: true, observation: true,
  emotion: true, notifiedAt: true, createdAt: true,
  confirmedByParentAt: true, confirmedByParentId: true,
  student: { select: { id: true, name: true, gradeLevel: true, avatarUrl: true } },
  subject: { select: { id: true, name: true } },
  professor: { select: { id: true, name: true, avatarUrl: true } },
} as const;

export function createLessonRepository(prisma: PrismaClient) {
  return {
    async create(data: {
      studentId: string;
      subjectId: string;
      professorId: string;
      durationMin: number;
      whatWasDone: string;
      observation?: string;
      emotion?: LessonEmotion;
    }) {
      return prisma.lesson.create({ data, select: LESSON_SELECT });
    },

    async findManyByProfessor(professorId: string, opts: {
      cursor?: string; limit: number; studentId?: string; subjectId?: string;
      subjectIds?: string[]; from?: string; to?: string;
    }) {
      const cursorItem = opts.cursor
        ? await prisma.lesson.findUnique({ where: { id: opts.cursor }, select: { createdAt: true, id: true } })
        : null;

      const subjectFilter = opts.subjectIds?.length
        ? { subjectId: { in: opts.subjectIds } }
        : opts.subjectId ? { subjectId: opts.subjectId } : {};
      const dateFilter = (opts.from || opts.to) ? {
        createdAt: {
          ...(opts.from ? { gte: new Date(opts.from) } : {}),
          ...(opts.to ? { lte: new Date(opts.to) } : {}),
        },
      } : {};

      const lessons = await prisma.lesson.findMany({
        where: {
          professorId,
          ...(opts.studentId ? { studentId: opts.studentId } : {}),
          ...subjectFilter,
          ...dateFilter,
          ...(cursorItem ? { OR: [
            { createdAt: { lt: cursorItem.createdAt } },
            { createdAt: cursorItem.createdAt, id: { lt: cursorItem.id } },
          ]} : {}),
        },
        select: LESSON_SELECT,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: opts.limit + 1,
      });

      const hasMore = lessons.length > opts.limit;
      const data = hasMore ? lessons.slice(0, opts.limit) : lessons;
      return {
        data,
        meta: { nextCursor: hasMore ? data[data.length - 1].id : null, hasMore },
      };
    },

    async findManyByStudent(studentId: string, opts: {
      parentId?: string; cursor?: string; limit: number; subjectId?: string;
      subjectIds?: string[]; from?: string; to?: string;
    }) {
      if (opts.parentId) {
        const access = await prisma.studentParent.findFirst({
          where: { studentId, parentId: opts.parentId },
        });
        if (!access) throw { statusCode: 403, message: 'Acesso negado' };
      }

      const cursorItem = opts.cursor
        ? await prisma.lesson.findUnique({ where: { id: opts.cursor }, select: { createdAt: true, id: true } })
        : null;

      const subjectFilter = opts.subjectIds?.length
        ? { subjectId: { in: opts.subjectIds } }
        : opts.subjectId ? { subjectId: opts.subjectId } : {};
      const dateFilter = (opts.from || opts.to) ? {
        createdAt: {
          ...(opts.from ? { gte: new Date(opts.from) } : {}),
          ...(opts.to ? { lte: new Date(opts.to) } : {}),
        },
      } : {};

      const lessons = await prisma.lesson.findMany({
        where: {
          studentId,
          ...subjectFilter,
          ...dateFilter,
          ...(cursorItem ? { OR: [
            { createdAt: { lt: cursorItem.createdAt } },
            { createdAt: cursorItem.createdAt, id: { lt: cursorItem.id } },
          ]} : {}),
        },
        select: LESSON_SELECT,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: opts.limit + 1,
      });

      const hasMore = lessons.length > opts.limit;
      const data = hasMore ? lessons.slice(0, opts.limit) : lessons;
      return {
        data,
        meta: { nextCursor: hasMore ? data[data.length - 1].id : null, hasMore },
      };
    },

    async findById(id: string) {
      return prisma.lesson.findUnique({ where: { id }, select: LESSON_SELECT });
    },

    async updateNotifiedAt(id: string) {
      return prisma.lesson.update({ where: { id }, data: { notifiedAt: new Date() } });
    },
  };
}
