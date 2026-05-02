import { buildApp } from '../src/app';
import supertest from 'supertest';
import { FastifyInstance } from 'fastify';
import { cleanupUsersByEmailSuffix } from './_helpers/cleanup';

// Mock paymentService para não chamar Asaas real
jest.mock('../src/services/payment.service', () => ({
  paymentService: {
    createCustomer: jest.fn().mockResolvedValue({ id: 'asaas-customer-1' }),
    createSubscription: jest.fn().mockResolvedValue({ id: 'asaas-sub-1', status: 'ACTIVE' }),
    cancelSubscription: jest.fn().mockResolvedValue({}),
  },
}));

let app: FastifyInstance;
let parentToken: string;
let studentId: string;
let subjectId: string;
let subscriptionId: string;

const WEBHOOK_TOKEN = 'test-webhook-token-32chars-exactly!!';

beforeAll(async () => {
  process.env.ASAAS_WEBHOOK_TOKEN = WEBHOOK_TOKEN;

  app = await buildApp();
  await app.ready();

  await cleanupUsersByEmailSuffix(app.prisma, '@subtest.com');

  // Criar professor e aluno
  const profRes = await supertest(app.server).post('/auth/register').send({
    email: 'prof@subtest.com',
    password: 'Test@1234',
    name: 'Prof Sub',
    role: 'PROFESSOR',
  });
  const professorToken = profRes.body.accessToken;

  const subject = await app.prisma.subject.findFirst();
  subjectId = subject!.id;

  const studentRes = await supertest(app.server)
    .post('/students')
    .set('Authorization', `Bearer ${professorToken}`)
    .send({ name: 'Aluno Sub', gradeLevel: '5º EF', subjectId });
  studentId = studentRes.body.id;

  // Criar pai
  const parentRes = await supertest(app.server).post('/auth/register').send({
    email: 'parent@subtest.com',
    password: 'Test@1234',
    name: 'Parent Sub',
    role: 'PARENT',
  });
  parentToken = parentRes.body.accessToken;
});

afterAll(async () => {
  await cleanupUsersByEmailSuffix(app.prisma, '@subtest.com');
  await app.close();
});

describe('GET /subscription', () => {
  it('should return { status: NONE } when no subscription exists', async () => {
    const res = await supertest(app.server)
      .get('/subscription')
      .set('Authorization', `Bearer ${parentToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'NONE' });
  });
});

describe('POST /subscription', () => {
  it('should create subscription with status TRIAL and trialEndsAt in ~7 days', async () => {
    const res = await supertest(app.server)
      .post('/subscription')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({ studentId, paymentMethodToken: 'tok_test_123' });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('TRIAL');
    expect(res.body.externalSubscriptionId).toBe('asaas-sub-1');
    expect(res.body.trialEndsAt).toBeDefined();

    const trialEndsAt = new Date(res.body.trialEndsAt);
    const now = new Date();
    const diffDays = (trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeGreaterThan(6);
    expect(diffDays).toBeLessThan(8);

    subscriptionId = res.body.id;
  });

  it('should return 409 when active subscription already exists', async () => {
    const res = await supertest(app.server)
      .post('/subscription')
      .set('Authorization', `Bearer ${parentToken}`)
      .send({ studentId, paymentMethodToken: 'tok_test_123' });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('SUBSCRIPTION_ALREADY_EXISTS');
  });
});

describe('POST /webhooks/asaas — auth', () => {
  it('should return 401 when no token is provided', async () => {
    const res = await supertest(app.server)
      .post('/webhooks/asaas')
      .send({ event: 'PAYMENT_RECEIVED' });
    expect(res.status).toBe(401);
  });

  it('should return 401 when wrong token is provided', async () => {
    const res = await supertest(app.server)
      .post('/webhooks/asaas')
      .set('asaas-access-token', 'wrong-token-wrong-length-different!')
      .send({ event: 'PAYMENT_RECEIVED' });
    expect(res.status).toBe(401);
  });
});

describe('POST /webhooks/asaas — events', () => {
  it('PAYMENT_RECEIVED should set subscription status to ACTIVE and create payment', async () => {
    const res = await supertest(app.server)
      .post('/webhooks/asaas')
      .set('asaas-access-token', WEBHOOK_TOKEN)
      .send({
        event: 'PAYMENT_RECEIVED',
        payment: {
          id: 'pay-ext-001',
          subscription: 'asaas-sub-1',
          value: 79.0,
          status: 'RECEIVED',
          paymentDate: new Date().toISOString().split('T')[0],
          dueDate: new Date().toISOString().split('T')[0],
        },
      });
    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);

    // Verificar que status foi atualizado
    const sub = await app.prisma.subscription.findFirst({
      where: { externalSubscriptionId: 'asaas-sub-1' },
    });
    expect(sub?.status).toBe('ACTIVE');

    // Verificar que payment foi criado
    const payments = await app.prisma.payment.findMany({
      where: { subscriptionId: sub!.id },
    });
    expect(payments.length).toBeGreaterThanOrEqual(1);
    expect(payments[0].amountCents).toBe(7900);
    expect(payments[0].status).toBe('paid');
  });

  it('PAYMENT_OVERDUE should set subscription status to PAST_DUE', async () => {
    const res = await supertest(app.server)
      .post('/webhooks/asaas')
      .set('asaas-access-token', WEBHOOK_TOKEN)
      .send({
        event: 'PAYMENT_OVERDUE',
        payment: {
          id: 'pay-ext-002',
          subscription: 'asaas-sub-1',
          value: 79.0,
          status: 'OVERDUE',
          dueDate: new Date().toISOString().split('T')[0],
        },
      });
    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);

    const sub = await app.prisma.subscription.findFirst({
      where: { externalSubscriptionId: 'asaas-sub-1' },
    });
    expect(sub?.status).toBe('PAST_DUE');
  });

  it('SUBSCRIPTION_DELETED should set subscription status to CANCELLED', async () => {
    const res = await supertest(app.server)
      .post('/webhooks/asaas')
      .set('asaas-access-token', WEBHOOK_TOKEN)
      .send({
        event: 'SUBSCRIPTION_DELETED',
        subscription: {
          id: 'asaas-sub-1',
          status: 'DELETED',
        },
      });
    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);

    const sub = await app.prisma.subscription.findFirst({
      where: { externalSubscriptionId: 'asaas-sub-1' },
    });
    expect(sub?.status).toBe('CANCELLED');
    expect(sub?.cancelledAt).toBeDefined();
  });
});

describe('GET /subscription/payments', () => {
  it('should list payments for the parent subscription', async () => {
    // Recriar assinatura (a anterior foi cancelada)
    await app.prisma.subscription.updateMany({
      where: { externalSubscriptionId: 'asaas-sub-1' },
      data: { status: 'ACTIVE' },
    });

    const res = await supertest(app.server)
      .get('/subscription/payments')
      .set('Authorization', `Bearer ${parentToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty('amountCents');
    expect(res.body[0]).toHaveProperty('status');
    expect(res.body[0]).toHaveProperty('createdAt');
  });
});
