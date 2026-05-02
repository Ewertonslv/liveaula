import crypto from 'crypto';
import { FastifyInstance } from 'fastify';
import { createInvitationRepository } from '../repositories/invitation.repository';
import { emailService } from './email.service';

export function createInvitationService(app: FastifyInstance) {
  const repo = createInvitationRepository(app.prisma);

  return {
    async createInvitation(professorId: string, studentId: string, parentEmail: string) {
      const professor = await app.prisma.user.findUnique({ where: { id: professorId }, select: { name: true } });

      const student = await app.prisma.student.findFirst({
        where: { id: studentId, professorId },
        include: { subject: { select: { name: true } } },
      });
      if (!student) {
        throw { statusCode: 403, message: 'Aluno não pertence a este professor' };
      }

      // Return existing pending invitation if exists (and resend email)
      const existing = await repo.findExisting(studentId, parentEmail);
      if (existing) {
        const inviteUrl = `${process.env.WEB_URL || 'https://liveaula.com'}/invite/${existing.token}`;
        emailService.sendInvitation({
          to: parentEmail,
          professorName: professor?.name ?? 'Professor',
          studentName: student.name,
          subjectName: student.subject.name,
          inviteUrl,
          expiresAt: existing.expiresAt,
        }).catch(err => app.log.error({ err }, 'Failed to resend invitation email'));
        return { ...existing, inviteUrl };
      }

      const token = crypto.randomBytes(32).toString('base64url');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const invitation = await repo.create({ professorId, studentId, parentEmail, token, expiresAt });
      const inviteUrl = `${process.env.WEB_URL || 'https://liveaula.com'}/invite/${invitation.token}`;

      emailService.sendInvitation({
        to: parentEmail,
        professorName: professor?.name ?? 'Professor',
        studentName: student.name,
        subjectName: student.subject.name,
        inviteUrl,
        expiresAt: invitation.expiresAt,
      }).catch(err => app.log.error({ err }, 'Failed to send invitation email'));

      return {
        id: invitation.id,
        token: invitation.token,
        inviteUrl,
        expiresAt: invitation.expiresAt,
        student: invitation.student,
      };
    },

    async validateToken(token: string) {
      const invitation = await repo.findByToken(token);
      if (!invitation) {
        throw { statusCode: 404, message: 'Convite inválido ou expirado' };
      }
      return {
        studentId: invitation.student.id,
        studentName: invitation.student.name,
        subjectName: invitation.student.subject.name,
        professorName: invitation.professor.name,
        parentEmail: invitation.parentEmail,
        expiresAt: invitation.expiresAt,
      };
    },

    // FIX I07: verifica email antes de qualquer mudança
    async claimInvitation(token: string, parentId: string, parentEmail: string, ip: string) {
      const invitation = await repo.findByToken(token);
      if (!invitation) {
        throw { statusCode: 404, message: 'Convite inválido ou expirado' };
      }

      if (invitation.parentEmail.toLowerCase() !== parentEmail.toLowerCase()) {
        throw { statusCode: 400, message: 'Email não corresponde ao convite' };
      }

      return repo.claim(invitation.id, parentId, invitation.studentId, ip);
    },

    async listByProfessor(professorId: string, status?: string) {
      return repo.findManyByProfessor(professorId, status);
    },
  };
}
