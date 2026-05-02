/**
 * Demo fixture — pai vinculado a Aluno 1 do professor1@test.com.
 * Cria (ou reaproveita) um pai com:
 *   - email: pai-demo@liveaula.com / senha Demo@1234
 *   - LGPD_PARENTAL_ART14 consent
 *   - StudentParent vínculo a Aluno 1
 *   - Assinatura ACTIVE (sem paywall na demo)
 *   - Aulas adicionais variadas (humor, horários, status confirmação)
 *
 * Idempotente: pode rodar várias vezes sem duplicar dados.
 *
 * Uso:
 *   cd apps/api && corepack pnpm exec tsx prisma/seed-demo-parent.ts
 */
import { PrismaClient, Role, SubscriptionStatus, LessonEmotion } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PARENT_EMAIL = 'pai-demo@liveaula.com';
const PARENT_PASSWORD = 'Demo@1234';
const PARENT_NAME = 'Maria Demo';
const PROFESSOR_EMAIL = 'professor1@test.com';
const STUDENT_NAME = 'Aluno 1';

async function main() {
  console.log('🌱 Seeding demo parent fixture...');

  // 1. Find professor1 + Aluno 1
  const professor = await prisma.user.findUnique({
    where: { email: PROFESSOR_EMAIL },
    select: { id: true },
  });
  if (!professor) throw new Error(`Professor ${PROFESSOR_EMAIL} não existe. Rode seed.ts primeiro.`);

  const student = await prisma.student.findFirst({
    where: { professorId: professor.id, name: STUDENT_NAME },
    select: { id: true, name: true, subjectId: true },
  });
  if (!student) throw new Error(`Student ${STUDENT_NAME} não existe.`);

  // 2. Create or update parent user
  const passwordHash = await bcrypt.hash(PARENT_PASSWORD, 12);
  const parent = await prisma.user.upsert({
    where: { email: PARENT_EMAIL },
    update: {
      isActive: true,
      emailVerifiedAt: new Date(),
    },
    create: {
      email: PARENT_EMAIL,
      passwordHash,
      role: Role.PARENT,
      name: PARENT_NAME,
      isActive: true,
      emailVerifiedAt: new Date(),
    },
    select: { id: true, email: true },
  });
  console.log(`  ✓ Parent: ${parent.email}`);

  // 3. LGPD consent (idempotent — only create if absent)
  const existingConsent = await prisma.consentLog.findFirst({
    where: { userId: parent.id, consentType: 'LGPD_PARENTAL_ART14', revokedAt: null },
  });
  if (!existingConsent) {
    await prisma.consentLog.create({
      data: {
        userId: parent.id,
        consentType: 'LGPD_PARENTAL_ART14',
        version: '1.0',
        ip: '127.0.0.1',
      },
    });
    console.log('  ✓ LGPD consent gravado');
  } else {
    console.log('  · LGPD consent já existia');
  }

  // 4. Terms of use consent
  const existingTerms = await prisma.consentLog.findFirst({
    where: { userId: parent.id, consentType: 'TERMS_OF_USE', revokedAt: null },
  });
  if (!existingTerms) {
    await prisma.consentLog.create({
      data: {
        userId: parent.id,
        consentType: 'TERMS_OF_USE',
        version: '1.0',
        ip: '127.0.0.1',
      },
    });
  }

  // 5. StudentParent link
  await prisma.studentParent.upsert({
    where: { studentId_parentId: { studentId: student.id, parentId: parent.id } },
    update: {},
    create: {
      studentId: student.id,
      parentId: parent.id,
      consentIp: '127.0.0.1',
    },
  });
  console.log(`  ✓ Vínculo Maria Demo ↔ ${student.name}`);

  // 6. Active subscription (no paywall)
  const existingSub = await prisma.subscription.findFirst({
    where: { parentId: parent.id, studentId: student.id },
  });
  const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  if (!existingSub) {
    await prisma.subscription.create({
      data: {
        parentId: parent.id,
        studentId: student.id,
        status: SubscriptionStatus.ACTIVE,
        trialEndsAt,
        currentPeriodEnd: periodEnd,
        externalSubscriptionId: 'demo-asaas-sub-1',
      },
    });
    console.log('  ✓ Assinatura ACTIVE criada');
  } else {
    await prisma.subscription.update({
      where: { id: existingSub.id },
      data: {
        status: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: periodEnd,
      },
    });
    console.log('  · Assinatura existente atualizada para ACTIVE');
  }

  // 7. Variar as aulas existentes — algumas confirmadas, outras pendentes,
  //    horários variados (manhã/tarde/noite) para o feed mostrar gradient diferente
  const existingLessons = await prisma.lesson.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: 'desc' },
  });

  if (existingLessons.length < 8) {
    // Adicionar mais aulas espalhadas no mês com variação
    const subjects = await prisma.subject.findMany({ take: 3 });
    const variations: Array<{
      daysAgo: number; hour: number; emotion: LessonEmotion; duration: number;
      what: string; obs?: string; subjectIdx: number; confirm: boolean;
    }> = [
      { daysAgo: 1, hour: 14, emotion: 'GREAT', duration: 60, what: 'Equação do 2º grau e fórmula de Bhaskara. Pedro pegou rápido!', obs: 'Trazer exercícios de revisão pra próxima', subjectIdx: 0, confirm: false },
      { daysAgo: 3, hour: 10, emotion: 'GOOD', duration: 45, what: 'Funções quadráticas — gráficos e raízes', subjectIdx: 0, confirm: true },
      { daysAgo: 5, hour: 16, emotion: 'NEUTRAL', duration: 60, what: 'Redação dissertativa: estrutura e tese. Treinamos abertura.', subjectIdx: 1, confirm: true },
      { daysAgo: 7, hour: 19, emotion: 'GOOD', duration: 60, what: 'Concordância verbal — exceções e casos difíceis', obs: 'Difícil para ele o uso do "haver" como impessoal', subjectIdx: 1, confirm: true },
      { daysAgo: 10, hour: 14, emotion: 'GREAT', duration: 90, what: 'Sistemas lineares com 3 incógnitas — método de Gauss', subjectIdx: 0, confirm: true },
      { daysAgo: 14, hour: 11, emotion: 'DIFFICULT', duration: 45, what: 'Interpretação de texto: gênero argumentativo. Travou em algumas questões.', subjectIdx: 1, confirm: true },
    ];

    for (const v of variations) {
      const at = new Date();
      at.setDate(at.getDate() - v.daysAgo);
      at.setHours(v.hour, 0, 0, 0);
      const subject = subjects[v.subjectIdx] ?? subjects[0];
      await prisma.lesson.create({
        data: {
          studentId: student.id,
          subjectId: subject.id,
          professorId: professor.id,
          durationMin: v.duration,
          whatWasDone: v.what,
          observation: v.obs,
          emotion: v.emotion,
          createdAt: at,
          updatedAt: at,
          confirmedByParentAt: v.confirm ? new Date(at.getTime() + 2 * 60 * 60 * 1000) : null,
          confirmedByParentId: v.confirm ? parent.id : null,
        },
      });
    }
    console.log(`  ✓ ${variations.length} aulas variadas criadas`);
  } else {
    console.log(`  · ${existingLessons.length} aulas já existem — pulando variações`);
  }

  console.log('\n✅ Demo parent pronta!');
  console.log(`   Login pai: ${PARENT_EMAIL} / ${PARENT_PASSWORD}`);
  console.log(`   Login professor: ${PROFESSOR_EMAIL} / Test@1234`);
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
