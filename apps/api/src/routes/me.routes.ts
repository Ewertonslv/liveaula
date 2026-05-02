import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { z } from 'zod';
import { requireAuth } from '../middleware/requireAuth';
import { lgpdGuard } from '../middleware/lgpdGuard';

const patchMeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().max(2000).optional(),
}).strict();

const deviceTokenSchema = z.object({
  token: z.string().min(1).max(500),
  platform: z.enum(['ios', 'android']),
});

export async function meRoutes(app: FastifyInstance) {
  app.get('/', {
    preHandler: [requireAuth],
    config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const user = await app.prisma.user.findUnique({
        where: { id: request.user.id },
        select: { id: true, email: true, name: true, role: true, avatarUrl: true, bio: true, isActive: true, planStatus: true, createdAt: true },
      });
      if (!user) return reply.status(404).send({ error: 'Not found' });
      return reply.send(user);
    },
  });

  app.patch('/', {
    preHandler: [requireAuth],
    config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const body = patchMeSchema.parse(request.body);
      const user = await app.prisma.user.update({
        where: { id: request.user.id },
        data: { name: body.name, bio: body.bio, avatarUrl: body.avatarUrl },
        select: { id: true, email: true, name: true, role: true, avatarUrl: true, bio: true, isActive: true, planStatus: true, createdAt: true },
      });
      return reply.send(user);
    },
  });

  app.get('/students', {
    preHandler: [requireAuth],
    config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      if (request.user.role === 'PROFESSOR') {
        const students = await app.prisma.student.findMany({
          where: { professorId: request.user.id, isActive: true },
          select: { id: true, name: true, gradeLevel: true, avatarUrl: true, isActive: true, createdAt: true, subject: { select: { id: true, name: true } } },
          orderBy: { name: 'asc' },
        });
        return reply.send(students);
      }

      if (request.user.role === 'PARENT') {
        // lgpdGuard
        const hasConsent = await app.prisma.consentLog.findFirst({
          where: { userId: request.user.id, consentType: 'LGPD_PARENTAL_ART14', revokedAt: null },
        });
        if (!hasConsent) {
          return reply.status(403).send({ error: 'LGPD_CONSENT_REQUIRED' });
        }
        const links = await app.prisma.studentParent.findMany({
          where: { parentId: request.user.id },
          include: { student: { include: { subject: true } } },
        });
        return reply.send(links.map(l => l.student));
      }

      return reply.status(403).send({ error: 'Forbidden' });
    },
  });

  // Device tokens (T6 owns this, declared here for route completeness)
  app.post('/device-tokens', {
    preHandler: [requireAuth],
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const body = deviceTokenSchema.parse(request.body);
      await app.prisma.deviceToken.upsert({
        where: { token: body.token },
        update: { isValid: true, lastVerified: new Date() },
        create: { token: body.token, platform: body.platform, userId: request.user.id },
      });
      return reply.status(201).send({ message: 'Token registrado' });
    },
  });

  app.delete('/device-tokens/:token', {
    preHandler: [requireAuth],
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const { token } = request.params as { token: string };
      await app.prisma.deviceToken.updateMany({
        where: { token, userId: request.user.id },
        data: { isValid: false },
      });
      return reply.send({ message: 'Token removido' });
    },
  });

  // GET /me/notifications — histórico de notificações push do pai
  app.get('/notifications', {
    preHandler: [requireAuth],
    config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const { cursor, limit = '20' } = request.query as { cursor?: string; limit?: string };
      const take = Math.min(parseInt(limit, 10) || 20, 50);

      const notifications = await app.prisma.pushNotificationLog.findMany({
        where: {
          recipientId: request.user.id,
          ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: take + 1,
        select: {
          id: true, title: true, body: true, readAt: true, createdAt: true, lessonId: true,
        },
      });

      const hasMore = notifications.length > take;
      const data = hasMore ? notifications.slice(0, take) : notifications;
      const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : null;

      return reply.send({ data, meta: { nextCursor, hasMore } });
    },
  });

  // PATCH /me/notifications/:id/read — marcar notificação como lida
  app.patch('/notifications/:id/read', {
    preHandler: [requireAuth],
    config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };
      await app.prisma.pushNotificationLog.updateMany({
        where: { id, recipientId: request.user.id, readAt: null },
        data: { readAt: new Date() },
      });
      return reply.send({ ok: true });
    },
  });

  // GET /me/billing/parents — P15 Financeiro
  app.get('/billing/parents', {
    preHandler: [requireAuth],
    config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      if (request.user.role !== 'PROFESSOR') return reply.status(403).send({ error: 'Forbidden' });

      const links = await app.prisma.studentParent.findMany({
        where: { student: { professorId: request.user.id } },
        select: {
          parent: { select: { id: true, name: true, avatarUrl: true } },
          student: { select: { id: true, name: true } },
        },
      });

      const parentIds = [...new Set(links.map(l => l.parent.id))];
      const subscriptions = await app.prisma.subscription.findMany({
        where: { parentId: { in: parentIds } },
        select: { parentId: true, studentId: true, status: true, trialEndsAt: true },
      });
      const subByPair = new Map<string, typeof subscriptions[number]>();
      for (const sub of subscriptions) {
        subByPair.set(`${sub.parentId}|${sub.studentId}`, sub);
      }

      const parents = links.map(l => {
        const sub = subByPair.get(`${l.parent.id}|${l.student.id}`);
        return {
          parentId: l.parent.id,
          parentName: l.parent.name,
          parentAvatarUrl: l.parent.avatarUrl,
          studentId: l.student.id,
          studentName: l.student.name,
          subscriptionStatus: sub?.status ?? 'NONE',
          trialEndsAt: sub?.trialEndsAt ?? null,
          amountCents: 7900,
        };
      });

      const paidParentsCount = parents.filter(p => p.subscriptionStatus === 'ACTIVE').length;
      const me = await app.prisma.user.findUnique({
        where: { id: request.user.id },
        select: { planStatus: true },
      });

      return reply.send({
        professorPlanStatus: me?.planStatus ?? 'PAID',
        paidParentsCount,
        paidParentsTarget: 5,
        parents,
      });
    },
  });

  // POST /me/cloudinary-signature
  app.post('/cloudinary-signature', {
    preHandler: [requireAuth],
    config: { rateLimit: { max: 10, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const timestamp = Math.round(Date.now() / 1000);
      const folder = 'avatars';
      const uploadPreset = 'liveaula';
      const apiSecret = process.env.CLOUDINARY_API_SECRET || '';
      const apiKey = process.env.CLOUDINARY_API_KEY || '';
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';

      // SHA1 de: "folder=avatars&timestamp=<ts>&upload_preset=liveaula<API_SECRET>"
      const signatureStr = `folder=${folder}&timestamp=${timestamp}&upload_preset=${uploadPreset}${apiSecret}`;
      const signature = crypto.createHash('sha1').update(signatureStr).digest('hex');

      return reply.send({
        signature,
        timestamp,
        apiKey,
        cloudName,
        folder,
        uploadPreset,
      });
    },
  });
}
