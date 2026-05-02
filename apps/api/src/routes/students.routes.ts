import { FastifyInstance } from 'fastify';
import { createStudentRepository } from '../repositories/student.repository';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';
import { lgpdGuard } from '../middleware/lgpdGuard';
import { createStudentSchema, updateStudentSchema } from '@liveaula/shared';

export async function studentsRoutes(app: FastifyInstance) {
  const studentRepo = createStudentRepository(app.prisma);

  app.post('/', {
    preHandler: [requireRole('PROFESSOR')],
    handler: async (request, reply) => {
      const body = createStudentSchema.parse(request.body);
      const student = await studentRepo.create({ ...body, professorId: request.user.id });
      return reply.status(201).send(student);
    },
  });

  app.get('/', {
    preHandler: [requireRole('PROFESSOR')],
    handler: async (request, reply) => {
      const query = request.query as { search?: string; isActive?: string };
      const students = await studentRepo.findManyByProfessor(request.user.id, {
        search: query.search,
        isActive: query.isActive === undefined ? true : query.isActive === 'true',
      });
      return reply.send(students);
    },
  });

  app.get('/:id', {
    preHandler: [requireAuth],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const student = await studentRepo.findById(id);
      if (!student) return reply.status(404).send({ error: 'Aluno não encontrado' });

      const userId = (request.user as any).id ?? request.user.sub;
      if (request.user.role === 'PROFESSOR') {
        const fullStudent = await app.prisma.student.findUnique({
          where: { id },
          select: { professorId: true },
        });
        if (fullStudent?.professorId !== userId) {
          return reply.status(403).send({ error: 'NOT_AUTHORIZED' });
        }
      } else if (request.user.role === 'PARENT') {
        const hasConsent = await app.prisma.consentLog.findFirst({
          where: { userId, consentType: 'LGPD_PARENTAL_ART14', revokedAt: null },
        });
        if (!hasConsent) {
          return reply.status(403).send({ error: 'LGPD_CONSENT_REQUIRED', message: 'Consentimento LGPD necessário' });
        }
        const access = await studentRepo.checkParentAccess(id, userId);
        if (!access) {
          return reply.status(403).send({ error: 'NOT_AUTHORIZED' });
        }
      }

      return reply.send(student);
    },
  });

  app.patch('/:id', {
    preHandler: [requireRole('PROFESSOR')],
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = updateStudentSchema.parse(request.body);
      const userId = (request.user as any).id ?? request.user.sub;
      const existing = await app.prisma.student.findUnique({ where: { id }, select: { professorId: true } });
      if (!existing || existing.professorId !== userId) {
        return reply.status(403).send({ error: 'NOT_AUTHORIZED' });
      }
      const student = await studentRepo.update(id, body);
      return reply.send(student);
    },
  });
}
