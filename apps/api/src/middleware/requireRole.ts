import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '@liveaula/shared';

export function requireRole(role: UserRole) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    await request.jwtVerify();
    const user = request.user as any;
    if (!user.id && user.sub) user.id = user.sub;
    if (request.user.role !== role) {
      reply.status(403).send({ error: 'Forbidden', message: 'Acesso negado' });
    }
  };
}
