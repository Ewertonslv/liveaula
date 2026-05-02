import { buildApp } from './app';

console.log('[boot] entrypoint reached');
console.log(`[boot] NODE_ENV=${process.env.NODE_ENV} PORT=${process.env.PORT}`);
console.log(`[boot] DATABASE_URL set: ${Boolean(process.env.DATABASE_URL)}`);

// Sentry init lazy + non-blocking — never let it hang the boot
if (process.env.SENTRY_DSN) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/node');
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0,
    });
    console.log('[boot] Sentry initialized');
  } catch (err) {
    console.warn('[boot] Sentry init failed (non-fatal):', err);
  }
}

const start = async () => {
  console.log('[boot] building app...');
  const app = await buildApp();
  console.log('[boot] app built; listening...');
  const port = Number(process.env.PORT) || 3000;
  try {
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`[boot] Server listening on 0.0.0.0:${port}`);
  } catch (err) {
    console.error('[boot] FATAL listen error:', err);
    process.exit(1);
  }
};

const shutdown = async () => {
  console.log('[shutdown] received');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('uncaughtException', (err) => {
  console.error('[fatal] uncaughtException:', err);
  process.exit(1);
});
process.on('unhandledRejection', (err) => {
  console.error('[fatal] unhandledRejection:', err);
});

start().catch((err) => {
  console.error('[fatal] start() rejected:', err);
  process.exit(1);
});
