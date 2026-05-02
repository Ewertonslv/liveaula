import { buildApp } from '../src/app';
import supertest from 'supertest';
import { FastifyInstance } from 'fastify';
import { cleanupUsersByEmailSuffix } from './_helpers/cleanup';

let app: FastifyInstance;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
  await cleanupUsersByEmailSuffix(app.prisma, '@authtest.com');
});

afterAll(async () => {
  await cleanupUsersByEmailSuffix(app.prisma, '@authtest.com');
  await app.close();
});

describe('POST /auth/register', () => {
  it('should register a professor and return 201 with accessToken', async () => {
    const res = await supertest(app.server)
      .post('/auth/register')
      .send({ email: 'prof1@authtest.com', password: 'Test@1234', name: 'Prof Test', role: 'PROFESSOR' });
    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.role).toBe('PROFESSOR');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should return 409 for duplicate email', async () => {
    const res = await supertest(app.server)
      .post('/auth/register')
      .send({ email: 'prof1@authtest.com', password: 'Test@1234', name: 'Prof Test', role: 'PROFESSOR' });
    expect(res.status).toBe(409);
  });
});

describe('POST /auth/login', () => {
  it('should login with valid credentials and set httpOnly cookie', async () => {
    const res = await supertest(app.server)
      .post('/auth/login')
      .send({ email: 'prof1@authtest.com', password: 'Test@1234' });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    const cookies = res.headers['set-cookie'] as string[];
    expect(cookies?.some((c: string) => c.includes('HttpOnly'))).toBe(true);
  });

  it('should return 401 for wrong password', async () => {
    const res = await supertest(app.server)
      .post('/auth/login')
      .send({ email: 'prof1@authtest.com', password: 'WrongPass' });
    expect(res.status).toBe(401);
  });
});

describe('POST /auth/refresh', () => {
  let refreshToken: string;
  let cookieHeader: string;

  beforeAll(async () => {
    const res = await supertest(app.server)
      .post('/auth/login')
      .send({ email: 'prof1@authtest.com', password: 'Test@1234' });
    refreshToken = res.body.refreshToken;
    cookieHeader = (res.headers['set-cookie'] as string[]).join('; ');
  });

  it('should refresh via cookie', async () => {
    const res = await supertest(app.server)
      .post('/auth/refresh')
      .set('Cookie', cookieHeader);
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it('should refresh via mobile header + body', async () => {
    // Login fresh because the cookie refresh test already rotated the previous token
    const loginRes = await supertest(app.server)
      .post('/auth/login')
      .send({ email: 'prof1@authtest.com', password: 'Test@1234' });
    const freshToken = loginRes.body.refreshToken;

    const res = await supertest(app.server)
      .post('/auth/refresh')
      .set('X-Client', 'mobile')
      .send({ refreshToken: freshToken });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
  });

  it('should return 401 for invalid refresh token', async () => {
    const res = await supertest(app.server)
      .post('/auth/refresh')
      .set('Cookie', 'refreshToken=invalid-token');
    expect(res.status).toBe(401);
  });
});

describe('GET /auth/me', () => {
  it('should return 401 without token', async () => {
    const res = await supertest(app.server).get('/auth/me');
    expect(res.status).toBe(401);
  });

  it('should return user with valid token', async () => {
    const loginRes = await supertest(app.server)
      .post('/auth/login')
      .send({ email: 'prof1@authtest.com', password: 'Test@1234' });
    const res = await supertest(app.server)
      .get('/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('prof1@authtest.com');
  });
});

describe('POST /auth/logout', () => {
  it('should logout and clear cookie', async () => {
    const loginRes = await supertest(app.server)
      .post('/auth/login')
      .send({ email: 'prof1@authtest.com', password: 'Test@1234' });
    const res = await supertest(app.server)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`);
    expect(res.status).toBe(200);
  });
});
