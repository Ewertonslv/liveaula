import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { createBillingService } from '../services/billing.service';

export async function cronRoutes(fastify: FastifyInstance) {
  // POST /internal/sync-professor-plans
  // Protegido por X-Internal-Secret (não JWT) — chamado por Railway cron
  fastify.post('/sync-professor-plans', {
    config: process.env.NODE_ENV === 'test' ? {} : { rateLimit: { max: 1, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const secret = request.headers['x-internal-secret'] as string;
      const expected = process.env.INTERNAL_CRON_SECRET || '';

      if (!secret || secret.length !== expected.length) {
        return reply.status(401).send({ error: 'UNAUTHORIZED' });
      }

      const isValid = crypto.timingSafeEqual(
        Buffer.from(secret),
        Buffer.from(expected),
      );

      if (!isValid) {
        return reply.status(401).send({ error: 'UNAUTHORIZED' });
      }

      const billingService = createBillingService(fastify.prisma);
      const result = await billingService.syncAllProfessorsPlanStatus();

      fastify.log.info(result, 'Professor plan sync completed');

      return reply.send({ success: true, ...result });
    },
  });

  // POST /internal/bootstrap-subjects — idempotent seed of subjects (one-time-ish)
  fastify.post('/bootstrap-subjects', {
    config: process.env.NODE_ENV === 'test' ? {} : { rateLimit: { max: 5, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const secret = request.headers['x-internal-secret'] as string;
      const expected = process.env.INTERNAL_CRON_SECRET || '';

      if (!secret || secret.length !== expected.length) {
        return reply.status(401).send({ error: 'UNAUTHORIZED' });
      }
      const isValid = crypto.timingSafeEqual(Buffer.from(secret), Buffer.from(expected));
      if (!isValid) {
        return reply.status(401).send({ error: 'UNAUTHORIZED' });
      }

      const SUBJECTS = [
        'Matemática', 'Português', 'Física', 'Química', 'Biologia',
        'História', 'Geografia', 'Inglês', 'Artes', 'Educação Física',
        'Redação', 'Literatura', 'Filosofia', 'Sociologia', 'Informática',
        'Música', 'Espanhol', 'Francês', 'Libras', 'Robótica',
      ];

      const before = await fastify.prisma.subject.count();
      await Promise.all(
        SUBJECTS.map((name) =>
          fastify.prisma.subject.upsert({ where: { name }, update: {}, create: { name } }),
        ),
      );
      const after = await fastify.prisma.subject.count();

      return reply.send({ success: true, before, after });
    },
  });

  // POST /internal/seed-demo — idempotent demo accounts (admin + professor1 + 2 students + 2 lessons)
  fastify.post('/seed-demo', {
    config: process.env.NODE_ENV === 'test' ? {} : { rateLimit: { max: 5, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const secret = request.headers['x-internal-secret'] as string;
      const expected = process.env.INTERNAL_CRON_SECRET || '';
      if (!secret || secret.length !== expected.length) {
        return reply.status(401).send({ error: 'UNAUTHORIZED' });
      }
      const isValid = crypto.timingSafeEqual(Buffer.from(secret), Buffer.from(expected));
      if (!isValid) {
        return reply.status(401).send({ error: 'UNAUTHORIZED' });
      }

      const adminHash = await bcrypt.hash('Admin@secure1', 12);
      const profHash = await bcrypt.hash('Test@1234', 12);

      await fastify.prisma.user.upsert({
        where: { email: 'admin@liveaula.com' },
        update: {},
        create: {
          email: 'admin@liveaula.com',
          passwordHash: adminHash,
          role: 'ADMIN',
          name: 'Admin liveaula',
          emailVerifiedAt: new Date(),
        },
      });

      const professor = await fastify.prisma.user.upsert({
        where: { email: 'professor1@test.com' },
        update: {},
        create: {
          email: 'professor1@test.com',
          passwordHash: profHash,
          role: 'PROFESSOR',
          name: 'Professor 1',
          emailVerifiedAt: new Date(),
        },
      });

      const math = await fastify.prisma.subject.findUnique({ where: { name: 'Matemática' } });
      const port = await fastify.prisma.subject.findUnique({ where: { name: 'Português' } });
      if (!math || !port) {
        return reply.status(500).send({ error: 'SUBJECTS_MISSING', hint: 'call /internal/bootstrap-subjects first' });
      }

      const existingStudents = await fastify.prisma.student.findMany({
        where: { professorId: professor.id },
      });

      let students = existingStudents;
      if (existingStudents.length === 0) {
        const s1 = await fastify.prisma.student.create({
          data: { name: 'Aluno 1', gradeLevel: '6º EF', professorId: professor.id, subjectId: math.id },
        });
        const s2 = await fastify.prisma.student.create({
          data: { name: 'Aluno 2', gradeLevel: '7º EF', professorId: professor.id, subjectId: port.id },
        });
        students = [s1, s2];

        await Promise.all(
          students.flatMap((student) =>
            [0, 1].map((li) =>
              fastify.prisma.lesson.create({
                data: {
                  studentId: student.id,
                  subjectId: student.subjectId,
                  professorId: student.professorId,
                  durationMin: 60,
                  whatWasDone: `Aula ${li + 1}: revisão de conteúdo programático.`,
                  createdAt: new Date(Date.now() - (li + 1) * 24 * 60 * 60 * 1000),
                },
              }),
            ),
          ),
        );
      }

      return reply.send({
        success: true,
        admin: 'admin@liveaula.com',
        professor: 'professor1@test.com',
        password: 'Test@1234',
        students: students.length,
      });
    },
  });
}
