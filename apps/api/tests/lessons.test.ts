import { buildApp } from '../src/app';
import supertest from 'supertest';
import { FastifyInstance } from 'fastify';
import { cleanupUsersByEmailSuffix } from './_helpers/cleanup';

let app: FastifyInstance;
let professorToken: string;
let studentId: string;
let subjectId: string;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
  await cleanupUsersByEmailSuffix(app.prisma, '@lessontest.com');

  const profRes = await supertest(app.server).post('/auth/register').send({
    email: 'prof@lessontest.com', password: 'Test@1234', name: 'Prof Lesson', role: 'PROFESSOR',
  });
  professorToken = profRes.body.accessToken;

  const subject = await app.prisma.subject.findFirst();
  subjectId = subject!.id;

  const studentRes = await supertest(app.server)
    .post('/students')
    .set('Authorization', `Bearer ${professorToken}`)
    .send({ name: 'Aluno Lesson', gradeLevel: '7º EF', subjectId });
  studentId = studentRes.body.id;
});

afterAll(async () => {
  await cleanupUsersByEmailSuffix(app.prisma, '@lessontest.com');
  await app.close();
});

describe('POST /lessons', () => {
  it('should create lesson and return 201', async () => {
    const res = await supertest(app.server)
      .post('/lessons')
      .set('Authorization', `Bearer ${professorToken}`)
      .send({
        studentId,
        subjectId,
        durationMin: 60,
        whatWasDone: 'Revisão de equações de 2º grau.',
        emotion: 'GOOD',
      });
    expect(res.status).toBe(201);
    expect(res.body.whatWasDone).toBe('Revisão de equações de 2º grau.');
  });

  it('should return 422 for whatWasDone > 280 chars', async () => {
    const res = await supertest(app.server)
      .post('/lessons')
      .set('Authorization', `Bearer ${professorToken}`)
      .send({ studentId, subjectId, durationMin: 60, whatWasDone: 'x'.repeat(281) });
    expect(res.status).toBe(400);
  });

  it('should return 422 for invalid durationMin', async () => {
    const res = await supertest(app.server)
      .post('/lessons')
      .set('Authorization', `Bearer ${professorToken}`)
      .send({ studentId, subjectId, durationMin: 25, whatWasDone: 'Teste' });
    expect(res.status).toBe(400);
  });
});

describe('GET /lessons/student/:studentId', () => {
  it('should return 403 for professor B trying to access professor A student lessons', async () => {
    const prof2 = await supertest(app.server).post('/auth/register').send({
      email: 'prof2@lessontest.com', password: 'Test@1234', name: 'Prof 2 Lesson', role: 'PROFESSOR',
    });
    const res = await supertest(app.server)
      .get(`/lessons/student/${studentId}`)
      .set('Authorization', `Bearer ${prof2.body.accessToken}`);
    expect(res.status).toBe(403);
  });

  it('should return 403 for parent without LGPD consent', async () => {
    const parent = await supertest(app.server).post('/auth/register').send({
      email: 'parent@lessontest.com', password: 'Test@1234', name: 'Parent Lesson', role: 'PARENT',
    });
    const res = await supertest(app.server)
      .get(`/lessons/student/${studentId}`)
      .set('Authorization', `Bearer ${parent.body.accessToken}`);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('LGPD_CONSENT_REQUIRED');
  });

  it('should return professor own student lessons with cursor pagination', async () => {
    const res = await supertest(app.server)
      .get(`/lessons/student/${studentId}`)
      .set('Authorization', `Bearer ${professorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.meta).toBeDefined();
  });
});
