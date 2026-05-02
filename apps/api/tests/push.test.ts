import { buildApp } from '../src/app';
import supertest from 'supertest';
import { FastifyInstance } from 'fastify';
import { cleanupUsersByEmailSuffix } from './_helpers/cleanup';

let app: FastifyInstance;
let userToken: string;

beforeAll(async () => {
  app = await buildApp();
  await app.ready();
  await cleanupUsersByEmailSuffix(app.prisma, 'pushtest@pushtest.com');
  const res = await supertest(app.server).post('/auth/register').send({
    email: 'pushtest@pushtest.com', password: 'Test@1234', name: 'Push Test', role: 'PROFESSOR',
  });
  userToken = res.body.accessToken;
});

afterAll(async () => {
  await cleanupUsersByEmailSuffix(app.prisma, 'pushtest@pushtest.com');
  await app.close();
});

describe('POST /me/device-tokens', () => {
  it('should register a device token', async () => {
    const res = await supertest(app.server)
      .post('/me/device-tokens')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ token: 'ExponentPushToken[test-token-123]', platform: 'ios' });
    expect(res.status).toBe(201);
  });

  it('should upsert duplicate token without error', async () => {
    const res = await supertest(app.server)
      .post('/me/device-tokens')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ token: 'ExponentPushToken[test-token-123]', platform: 'ios' });
    expect(res.status).toBe(201);
    // Verify only 1 token exists
    const count = await app.prisma.deviceToken.count({ where: { token: 'ExponentPushToken[test-token-123]' } });
    expect(count).toBe(1);
  });

  it('should invalidate token on DELETE', async () => {
    await supertest(app.server)
      .delete('/me/device-tokens/ExponentPushToken[test-token-123]')
      .set('Authorization', `Bearer ${userToken}`);
    const dt = await app.prisma.deviceToken.findFirst({ where: { token: 'ExponentPushToken[test-token-123]' } });
    expect(dt?.isValid).toBe(false);
  });
});
