import { PrismaClient, SubscriptionStatus } from '@prisma/client';

export function createSubscriptionRepository(prisma: PrismaClient) {
  return {
    findByParentId(parentId: string) {
      return prisma.subscription.findFirst({
        where: { parentId },
        include: {
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });
    },
    create(data: {
      parentId: string;
      studentId: string;
      externalSubscriptionId?: string;
      externalCustomerId?: string;
      status?: SubscriptionStatus;
      trialEndsAt?: Date;
      currentPeriodEnd?: Date;
    }) {
      return prisma.subscription.create({ data });
    },
    updateStatus(id: string, data: {
      status: SubscriptionStatus;
      currentPeriodEnd?: Date;
      cancelledAt?: Date;
    }) {
      return prisma.subscription.update({ where: { id }, data });
    },
    findByExternalId(externalSubscriptionId: string) {
      return prisma.subscription.findFirst({ where: { externalSubscriptionId } });
    },
    createPayment(data: {
      subscriptionId: string;
      amountCents: number;
      status: string;
      paidAt?: Date;
      failureReason?: string;
      externalPaymentId?: string;
      rawWebhookPayload?: object;
    }) {
      return prisma.payment.create({ data });
    },
    listPayments(subscriptionId: string, limit = 10) {
      return prisma.payment.findMany({
        where: { subscriptionId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          amountCents: true,
          status: true,
          paidAt: true,
          failureReason: true,
          createdAt: true,
        },
      });
    },
  };
}
