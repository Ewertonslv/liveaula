import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';

const cursorQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  role: z.enum(['PROFESSOR', 'PARENT', 'ADMIN']).optional(),
  isActive: z.coerce.boolean().optional(),
  status: z.string().optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
});

export async function adminRoutes(fastify: FastifyInstance) {
  // GET /admin/users
  fastify.get('/users', {
    preHandler: [requireAuth, requireRole('ADMIN')],
    config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const query = cursorQuerySchema.parse(request.query);

      const whereClause: Record<string, unknown> = {};
      if (query.role) whereClause.role = query.role;
      if (query.isActive !== undefined) whereClause.isActive = query.isActive;
      if (query.cursor) whereClause.id = { gt: query.cursor };

      const users = await fastify.prisma.user.findMany({
        where: whereClause,
        take: query.limit + 1,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          avatarUrl: true,
          bio: true,
          isActive: true,
          planStatus: true,
          createdAt: true,
        },
      });

      const hasMore = users.length > query.limit;
      const items = hasMore ? users.slice(0, query.limit) : users;
      const nextCursor = hasMore ? items[items.length - 1].id : null;

      return reply.send({ items, nextCursor, hasMore });
    },
  });

  // PATCH /admin/users/:id/status
  fastify.patch('/users/:id/status', {
    preHandler: [requireAuth, requireRole('ADMIN')],
    config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      const { isActive } = z.object({ isActive: z.boolean() }).parse(request.body);

      const user = await fastify.prisma.user.update({
        where: { id },
        data: { isActive },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          updatedAt: true,
        },
      });

      return reply.send(user);
    },
  });

  // GET /admin/subscriptions
  fastify.get('/subscriptions', {
    preHandler: [requireAuth, requireRole('ADMIN')],
    config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const query = cursorQuerySchema.parse(request.query);

      const whereClause: Record<string, unknown> = {};
      if (query.status) whereClause.status = query.status;
      if (query.cursor) whereClause.id = { gt: query.cursor };

      const subscriptions = await fastify.prisma.subscription.findMany({
        where: whereClause,
        take: query.limit + 1,
        orderBy: { createdAt: 'desc' },
        include: {
          parent: {
            select: { name: true, email: true },
          },
        },
      });

      // Get student data separately (no direct relation with name on subscription)
      const items = await Promise.all(
        subscriptions.slice(0, query.limit).map(async (sub) => {
          const student = await fastify.prisma.student.findUnique({
            where: { id: sub.studentId },
            select: { name: true },
          });
          return { ...sub, student };
        }),
      );

      const hasMore = subscriptions.length > query.limit;
      const nextCursor = hasMore ? items[items.length - 1].id : null;

      return reply.send({ items, nextCursor, hasMore });
    },
  });

  // GET /admin/metrics
  fastify.get('/metrics', {
    preHandler: [requireAuth, requireRole('ADMIN')],
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const query = z
        .object({
          from: z.string().datetime({ offset: true }).optional(),
          to: z.string().datetime({ offset: true }).optional(),
        })
        .parse(request.query);

      const now = new Date();
      const from = query.from
        ? new Date(query.from)
        : new Date(now.getFullYear(), now.getMonth(), 1);
      const to = query.to ? new Date(query.to) : now;
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);

      const [
        dauResult,
        mauResult,
        activeSubscriptions,
        trialSubscriptions,
        cancelledThisPeriod,
        totalAtStart,
      ] = await Promise.all([
        // DAU: distinct professorIds who gave lessons today
        fastify.prisma.lesson.groupBy({
          by: ['professorId'],
          where: { createdAt: { gte: todayStart } },
        }),
        // MAU: distinct professorIds who gave lessons this month
        fastify.prisma.lesson.groupBy({
          by: ['professorId'],
          where: { createdAt: { gte: from, lte: to } },
        }),
        fastify.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
        fastify.prisma.subscription.count({ where: { status: 'TRIAL' } }),
        fastify.prisma.subscription.count({
          where: { status: 'CANCELLED', cancelledAt: { gte: from, lte: to } },
        }),
        fastify.prisma.subscription.count({
          where: { createdAt: { lt: from }, status: { not: 'CANCELLED' } },
        }),
      ]);

      const churnRate = totalAtStart > 0 ? cancelledThisPeriod / totalAtStart : 0;
      const totalKnown = activeSubscriptions + cancelledThisPeriod + trialSubscriptions;
      const conversionRate = totalKnown > 0 ? activeSubscriptions / totalKnown : 0;

      return reply.send({
        DAU: dauResult.length,
        MAU: mauResult.length,
        activeSubscriptions,
        trialSubscriptions,
        churnRate: parseFloat(churnRate.toFixed(4)),
        conversionRate: parseFloat(conversionRate.toFixed(4)),
      });
    },
  });
}
