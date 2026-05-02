import { FastifyInstance } from 'fastify';
import { createAuthService } from '../services/auth.service';
import { requireAuth } from '../middleware/requireAuth';
import { registerSchema, loginSchema } from '@liveaula/shared';

export async function authRoutes(app: FastifyInstance) {
  const authService = createAuthService(app);

  app.post('/register', {
    config: {
      rateLimit: { max: 5, timeWindow: '1 minute' },
    },
    handler: async (request, reply) => {
      const body = registerSchema.parse(request.body);
      const ip = request.ip;
      try {
        const result = await authService.register({ ...body, ip });
        reply.setCookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60,
        });
        return reply.status(201).send({
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        });
      } catch (err: any) {
        if (err.statusCode) {
          return reply.status(err.statusCode).send({ error: err.message });
        }
        throw err;
      }
    },
  });

  app.post('/login', {
    config: {
      rateLimit: { max: 10, timeWindow: '1 minute' },
    },
    handler: async (request, reply) => {
      const body = loginSchema.parse(request.body);
      try {
        const result = await authService.login(body.email, body.password);
        reply.setCookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 7 * 24 * 60 * 60,
        });
        return reply.send({
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        });
      } catch (err: any) {
        if (err.statusCode) {
          return reply.status(err.statusCode).send({ error: err.message });
        }
        throw err;
      }
    },
  });

  app.post('/refresh', {
    config: {
      rateLimit: { max: 30, timeWindow: '1 minute' },
    },
    handler: async (request, reply) => {
      const isMobile = request.headers['x-client'] === 'mobile';
      const refreshToken = isMobile
        ? (request.body as any)?.refreshToken
        : request.cookies?.refreshToken;

      if (!refreshToken) {
        return reply.status(401).send({ error: 'Refresh token não fornecido' });
      }

      try {
        const result = await authService.refreshTokens(refreshToken);
        if (!isMobile) {
          reply.setCookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60,
          });
        }
        return reply.send({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        });
      } catch (err: any) {
        if (err.statusCode) {
          return reply.status(err.statusCode).send({ error: err.message });
        }
        throw err;
      }
    },
  });

  app.post('/logout', {
    preHandler: [requireAuth],
    handler: async (request, reply) => {
      await authService.logout(request.user.id);
      reply.clearCookie('refreshToken', { path: '/' });
      return reply.send({ message: 'Logout realizado com sucesso' });
    },
  });

  app.get('/me', {
    preHandler: [requireAuth],
    handler: async (request, reply) => {
      const user = await app.prisma.user.findUnique({
        where: { id: request.user.id },
        select: {
          id: true, email: true, name: true, role: true,
          avatarUrl: true, bio: true, isActive: true, planStatus: true,
          emailVerifiedAt: true, createdAt: true,
        },
      });
      if (!user) return reply.status(404).send({ error: 'Usuário não encontrado' });
      return reply.send(user);
    },
  });

  app.post('/forgot-password', {
    config: { rateLimit: { max: 5, timeWindow: '15 minutes' } },
    handler: async (request, reply) => {
      const { email } = request.body as { email: string };
      if (!email || typeof email !== 'string') {
        return reply.status(400).send({ error: 'Email obrigatório' });
      }
      await authService.requestPasswordReset(email.toLowerCase().trim());
      return reply.send({ message: 'Se o email existir, você receberá as instruções.' });
    },
  });

  app.post('/reset-password', {
    config: { rateLimit: { max: 10, timeWindow: '15 minutes' } },
    handler: async (request, reply) => {
      const { token, password } = request.body as { token: string; password: string };
      if (!token || !password || password.length < 8) {
        return reply.status(400).send({ error: 'Token e senha (mínimo 8 caracteres) obrigatórios' });
      }
      try {
        await authService.resetPassword(token, password);
        return reply.send({ message: 'Senha redefinida com sucesso' });
      } catch (err: any) {
        if (err.statusCode) return reply.status(err.statusCode).send({ error: err.message });
        throw err;
      }
    },
  });

  app.post('/verify-email', {
    config: { rateLimit: { max: 10, timeWindow: '15 minutes' } },
    handler: async (request, reply) => {
      const { token } = request.body as { token: string };
      if (!token) return reply.status(400).send({ error: 'Token obrigatório' });

      const record = await app.prisma.emailVerificationToken.findUnique({
        where: { token },
        include: { user: { select: { id: true, emailVerifiedAt: true } } },
      });

      if (!record || record.usedAt || record.expiresAt < new Date()) {
        return reply.status(400).send({ error: 'Link inválido ou expirado' });
      }

      await app.prisma.$transaction([
        app.prisma.user.update({
          where: { id: record.userId },
          data: { emailVerifiedAt: new Date() },
        }),
        app.prisma.emailVerificationToken.update({
          where: { id: record.id },
          data: { usedAt: new Date() },
        }),
      ]);

      return reply.send({ message: 'Email confirmado com sucesso' });
    },
  });

  app.post('/resend-verification', {
    preHandler: [requireAuth],
    config: { rateLimit: { max: 3, timeWindow: '15 minutes' } },
    handler: async (request, reply) => {
      const user = await app.prisma.user.findUnique({
        where: { id: request.user.id },
        select: { id: true, email: true, name: true, emailVerifiedAt: true },
      });
      if (!user) return reply.status(404).send({ error: 'Usuário não encontrado' });
      if (user.emailVerifiedAt) return reply.send({ message: 'Email já verificado' });

      const { emailService } = await import('../services/email.service');
      const crypto = await import('crypto');
      const verifyToken = crypto.randomBytes(32).toString('base64url');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await app.prisma.emailVerificationToken.create({
        data: { userId: user.id, token: verifyToken, expiresAt },
      });

      const verifyUrl = `${process.env.WEB_URL || 'https://liveaula.com'}/verify-email?token=${verifyToken}`;
      emailService.sendEmailVerification({ to: user.email, name: user.name, verifyUrl })
        .catch(err => app.log.error({ err }, 'Failed to resend verification email'));

      return reply.send({ message: 'Email de verificação reenviado' });
    },
  });
}
