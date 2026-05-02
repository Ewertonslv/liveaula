import type { PrismaClient } from '@prisma/client';

export async function cleanupUsersByEmailSuffix(prisma: PrismaClient, suffix: string) {
  const userFilter = { user: { email: { contains: suffix } } };
  const recipientFilter = { recipient: { email: { contains: suffix } } };
  const professorFilter = { professor: { email: { contains: suffix } } };
  const studentByProfessor = { student: professorFilter };
  const subscriptionByParent = { subscription: { parent: { email: { contains: suffix } } } };
  const studentParentByEmail = {
    OR: [
      { parent: { email: { contains: suffix } } },
      { student: professorFilter },
    ],
  };

  await prisma.pushNotificationLog.deleteMany({ where: recipientFilter });
  await prisma.payment.deleteMany({ where: subscriptionByParent });
  await prisma.subscription.deleteMany({ where: { parent: { email: { contains: suffix } } } });
  await prisma.invitation.deleteMany({
    where: {
      OR: [
        professorFilter,
        { parentEmail: { contains: suffix } },
      ],
    },
  });
  await prisma.studentParent.deleteMany({ where: studentParentByEmail });
  await prisma.lesson.deleteMany({
    where: {
      OR: [professorFilter, studentByProfessor],
    },
  });
  await prisma.student.deleteMany({ where: professorFilter });
  await prisma.deviceToken.deleteMany({ where: userFilter });
  await prisma.consentLog.deleteMany({ where: userFilter });
  await prisma.passwordResetToken.deleteMany({ where: userFilter });
  await prisma.emailVerificationToken.deleteMany({ where: userFilter });
  await prisma.user.deleteMany({ where: { email: { contains: suffix } } });
}
