import { UserRole } from '@liveaula/shared';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; role: UserRole };
    user: { id: string; role: UserRole };
  }
}
