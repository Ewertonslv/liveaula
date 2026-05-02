import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../middleware/requireAuth';

const consentBodySchema = z.object({
  consentType: z.enum(['LGPD_PARENTAL_ART14', 'TERMS_OF_USE', 'PRIVACY_POLICY']),
  version: z.string().default('1.0'),
});

export async function consentRoutes(fastify: FastifyInstance) {
  // POST /consent
  fastify.post('/consent', {
    preHandler: [requireAuth],
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const body = consentBodySchema.parse(request.body);
      const userId = request.user.id;

      // Verificar IP real (Railway usa X-Forwarded-For)
      const ip =
        (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || request.ip;

      // Idempotência: se já existe ConsentLog ativo do mesmo tipo, retornar 200 sem duplicar
      const existing = await fastify.prisma.consentLog.findFirst({
        where: { userId, consentType: body.consentType, revokedAt: null },
      });

      if (existing) {
        return reply.send({ id: existing.id, alreadyExisted: true });
      }

      const consentLog = await fastify.prisma.consentLog.create({
        data: {
          userId,
          consentType: body.consentType,
          version: body.version,
          ip,
        },
      });

      return reply.status(201).send(consentLog);
    },
  });
}
