import { FastifyInstance } from 'fastify';
import { createLessonService } from '../services/lesson.service';
import { createLessonRepository } from '../repositories/lesson.repository';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';
import { createLessonSchema, listLessonsQuerySchema } from '@liveaula/shared';

export async function lessonsRoutes(app: FastifyInstance) {
  const lessonService = createLessonService(app);
  const lessonRepo = createLessonRepository(app.prisma);

  app.post('/', {
    preHandler: [requireRole('PROFESSOR')],
    config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const body = createLessonSchema.parse(request.body);
      const userId = (request.user as any).id ?? request.user.sub;
      try {
        const lesson = await lessonService.createLesson({
          ...body,
          professorId: userId,
          emotion: body.emotion,
        });
        return reply.status(201).send(lesson);
      } catch (err: any) {
        if (err.statusCode) return reply.status(err.statusCode).send({ error: err.message });
        throw err;
      }
    },
  });

  app.get('/', {
    preHandler: [requireRole('PROFESSOR')],
    config: { rateLimit: { max: 120, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const query = listLessonsQuerySchema.parse(request.query);
      const userId = (request.user as any).id ?? request.user.sub;
      const result = await lessonRepo.findManyByProfessor(userId, {
        cursor: query.cursor,
        limit: query.limit,
        studentId: query.studentId,
        subjectId: query.subjectId,
        subjectIds: query.subjectIds,
        from: query.from,
        to: query.to,
      });
      return reply.send(result);
    },
  });

  app.get('/student/:studentId', {
    preHandler: [requireAuth],
    config: { rateLimit: { max: 120, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const { studentId } = request.params as { studentId: string };
      const query = listLessonsQuerySchema.parse(request.query);

      if (request.user.role === 'PROFESSOR') {
        const student = await app.prisma.student.findFirst({
          where: { id: studentId, professorId: request.user.id },
        });
        if (!student) return reply.status(403).send({ error: 'NOT_AUTHORIZED' });
        const result = await lessonRepo.findManyByStudent(studentId, {
          cursor: query.cursor, limit: query.limit, subjectId: query.subjectId,
          subjectIds: query.subjectIds, from: query.from, to: query.to,
        });
        return reply.send(result);
      }

      if (request.user.role === 'PARENT') {
        // FIX I05: lgpdGuard para dados de menor
        const hasConsent = await app.prisma.consentLog.findFirst({
          where: { userId: request.user.id, consentType: 'LGPD_PARENTAL_ART14', revokedAt: null },
        });
        if (!hasConsent) {
          return reply.status(403).send({ error: 'LGPD_CONSENT_REQUIRED' });
        }
        try {
          const result = await lessonRepo.findManyByStudent(studentId, {
            parentId: request.user.id, cursor: query.cursor, limit: query.limit, subjectId: query.subjectId,
            subjectIds: query.subjectIds, from: query.from, to: query.to,
          });
          return reply.send(result);
        } catch (err: any) {
          if (err.statusCode) return reply.status(err.statusCode).send({ error: err.message });
          throw err;
        }
      }

      return reply.status(403).send({ error: 'Forbidden' });
    },
  });

  app.get('/student/:studentId/stats', {
    preHandler: [requireAuth],
    config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const { studentId } = request.params as { studentId: string };
      const { weeks } = request.query as { weeks?: string };
      const weeksNum = Math.min(Math.max(parseInt(weeks ?? '4', 10) || 4, 1), 26);
      const since = new Date(Date.now() - weeksNum * 7 * 24 * 60 * 60 * 1000);

      if (request.user.role === 'PROFESSOR') {
        const owns = await app.prisma.student.findFirst({
          where: { id: studentId, professorId: request.user.id },
          select: { id: true },
        });
        if (!owns) return reply.status(403).send({ error: 'NOT_AUTHORIZED' });
      } else if (request.user.role === 'PARENT') {
        const hasConsent = await app.prisma.consentLog.findFirst({
          where: { userId: request.user.id, consentType: 'LGPD_PARENTAL_ART14', revokedAt: null },
        });
        if (!hasConsent) return reply.status(403).send({ error: 'LGPD_CONSENT_REQUIRED' });
        const link = await app.prisma.studentParent.findFirst({
          where: { studentId, parentId: request.user.id },
          select: { id: true },
        });
        if (!link) return reply.status(403).send({ error: 'NOT_AUTHORIZED' });
      } else {
        return reply.status(403).send({ error: 'Forbidden' });
      }

      const [bySubjectRaw, byEmotionRaw, last] = await Promise.all([
        app.prisma.lesson.groupBy({
          by: ['subjectId'],
          where: { studentId, createdAt: { gte: since } },
          _count: { _all: true },
        }),
        app.prisma.lesson.groupBy({
          by: ['emotion'],
          where: { studentId, createdAt: { gte: since } },
          _count: { _all: true },
        }),
        app.prisma.lesson.findFirst({
          where: { studentId },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        }),
      ]);

      const subjects = await app.prisma.subject.findMany({
        where: { id: { in: bySubjectRaw.map(s => s.subjectId) } },
        select: { id: true, name: true },
      });
      const subjectName = (id: string) => subjects.find(s => s.id === id)?.name ?? 'Outras';

      const bySubject = bySubjectRaw
        .map(s => ({ subjectId: s.subjectId, subjectName: subjectName(s.subjectId), count: s._count._all }))
        .sort((a, b) => b.count - a.count);

      const byEmotion: Record<string, number> = { GREAT: 0, GOOD: 0, NEUTRAL: 0, DIFFICULT: 0, CHALLENGING: 0 };
      for (const e of byEmotionRaw) byEmotion[e.emotion] = e._count._all;

      return reply.send({
        totalLessons: bySubject.reduce((s, x) => s + x.count, 0),
        lastLessonAt: last?.createdAt ?? null,
        bySubject,
        byEmotion,
        weeks: weeksNum,
      });
    },
  });

  app.post('/:id/confirm', {
    preHandler: [requireRole('PARENT')],
    config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const userId = request.user.id;

      const hasConsent = await app.prisma.consentLog.findFirst({
        where: { userId, consentType: 'LGPD_PARENTAL_ART14', revokedAt: null },
      });
      if (!hasConsent) return reply.status(403).send({ error: 'LGPD_CONSENT_REQUIRED' });

      const lesson = await app.prisma.lesson.findUnique({
        where: { id },
        select: { id: true, studentId: true, confirmedByParentAt: true },
      });
      if (!lesson) return reply.status(404).send({ error: 'Aula não encontrada' });

      const link = await app.prisma.studentParent.findFirst({
        where: { studentId: lesson.studentId, parentId: userId },
        select: { id: true },
      });
      if (!link) return reply.status(403).send({ error: 'NOT_AUTHORIZED' });

      if (lesson.confirmedByParentAt) {
        return reply.status(409).send({ error: 'Aula já confirmada' });
      }

      const updated = await app.prisma.lesson.update({
        where: { id },
        data: {
          confirmedByParentAt: new Date(),
          confirmedByParentId: userId,
        },
        select: { id: true, confirmedByParentAt: true, confirmedByParentId: true },
      });

      return reply.send(updated);
    },
  });

  app.get('/:id', {
    preHandler: [requireAuth],
    config: { rateLimit: { max: 120, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const lesson = await lessonRepo.findById(id);
      if (!lesson) return reply.status(404).send({ error: 'Aula não encontrada' });

      if (request.user.role === 'PROFESSOR') {
        const fullLesson = await app.prisma.lesson.findUnique({ where: { id }, select: { professorId: true } });
        if (fullLesson?.professorId !== request.user.id) {
          return reply.status(403).send({ error: 'NOT_AUTHORIZED' });
        }
      } else if (request.user.role === 'PARENT') {
        const hasConsent = await app.prisma.consentLog.findFirst({
          where: { userId: request.user.id, consentType: 'LGPD_PARENTAL_ART14', revokedAt: null },
        });
        if (!hasConsent) return reply.status(403).send({ error: 'LGPD_CONSENT_REQUIRED' });
        const access = await app.prisma.studentParent.findFirst({
          where: { studentId: lesson.student.id, parentId: request.user.id },
        });
        if (!access) return reply.status(403).send({ error: 'NOT_AUTHORIZED' });
      }

      return reply.send(lesson);
    },
  });
}
