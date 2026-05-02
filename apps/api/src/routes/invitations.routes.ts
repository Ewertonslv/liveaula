import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createInvitationService } from '../services/invitation.service';
import { requireRole } from '../middleware/requireRole';
import { createInvitationSchema } from '@liveaula/shared';

const listInvitationsQuerySchema = z.object({
  status: z.enum(['PENDING', 'CLAIMED', 'EXPIRED']).optional(),
});

export async function invitationsRoutes(app: FastifyInstance) {
  const invitationService = createInvitationService(app);

  app.post('/', {
    preHandler: [requireRole('PROFESSOR')],
    handler: async (request, reply) => {
      const body = createInvitationSchema.parse(request.body);
      try {
        const result = await invitationService.createInvitation(
          request.user.id,
          body.studentId,
          body.parentEmail
        );
        return reply.status(201).send(result);
      } catch (err: any) {
        if (err.statusCode) return reply.status(err.statusCode).send({ error: err.message });
        throw err;
      }
    },
  });

  app.get('/:token/validate', {
    config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const { token } = request.params as { token: string };
      try {
        const result = await invitationService.validateToken(token);
        return reply.send(result);
      } catch (err: any) {
        if (err.statusCode) return reply.status(err.statusCode).send({ error: err.message });
        throw err;
      }
    },
  });

  app.get('/', {
    preHandler: [requireRole('PROFESSOR')],
    config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const query = listInvitationsQuerySchema.parse(request.query);
      const invitations = await invitationService.listByProfessor(request.user.id, query.status);
      return reply.send(invitations);
    },
  });
}
