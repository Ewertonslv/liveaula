import fp from 'fastify-plugin';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import { UserRole } from '@liveaula/shared';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; id: string; role: UserRole };
    user: { sub: string; id: string; role: UserRole };
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export const jwtPlugin = fp(async (app: FastifyInstance) => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }

  await app.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'dev-secret',
    sign: { expiresIn: '15m' },
  });

  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.status(401).send({ error: 'Unauthorized', message: 'Token inválido ou expirado' });
    }
  });
});
