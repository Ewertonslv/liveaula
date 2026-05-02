import { PrismaClient } from '@prisma/client';

export function createInvitationRepository(prisma: PrismaClient) {
  return {
    async create(data: {
      professorId: string;
      studentId: string;
      parentEmail: string;
      token: string;
      expiresAt: Date;
    }) {
      return prisma.invitation.create({
        data,
        select: {
          id: true, token: true, parentEmail: true, status: true,
          expiresAt: true, createdAt: true,
          student: { select: { id: true, name: true, subject: { select: { id: true, name: true } } } },
        },
      });
    },

    async findByToken(token: string) {
      return prisma.invitation.findFirst({
        where: { token, status: 'PENDING', expiresAt: { gt: new Date() } },
        select: {
          id: true, token: true, parentEmail: true, status: true, expiresAt: true,
          studentId: true,
          student: { select: { id: true, name: true, subject: { select: { id: true, name: true } } } },
          professor: { select: { id: true, name: true } },
        },
      });
    },

    async findExisting(studentId: string, parentEmail: string) {
      return prisma.invitation.findFirst({
        where: { studentId, parentEmail, status: 'PENDING', expiresAt: { gt: new Date() } },
        select: { id: true, token: true, expiresAt: true },
      });
    },

    async findManyByProfessor(professorId: string, status?: string) {
      return prisma.invitation.findMany({
        where: { professorId, ...(status ? { status: status as any } : {}) },
        select: {
          id: true, token: true, parentEmail: true, status: true,
          expiresAt: true, claimedAt: true, createdAt: true,
          student: { select: { id: true, name: true, subject: { select: { id: true, name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    async claim(invitationId: string, parentId: string, studentId: string, ip: string) {
      return prisma.$transaction(async (tx) => {
        await tx.studentParent.create({
          data: { studentId, parentId, consentIp: ip },
        });
        return tx.invitation.update({
          where: { id: invitationId },
          data: { status: 'CLAIMED', claimedAt: new Date(), claimedById: parentId },
        });
      });
    },
  };
}
