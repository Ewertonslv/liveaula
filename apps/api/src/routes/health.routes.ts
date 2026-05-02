import { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  app.get('/ready', async (_, reply) => {
    try {
      await app.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok' };
    } catch {
      reply.status(503).send({ status: 'error', message: 'Database not ready' });
    }
  });

  app.get('/subjects', {
    config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
    handler: async () => {
      return app.prisma.subject.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      });
    },
  });
}
