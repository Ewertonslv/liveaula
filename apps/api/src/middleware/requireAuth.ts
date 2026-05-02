import { FastifyRequest, FastifyReply } from 'fastify';

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    const user = request.user as any;
    if (!user.id && user.sub) user.id = user.sub;
  } catch {
    reply.status(401).send({ error: 'Unauthorized', message: 'Token inválido ou expirado' });
  }
}
