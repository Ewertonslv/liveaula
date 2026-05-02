import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
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
}
