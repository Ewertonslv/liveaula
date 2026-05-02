import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import cookie from '@fastify/cookie';
import { ZodError } from 'zod';
import { prismaPlugin } from './plugins/prisma';
import { jwtPlugin } from './plugins/jwt';
import { sentryPlugin } from './plugins/sentry';
import { authRoutes } from './routes/auth.routes';
import { healthRoutes } from './routes/health.routes';
import { studentsRoutes } from './routes/students.routes';
import { meRoutes } from './routes/me.routes';
import { invitationsRoutes } from './routes/invitations.routes';
import { lessonsRoutes } from './routes/lessons.routes';
import { subscriptionRoutes } from './routes/subscription.routes';
import { webhooksRoutes } from './routes/webhooks.routes';
import { adminRoutes } from './routes/admin.routes';
import { consentRoutes } from './routes/consent.routes';
import { cronRoutes } from './routes/cron.routes';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: process.env.NODE_ENV !== 'test',
  });

  await app.register(cors, {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3001').split(','),
    credentials: true,
  });

  await app.register(rateLimit, {
    global: false,
  });

  await app.register(cookie, {
    secret: process.env.JWT_SECRET || 'cookie-secret',
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({ error: 'Validation failed', details: error.errors });
    }
    // Fastify HTTP errors (e.g. rate limit 429) have a statusCode
    if ('statusCode' in error && typeof error.statusCode === 'number') {
      return reply.status(error.statusCode).send({ error: error.message });
    }
    // Unknown errors — never leak internals to the client
    app.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  });

  await app.register(prismaPlugin);
  await app.register(jwtPlugin);
  await app.register(sentryPlugin);

  await app.register(healthRoutes);
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(studentsRoutes, { prefix: '/students' });
  await app.register(meRoutes, { prefix: '/me' });
  await app.register(invitationsRoutes, { prefix: '/invitations' });
  await app.register(lessonsRoutes, { prefix: '/lessons' });
  await app.register(subscriptionRoutes, { prefix: '/subscription' });
  await app.register(webhooksRoutes, { prefix: '/webhooks' });
  await app.register(adminRoutes, { prefix: '/admin' });
  await app.register(consentRoutes, { prefix: '' });
  await app.register(cronRoutes, { prefix: '/internal' });

  return app;
}
