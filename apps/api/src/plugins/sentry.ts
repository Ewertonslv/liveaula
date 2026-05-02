import fp from 'fastify-plugin';
import { FastifyInstance } from 'fastify';

export const sentryPlugin = fp(async (fastify: FastifyInstance) => {
  if (!process.env.SENTRY_DSN) return;
  // @sentry/node is an optional peer dependency — install when SENTRY_DSN is set
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Sentry = require('@sentry/node') as {
    init: (opts: Record<string, unknown>) => void;
    captureException: (err: unknown) => void;
  };
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.1,
  });
  fastify.addHook('onError', async (_request, _reply, error) => {
    Sentry.captureException(error);
  });
});
