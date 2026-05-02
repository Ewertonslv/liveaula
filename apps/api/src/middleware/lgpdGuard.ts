import { FastifyRequest, FastifyReply } from 'fastify';

// Throws an error with statusCode=403 so Fastify halts the handler regardless
// of whether lgpdGuard is called as preHandler or inside a handler body.
export async function lgpdGuard(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  if (request.user?.role !== 'PARENT') return;
  const hasConsent = await request.server.prisma.consentLog.findFirst({
    where: {
      userId: request.user.id,
      consentType: 'LGPD_PARENTAL_ART14',
      revokedAt: null,
    },
  });
  if (!hasConsent) {
    const err = Object.assign(new Error('Consentimento LGPD necessário'), {
      statusCode: 403,
      code: 'LGPD_CONSENT_REQUIRED',
    });
    throw err;
  }
}
