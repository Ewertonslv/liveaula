import { buildApp } from '../src/app';
import supertest from 'supertest';
import { FastifyInstance } from 'fastify';
import { cleanupUsersByEmailSuffix } from './_helpers/cleanup';

let app: FastifyInstance;
let professorToken: string;
let professorId: string;
let studentId: string;
let subjectId: string;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
  await cleanupUsersByEmailSuffix(app.prisma, '@studenttest.com');

  // Register professor
  const res = await supertest(app.server).post('/auth/register').send({
    email: 'prof@studenttest.com', password: 'Test@1234', name: 'Prof Student Test', role: 'PROFESSOR',
  });
  professorToken = res.body.accessToken;
  professorId = res.body.user.id;

  // Get first subject
  const subject = await app.prisma.subject.findFirst();
  subjectId = subject!.id;
});

afterAll(async () => {
  await cleanupUsersByEmailSuffix(app.prisma, '@studenttest.com');
  await app.close();
});

describe('POST /students', () => {
  it('should create student for professor', async () => {
    const res = await supertest(app.server)
      .post('/students')
      .set('Authorization', `Bearer ${professorToken}`)
      .send({ name: 'Aluno Teste', gradeLevel: '7º EF', subjectId });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Aluno Teste');
    studentId = res.body.id;
  });
});

describe('GET /students/:id', () => {
  it('should allow professor to view own student', async () => {
    const res = await supertest(app.server)
      .get(`/students/${studentId}`)
      .set('Authorization', `Bearer ${professorToken}`);
    expect(res.status).toBe(200);
  });

  it('should return 403 for professor trying to view other professor student', async () => {
    // Register second professor
    const res2 = await supertest(app.server).post('/auth/register').send({
      email: 'prof2@studenttest.com', password: 'Test@1234', name: 'Prof 2', role: 'PROFESSOR',
    });
    const token2 = res2.body.accessToken;
    const res = await supertest(app.server)
      .get(`/students/${studentId}`)
      .set('Authorization', `Bearer ${token2}`);
    expect(res.status).toBe(403);
  });
});

describe('PATCH /students/:id', () => {
  it('should update student isActive', async () => {
    const res = await supertest(app.server)
      .patch(`/students/${studentId}`)
      .set('Authorization', `Bearer ${professorToken}`)
      .send({ isActive: false });
    expect(res.status).toBe(200);
    expect(res.body.isActive).toBe(false);
  });
});

describe('GET /me/students with LGPD', () => {
  it('should return 403 for parent without ConsentLog', async () => {
    // Register parent without consent
    const parentRes = await supertest(app.server).post('/auth/register').send({
      email: 'parent@studenttest.com', password: 'Test@1234', name: 'Parent Test', role: 'PARENT',
    });
    const parentToken = parentRes.body.accessToken;
    const res = await supertest(app.server)
      .get('/me/students')
      .set('Authorization', `Bearer ${parentToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('LGPD_CONSENT_REQUIRED');
  });
});
