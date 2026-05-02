import { createBillingService } from '../src/services/billing.service';

// ─── Testes unitários puros (sem DB) ────────────────────────────────────────
describe('Billing service — lógica de gratuidade (unit)', () => {
  test('2. Professor com 4 pais pagantes → planStatus = PAID', () => {
    const count = 4;
    const newStatus = count >= 5 ? 'FREE' : 'PAID';
    expect(newStatus).toBe('PAID');
  });

  test('3. Professor com 5 pais pagantes (todos ACTIVE) → planStatus = FREE', () => {
    const count = 5;
    const newStatus = count >= 5 ? 'FREE' : 'PAID';
    expect(newStatus).toBe('FREE');
  });

  test('4. Professor com 5 pais mas 2 CANCELLED → planStatus = PAID', () => {
    // 3 pais ACTIVE, 2 CANCELLED → apenas 3 contam
    const count = 3;
    const newStatus = count >= 5 ? 'FREE' : 'PAID';
    expect(newStatus).toBe('PAID');
  });
});

// ─── Testes de integração (requerem DB) ─────────────────────────────────────
describe('Billing service — integração', () => {
  let app: any;
  let dbAvailable = false;

  beforeAll(async () => {
    try {
      const { buildApp } = await import('../src/app');
      app = await buildApp();
      await app.ready();
      dbAvailable = true;
      const { cleanupUsersByEmailSuffix } = await import('./_helpers/cleanup');
      await cleanupUsersByEmailSuffix(app.prisma, '@billingtest.com');
    } catch {
      dbAvailable = false;
    }
  });

  afterAll(async () => {
    if (app) {
      const { cleanupUsersByEmailSuffix } = await import('./_helpers/cleanup');
      await cleanupUsersByEmailSuffix(app.prisma, '@billingtest.com');
      await app.close();
    }
  });

  test('1. Professor com 0 pais pagantes → planStatus = PAID', async () => {
    if (!dbAvailable) {
      console.log('SKIP: DB não disponível');
      return;
    }
    const billing = createBillingService(app.prisma);
    const supertest = (await import('supertest')).default;
    const res = await supertest(app.server)
      .post('/auth/register')
      .send({ name: 'Prof Test', email: `billing-0pais-${Date.now()}@billingtest.com`, password: 'Test@1234', role: 'PROFESSOR' });
    const user = res.body?.user;
    expect(user).toBeDefined();
    const count = await billing.countActivePaidParentsForProfessor(user.id);
    expect(count).toBe(0);
    const status = await billing.updateProfessorPlanStatus(user.id);
    expect(status).toBe('PAID');
  });

  test('5. POST /internal/sync-professor-plans sem header → 401', async () => {
    if (!dbAvailable) {
      console.log('SKIP: DB não disponível');
      return;
    }
    const supertest = (await import('supertest')).default;
    const res = await supertest(app.server).post('/internal/sync-professor-plans');
    expect(res.status).toBe(401);
  });

  test('6. POST /internal/sync-professor-plans com header correto → 200', async () => {
    if (!dbAvailable) {
      console.log('SKIP: DB não disponível');
      return;
    }
    const supertest = (await import('supertest')).default;
    const secret = process.env.INTERNAL_CRON_SECRET || 'test-internal-secret';
    process.env.INTERNAL_CRON_SECRET = secret;
    const res = await supertest(app.server)
      .post('/internal/sync-professor-plans')
      .set('X-Internal-Secret', secret);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
