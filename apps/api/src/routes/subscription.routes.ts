import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { createSubscriptionRepository } from '../repositories/subscription.repository';
import { paymentService } from '../services/payment.service';
import { requireAuth } from '../middleware/requireAuth';
import { requireRole } from '../middleware/requireRole';

const subscribeBodySchema = z.object({
  studentId: z.string().cuid(),
  paymentMethodToken: z.string().min(1),
});

export async function subscriptionRoutes(fastify: FastifyInstance) {
  // GET /subscription — status da assinatura do pai
  fastify.get('/', {
    preHandler: [requireAuth, requireRole('PARENT')],
    config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const subRepo = createSubscriptionRepository(fastify.prisma);
      const subscription = await subRepo.findByParentId(request.user.id);
      if (!subscription) {
        return reply.send({ status: 'NONE' });
      }
      return reply.send(subscription);
    },
  });

  // POST /subscription — criar assinatura
  fastify.post('/', {
    preHandler: [requireAuth, requireRole('PARENT')],
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const body = subscribeBodySchema.parse(request.body);
      const subRepo = createSubscriptionRepository(fastify.prisma);

      // Verificar se já tem assinatura ativa
      const existing = await subRepo.findByParentId(request.user.id);
      if (existing && ['ACTIVE', 'TRIAL'].includes(existing.status)) {
        return reply.status(409).send({ error: 'SUBSCRIPTION_ALREADY_EXISTS' });
      }

      // Criar/buscar customer Asaas
      const parentUser = await fastify.prisma.user.findUniqueOrThrow({
        where: { id: request.user.id },
        select: { name: true, email: true, externalCustomerId: true },
      });

      let customerId = parentUser.externalCustomerId;
      if (!customerId) {
        const customer = await paymentService.createCustomer({
          name: parentUser.name,
          email: parentUser.email,
        });
        customerId = customer.id;
        await fastify.prisma.user.update({
          where: { id: request.user.id },
          data: { externalCustomerId: customerId },
        });
      }

      // Criar assinatura Asaas
      const nextDueDate = new Date();
      nextDueDate.setDate(nextDueDate.getDate() + 1);
      const dueDateStr = nextDueDate.toISOString().split('T')[0];

      const asaasSubscription = await paymentService.createSubscription({
        customer: customerId,
        billingType: 'CREDIT_CARD',
        value: 79.0,
        nextDueDate: dueDateStr,
        cycle: 'MONTHLY',
        description: 'Assinatura liveaula — acompanhamento de aulas',
      });

      // Persistir no banco
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);

      const subscription = await subRepo.create({
        parentId: request.user.id,
        studentId: body.studentId,
        externalSubscriptionId: asaasSubscription.id,
        status: 'TRIAL',
        trialEndsAt,
      });

      return reply.status(201).send(subscription);
    },
  });

  // DELETE /subscription — cancelar assinatura
  fastify.delete('/', {
    preHandler: [requireAuth, requireRole('PARENT')],
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const subRepo = createSubscriptionRepository(fastify.prisma);
      const subscription = await subRepo.findByParentId(request.user.id);

      if (!subscription || !['ACTIVE', 'TRIAL', 'PAST_DUE'].includes(subscription.status)) {
        return reply.status(404).send({ error: 'Nenhuma assinatura ativa encontrada' });
      }

      if (subscription.externalSubscriptionId) {
        try {
          await paymentService.cancelSubscription(subscription.externalSubscriptionId);
        } catch (err) {
          fastify.log.error({ err }, 'Asaas cancel failed — marking cancelled locally anyway');
        }
      }

      await fastify.prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: 'CANCELLED', cancelledAt: new Date() },
      });

      return reply.send({ message: 'Assinatura cancelada com sucesso' });
    },
  });

  // GET /subscription/payments — pagamentos da assinatura
  fastify.get('/payments', {
    preHandler: [requireAuth, requireRole('PARENT')],
    config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const subRepo = createSubscriptionRepository(fastify.prisma);
      const subscription = await subRepo.findByParentId(request.user.id);
      if (!subscription) {
        return reply.send([]);
      }
      const payments = await subRepo.listPayments(subscription.id, 10);
      return reply.send(payments);
    },
  });

  // GET /subscription/payments/:id/receipt — recibo de pagamento em HTML para impressão
  fastify.get('/payments/:id/receipt', {
    preHandler: [requireAuth, requireRole('PARENT')],
    config: { rateLimit: { max: 20, timeWindow: '1 minute' } },
    handler: async (request, reply) => {
      const { id } = request.params as { id: string };

      const payment = await fastify.prisma.payment.findFirst({
        where: { id },
        include: {
          subscription: {
            include: {
              parent: { select: { name: true, email: true } },
            },
          },
        },
      });

      if (!payment || payment.subscription.parentId !== request.user.id) {
        return reply.status(404).send({ error: 'Pagamento não encontrado' });
      }

      if (payment.status !== 'PAID') {
        return reply.status(400).send({ error: 'Recibo disponível apenas para pagamentos confirmados' });
      }

      const student = payment.subscription.studentId
        ? await fastify.prisma.student.findUnique({
            where: { id: payment.subscription.studentId },
            select: { name: true },
          })
        : null;

      const amount = (payment.amountCents / 100).toFixed(2).replace('.', ',');
      const paidDate = (payment.paidAt ?? payment.createdAt).toLocaleDateString('pt-BR');
      const parentName = payment.subscription.parent.name;
      const studentName = student?.name ?? '—';
      const receiptNumber = payment.id.slice(-8).toUpperCase();

      const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Recibo liveaula #${receiptNumber}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; color: #1e293b; padding: 40px 20px; }
  .receipt { max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,.08); }
  .header { background: #1A6B74; color: #fff; padding: 28px 32px; }
  .header h1 { font-size: 22px; font-weight: 700; letter-spacing: -.3px; }
  .header p { font-size: 13px; opacity: .85; margin-top: 4px; }
  .badge { display: inline-block; background: rgba(255,255,255,.2); border-radius: 20px; padding: 3px 12px; font-size: 12px; margin-top: 10px; }
  .body { padding: 28px 32px; }
  .row { display: flex; justify-content: space-between; align-items: baseline; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
  .row:last-child { border-bottom: none; }
  .label { font-size: 13px; color: #64748b; }
  .value { font-size: 14px; font-weight: 600; color: #1e293b; text-align: right; }
  .amount-row { margin-top: 8px; padding: 14px 0; border-top: 2px solid #e2e8f0; }
  .amount-row .label { font-size: 15px; font-weight: 700; color: #1A6B74; }
  .amount-row .value { font-size: 22px; font-weight: 800; color: #1A6B74; }
  .footer { padding: 16px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
  @media print {
    body { background: #fff; padding: 0; }
    .receipt { box-shadow: none; border-radius: 0; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<div class="receipt">
  <div class="header">
    <h1>liveaula</h1>
    <p>Recibo de pagamento</p>
    <span class="badge">✓ Pago</span>
  </div>
  <div class="body">
    <div class="row">
      <span class="label">N° do recibo</span>
      <span class="value">#${receiptNumber}</span>
    </div>
    <div class="row">
      <span class="label">Data do pagamento</span>
      <span class="value">${paidDate}</span>
    </div>
    <div class="row">
      <span class="label">Responsável</span>
      <span class="value">${parentName}</span>
    </div>
    <div class="row">
      <span class="label">Aluno</span>
      <span class="value">${studentName}</span>
    </div>
    <div class="row">
      <span class="label">Plano</span>
      <span class="value">Acompanhamento de aulas — mensal</span>
    </div>
    <div class="row amount-row">
      <span class="label">Total pago</span>
      <span class="value">R$ ${amount}</span>
    </div>
  </div>
  <div class="footer">liveaula — Plataforma de acompanhamento de aulas particulares<br>Este documento é um comprovante de pagamento eletrônico.</div>
</div>
<div class="no-print" style="text-align:center;margin-top:20px">
  <button onclick="window.print()" style="background:#1A6B74;color:#fff;border:none;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">Imprimir / Salvar PDF</button>
</div>
</body>
</html>`;

      return reply.type('text/html').send(html);
    },
  });
}
