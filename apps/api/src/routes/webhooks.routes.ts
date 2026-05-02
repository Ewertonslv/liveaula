import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { createSubscriptionRepository } from '../repositories/subscription.repository';

export async function webhooksRoutes(fastify: FastifyInstance) {
  // POST /webhooks/asaas
  fastify.post('/asaas', {
    config: { rateLimit: { max: 100, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      // Validar token webhook via timing-safe compare (sem length pre-check — evita timing oracle)
      const webhookToken = (request.headers['asaas-access-token'] as string) || '';
      const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN || '';

      if (!expectedToken) {
        fastify.log.error('ASAAS_WEBHOOK_TOKEN not configured');
        return reply.status(500).send({ error: 'MISCONFIGURED' });
      }

      // Pad to same length before compare to prevent length-based timing oracle
      const maxLen = Math.max(webhookToken.length, expectedToken.length);
      const a = Buffer.alloc(maxLen);
      const b = Buffer.alloc(maxLen);
      Buffer.from(webhookToken).copy(a);
      Buffer.from(expectedToken).copy(b);

      const isValid = crypto.timingSafeEqual(a, b) && webhookToken.length === expectedToken.length;
      if (!isValid) {
        return reply.status(401).send({ error: 'UNAUTHORIZED' });
      }

      const payload = request.body as {
        event: string;
        payment?: {
          id: string;
          subscription: string;
          value: number;
          status: string;
          paymentDate?: string;
          failReason?: string;
          dueDate: string;
        };
        subscription?: {
          id: string;
          status: string;
        };
      };

      const subRepo = createSubscriptionRepository(fastify.prisma);

      try {
        const externalSubId = payload.payment?.subscription || payload.subscription?.id;
        if (!externalSubId) {
          return reply.send({ received: true });
        }

        const subscription = await subRepo.findByExternalId(externalSubId);
        if (!subscription) {
          return reply.send({ received: true }); // silently ignore unknown subscriptions
        }

        switch (payload.event) {
          case 'PAYMENT_RECEIVED': {
            const payment = payload.payment!;
            await subRepo.createPayment({
              subscriptionId: subscription.id,
              amountCents: Math.round(payment.value * 100),
              status: 'paid',
              paidAt: payment.paymentDate ? new Date(payment.paymentDate) : new Date(),
              externalPaymentId: payment.id,
              rawWebhookPayload: payload,
            });
            const nextPeriodEnd = new Date(payment.dueDate);
            nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);
            await subRepo.updateStatus(subscription.id, {
              status: 'ACTIVE',
              currentPeriodEnd: nextPeriodEnd,
            });
            break;
          }
          case 'PAYMENT_OVERDUE': {
            const payment = payload.payment!;
            await subRepo.createPayment({
              subscriptionId: subscription.id,
              amountCents: Math.round(payment.value * 100),
              status: 'overdue',
              externalPaymentId: payment.id,
              rawWebhookPayload: payload,
            });
            await subRepo.updateStatus(subscription.id, { status: 'PAST_DUE' });
            break;
          }
          case 'PAYMENT_DELETED':
          case 'SUBSCRIPTION_DELETED': {
            await subRepo.updateStatus(subscription.id, {
              status: 'CANCELLED',
              cancelledAt: new Date(),
            });
            break;
          }
          default:
            break; // log but return 200 for unknown events
        }
      } catch (err) {
        fastify.log.error(err, 'Webhook processing error');
        // Still return 200 to prevent Asaas from retrying indefinitely
      }

      return reply.send({ received: true });
    },
  });
}
