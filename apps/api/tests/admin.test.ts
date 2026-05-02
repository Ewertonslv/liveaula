import { buildApp } from '../src/app';
import supertest from 'supertest';
import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { cleanupUsersByEmailSuffix } from './_helpers/cleanup';

let app: FastifyInstance;
let adminToken: string;
let professorToken: string;
let professorUserId: string;

const EMAIL_SUFFIX = '@admintest.com';

beforeAll(async () => {
  app = await buildApp();
  await app.ready();

  await cleanupUsersByEmailSuffix(app.prisma, EMAIL_SUFFIX);

  // Criar professor via endpoint público
  const profRes = await supertest(app.server).post('/auth/register').send({
    email: `prof@admintest.com`,
    password: 'Test@1234',
    name: 'Prof Admin Test',
    role: 'PROFESSOR',
  });
  expect(profRes.status).toBe(201);
  professorToken = profRes.body.accessToken;
  professorUserId = profRes.body.user.id;

  // Criar admin diretamente no banco (registerSchema não aceita ADMIN)
  const passwordHash = await bcrypt.hash('Admin@1234', 10);
  await app.prisma.user.create({
    data: {
      email: 'admin@admintest.com',
      passwordHash,
      name: 'Admin Test',
      role: 'ADMIN',
    },
  });

  const loginRes = await supertest(app.server).post('/auth/login').send({
    email: 'admin@admintest.com',
    password: 'Admin@1234',
  });
  expect(loginRes.status).toBe(200);
  adminToken = loginRes.body.accessToken;
});

afterAll(async () => {
  await cleanupUsersByEmailSuffix(app.prisma, EMAIL_SUFFIX);
  await app.close();
});

describe('GET /admin/users', () => {
  it('1. PROFESSOR tenta acessar GET /admin/users → 403', async () => {
    const res = await supertest(app.server)
      .get('/admin/users')
      .set('Authorization', `Bearer ${professorToken}`);
    expect(res.status).toBe(403);
  });

  it('2. ADMIN acessa GET /admin/users → 200 com CursorPage', async () => {
    const res = await supertest(app.server)
      .get('/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(res.body).toHaveProperty('nextCursor');
    expect(res.body).toHaveProperty('hasMore');
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it('filtra por role=PROFESSOR', async () => {
    const res = await supertest(app.server)
      .get('/admin/users?role=PROFESSOR')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.items.every((u: any) => u.role === 'PROFESSOR')).toBe(true);
  });
});

describe('PATCH /admin/users/:id/status', () => {
  it('3. ADMIN desativa usuário → 200 isActive=false', async () => {
    const res = await supertest(app.server)
      .patch(`/admin/users/${professorUserId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false });
    expect(res.status).toBe(200);
    expect(res.body.isActive).toBe(false);

    // Reativar para não afetar outros testes
    await supertest(app.server)
      .patch(`/admin/users/${professorUserId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: true });
  });

  it('PROFESSOR não pode acessar PATCH /admin/users/:id/status → 403', async () => {
    const res = await supertest(app.server)
      .patch(`/admin/users/${professorUserId}/status`)
      .set('Authorization', `Bearer ${professorToken}`)
      .send({ isActive: false });
    expect(res.status).toBe(403);
  });
});

describe('GET /admin/subscriptions', () => {
  it('ADMIN lista subscriptions → 200 com CursorPage', async () => {
    const res = await supertest(app.server)
      .get('/admin/subscriptions')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(res.body).toHaveProperty('nextCursor');
    expect(res.body).toHaveProperty('hasMore');
  });
});

describe('GET /admin/metrics', () => {
  it('6. GET /admin/metrics retorna objeto com todas as métricas', async () => {
    const res = await supertest(app.server)
      .get('/admin/metrics')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('DAU');
    expect(res.body).toHaveProperty('MAU');
    expect(res.body).toHaveProperty('activeSubscriptions');
    expect(res.body).toHaveProperty('trialSubscriptions');
    expect(res.body).toHaveProperty('churnRate');
    expect(res.body).toHaveProperty('conversionRate');
    expect(typeof res.body.DAU).toBe('number');
    expect(typeof res.body.churnRate).toBe('number');
  });

  it('PROFESSOR não pode acessar /admin/metrics → 403', async () => {
    const res = await supertest(app.server)
      .get('/admin/metrics')
      .set('Authorization', `Bearer ${professorToken}`);
    expect(res.status).toBe(403);
  });
});

describe('POST /consent', () => {
  it('4. POST /consent registra ConsentLog com IP → 201', async () => {
    // PRIVACY_POLICY is not auto-created during registration, so this should return 201
    const res = await supertest(app.server)
      .post('/consent')
      .set('Authorization', `Bearer ${professorToken}`)
      .send({ consentType: 'PRIVACY_POLICY', version: '1.0' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.consentType).toBe('PRIVACY_POLICY');
    expect(res.body).toHaveProperty('ip');
  });

  it('5. POST /consent duplicado → 200 idempotente', async () => {
    const res = await supertest(app.server)
      .post('/consent')
      .set('Authorization', `Bearer ${professorToken}`)
      .send({ consentType: 'PRIVACY_POLICY', version: '1.0' });
    expect(res.status).toBe(200);
    expect(res.body.alreadyExisted).toBe(true);
  });

  it('POST /consent LGPD_PARENTAL_ART14 → 201', async () => {
    const res = await supertest(app.server)
      .post('/consent')
      .set('Authorization', `Bearer ${professorToken}`)
      .send({ consentType: 'LGPD_PARENTAL_ART14' });
    expect(res.status).toBe(201);
    expect(res.body.consentType).toBe('LGPD_PARENTAL_ART14');
  });

  it('POST /consent sem auth → 401', async () => {
    const res = await supertest(app.server)
      .post('/consent')
      .send({ consentType: 'TERMS_OF_USE' });
    expect(res.status).toBe(401);
  });
});
