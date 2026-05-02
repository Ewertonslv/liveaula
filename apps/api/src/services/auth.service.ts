import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { FastifyInstance } from 'fastify';
import { emailService } from './email.service';

export function createAuthService(app: FastifyInstance) {
  const prisma = app.prisma;

  function generateRefreshToken() {
    return crypto.randomBytes(64).toString('hex');
  }

  return {
    async register(data: {
      email: string;
      password: string;
      name: string;
      role: 'PROFESSOR' | 'PARENT';
      ip: string;
      inviteToken?: string;
    }) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing) {
        throw { statusCode: 409, message: 'Email já cadastrado' };
      }

      let invitation: { id: string; studentId: string; parentEmail: string } | null = null;
      if (data.inviteToken) {
        invitation = await prisma.invitation.findFirst({
          where: {
            token: data.inviteToken,
            status: 'PENDING',
            expiresAt: { gt: new Date() },
          },
          select: { id: true, studentId: true, parentEmail: true },
        });
        if (!invitation) {
          throw { statusCode: 404, message: 'Convite inválido ou expirado' };
        }
        if (invitation.parentEmail.toLowerCase() !== data.email.toLowerCase()) {
          throw { statusCode: 400, message: 'Email não corresponde ao convite' };
        }
      }

      const passwordHash = await bcrypt.hash(data.password, 12);
      const refreshToken = generateRefreshToken();

      const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: data.email,
            passwordHash,
            refreshToken,
            name: data.name,
            role: data.role,
          },
          select: { id: true, email: true, name: true, role: true, avatarUrl: true, bio: true, isActive: true, planStatus: true, createdAt: true },
        });

        // FIX I02: ConsentLog TERMS_OF_USE para qualquer usuário que se cadastra
        await tx.consentLog.create({
          data: {
            userId: newUser.id,
            consentType: 'TERMS_OF_USE',
            version: '1.0',
            ip: data.ip,
          },
        });

        // FIX I07: claim invitation verificando email
        if (invitation) {
          await tx.studentParent.create({
            data: {
              studentId: invitation.studentId,
              parentId: newUser.id,
              consentIp: data.ip,
            },
          });
          await tx.invitation.update({
            where: { id: invitation.id },
            data: { status: 'CLAIMED', claimedAt: new Date(), claimedById: newUser.id },
          });
        }

        return newUser;
      });

      const accessToken = app.jwt.sign({ sub: user.id, id: user.id, role: user.role });

      // Envia email de verificação fire-and-forget
      const verifyToken = crypto.randomBytes(32).toString('base64url');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      prisma.emailVerificationToken.create({
        data: { userId: user.id, token: verifyToken, expiresAt },
      }).then(() => {
        const verifyUrl = `${process.env.WEB_URL || 'https://liveaula.com'}/verify-email?token=${verifyToken}`;
        // DEV-ONLY: log link so demos work without verified Resend domain
        if (process.env.NODE_ENV !== 'production') {
          app.log.info({ email: data.email, verifyUrl }, `[dev] verify link for ${data.email}: ${verifyUrl}`);
        }
        return emailService.sendEmailVerification({ to: data.email, name: user.name, verifyUrl });
      }).catch(err => app.log.error({ err }, 'Failed to send verification email'));

      return { user, accessToken, refreshToken };
    },

    async login(email: string, password: string) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, name: true, role: true, avatarUrl: true, bio: true, isActive: true, planStatus: true, createdAt: true, passwordHash: true },
      });

      if (!user || !user.isActive) {
        throw { statusCode: 401, message: 'Credenciais inválidas' };
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        throw { statusCode: 401, message: 'Credenciais inválidas' };
      }

      const refreshToken = generateRefreshToken();
      await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

      const { passwordHash: _, ...userPublic } = user;
      const accessToken = app.jwt.sign({ sub: user.id, id: user.id, role: user.role });

      return { user: userPublic, accessToken, refreshToken };
    },

    async refreshTokens(refreshToken: string) {
      const user = await prisma.user.findFirst({
        where: { refreshToken },
        select: { id: true, role: true, isActive: true },
      });

      if (!user || !user.isActive) {
        throw { statusCode: 401, message: 'Refresh token inválido' };
      }

      const newRefreshToken = generateRefreshToken();
      await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefreshToken } });

      const accessToken = app.jwt.sign({ sub: user.id, id: user.id, role: user.role });

      return { accessToken, refreshToken: newRefreshToken };
    },

    async logout(userId: string) {
      await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
    },

    async requestPasswordReset(email: string) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true, isActive: true },
      });
      // Always return success to avoid email enumeration
      if (!user || !user.isActive) return;

      const token = crypto.randomBytes(32).toString('base64url');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordResetToken.create({
        data: { userId: user.id, token, expiresAt },
      });

      const resetUrl = `${process.env.WEB_URL || 'https://liveaula.com'}/reset-password?token=${token}`;

      // DEV-ONLY: always log the URL so demos work even when Resend rejects the recipient
      // (free Resend tier without verified domain only delivers to the account owner's email).
      if (process.env.NODE_ENV !== 'production') {
        app.log.info(
          { email, resetUrl },
          `[dev] reset link for ${email}: ${resetUrl}`,
        );
      }

      emailService.sendPasswordReset({ to: email, name: user.name, resetUrl })
        .catch(err => app.log.error({ err }, 'Failed to send password reset email'));
    },

    async resetPassword(token: string, newPassword: string) {
      const record = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: { select: { id: true, isActive: true } } },
      });

      if (!record || record.usedAt || record.expiresAt < new Date() || !record.user.isActive) {
        throw { statusCode: 400, message: 'Token inválido ou expirado' };
      }

      const passwordHash = await bcrypt.hash(newPassword, 12);

      await prisma.$transaction([
        prisma.user.update({ where: { id: record.userId }, data: { passwordHash, refreshToken: null } }),
        prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      ]);
    },
  };
}
