import { PrismaClient } from '@prisma/client';

export function createBillingService(prisma: PrismaClient) {
  return {
    async countActivePaidParentsForProfessor(professorId: string): Promise<number> {
      // Conta pais com subscription ACTIVE vinculados ao professor via Student → StudentParent → Subscription
      const result = await prisma.studentParent.findMany({
        where: {
          student: {
            professorId,
            isActive: true,
          },
          parent: {
            subscriptions: {
              some: { status: 'ACTIVE' },
            },
          },
        },
        select: { parentId: true },
        distinct: ['parentId'],
      });
      return result.length;
    },

    async updateProfessorPlanStatus(professorId: string): Promise<'FREE' | 'PAID'> {
      const count = await this.countActivePaidParentsForProfessor(professorId);
      const newStatus = count >= 5 ? 'FREE' : 'PAID';
      await prisma.user.update({
        where: { id: professorId },
        data: { planStatus: newStatus },
      });
      return newStatus;
    },

    async syncAllProfessorsPlanStatus(): Promise<{ updated: number; freed: number }> {
      const professors = await prisma.user.findMany({
        where: { role: 'PROFESSOR', isActive: true },
        select: { id: true },
      });

      // Processar em batches de 50
      const batchSize = 50;
      let updated = 0;
      let freed = 0;

      for (let i = 0; i < professors.length; i += batchSize) {
        const batch = professors.slice(i, i + batchSize);
        const results = await Promise.all(
          batch.map((p) => this.updateProfessorPlanStatus(p.id)),
        );
        updated += batch.length;
        freed += results.filter((s) => s === 'FREE').length;
      }

      return { updated, freed };
    },
  };
}
