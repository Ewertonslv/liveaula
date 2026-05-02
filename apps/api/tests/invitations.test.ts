import { buildApp } from '../src/app';
import supertest from 'supertest';
import { FastifyInstance } from 'fastify';
import { cleanupUsersByEmailSuffix } from './_helpers/cleanup';

let app: FastifyInstance;
let professorToken: string;
let studentId: string;
let inviteToken: string;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
  await cleanupUsersByEmailSuffix(app.prisma, '@invitetest.com');

  const profRes = await supertest(app.server).post('/auth/register').send({
    email: 'prof@invitetest.com', password: 'Test@1234', name: 'Prof Invite', role: 'PROFESSOR',
  });
  professorToken = profRes.body.accessToken;

  const subject = await app.prisma.subject.findFirst();
  const studentRes = await supertest(app.server)
    .post('/students')
    .set('Authorization', `Bearer ${professorToken}`)
    .send({ name: 'Aluno Invite', gradeLevel: '8º EF', subjectId: subject!.id });
  studentId = studentRes.body.id;
});

afterAll(async () => {
  await cleanupUsersByEmailSuffix(app.prisma, '@invitetest.com');
  await app.close();
});

describe('POST /invitations', () => {
  it('should create invitation and return inviteUrl', async () => {
    const res = await supertest(app.server)
      .post('/invitations')
      .set('Authorization', `Bearer ${professorToken}`)
      .send({ studentId, parentEmail: 'pai@invitetest.com' });
    expect(res.status).toBe(201);
    expect(res.body.inviteUrl).toBeDefined();
    expect(res.body.token).toBeDefined();
    inviteToken = res.body.token;
  });

  it('should return 403 for student of other professor', async () => {
    const prof2Res = await supertest(app.server).post('/auth/register').send({
      email: 'prof2@invitetest.com', password: 'Test@1234', name: 'Prof 2 Invite', role: 'PROFESSOR',
    });
    const token2 = prof2Res.body.accessToken;
    const res = await supertest(app.server)
      .post('/invitations')
      .set('Authorization', `Bearer ${token2}`)
      .send({ studentId, parentEmail: 'outro@invitetest.com' });
    expect(res.status).toBe(403);
  });
});

describe('GET /invitations/:token/validate', () => {
  it('should return invitation data for valid token (no auth)', async () => {
    const res = await supertest(app.server).get(`/invitations/${inviteToken}/validate`);
    expect(res.status).toBe(200);
    expect(res.body.studentName).toBeDefined();
    expect(res.body.parentEmail).toBe('pai@invitetest.com');
  });

  it('should return 404 for invalid token', async () => {
    const res = await supertest(app.server).get('/invitations/invalid-token-xxx/validate');
    expect(res.status).toBe(404);
  });
});

describe('POST /auth/register with inviteToken', () => {
  it('should create parent account and claim invitation atomically', async () => {
    const res = await supertest(app.server).post('/auth/register').send({
      email: 'pai@invitetest.com', password: 'Test@1234', name: 'Pai Teste',
      role: 'PARENT', inviteToken,
    });
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('PARENT');
    // Verify invitation was claimed
    const inv = await app.prisma.invitation.findFirst({ where: { token: inviteToken } });
    expect(inv?.status).toBe('CLAIMED');
  });

  it('should return 400 for mismatched email (FIX I07)', async () => {
    // Create new invitation first
    const invRes = await supertest(app.server)
      .post('/invitations')
      .set('Authorization', `Bearer ${professorToken}`)
      .send({ studentId, parentEmail: 'outropai@invitetest.com' });
    const newToken = invRes.body.token;

    const res = await supertest(app.server).post('/auth/register').send({
      email: 'wrong@invitetest.com', password: 'Test@1234', name: 'Wrong Email',
      role: 'PARENT', inviteToken: newToken,
    });
    expect(res.status).toBe(400);
  });
});
