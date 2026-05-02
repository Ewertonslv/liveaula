/**
 * Idempotent bootstrap — runs on every container start.
 * Creates baseline data needed for the app to be usable (subjects).
 * Safe to run multiple times via upsert.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SUBJECTS = [
  'Matemática', 'Português', 'Física', 'Química', 'Biologia',
  'História', 'Geografia', 'Inglês', 'Artes', 'Educação Física',
  'Redação', 'Literatura', 'Filosofia', 'Sociologia', 'Informática',
  'Música', 'Espanhol', 'Francês', 'Libras', 'Robótica',
];

async function main() {
  const before = await prisma.subject.count();
  await Promise.all(
    SUBJECTS.map((name) =>
      prisma.subject.upsert({ where: { name }, update: {}, create: { name } }),
    ),
  );
  const after = await prisma.subject.count();
  console.log(`[bootstrap] subjects: ${before} → ${after}`);
}

main()
  .catch((e) => {
    console.error('[bootstrap] error (non-fatal):', e);
    process.exitCode = 0;
  })
  .finally(() => prisma.$disconnect());
