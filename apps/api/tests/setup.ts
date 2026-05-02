import { PrismaClient } from '@prisma/client';

const SUBJECTS = [
  'Matemática', 'Português', 'Física', 'Química', 'Biologia',
  'História', 'Geografia', 'Inglês', 'Artes', 'Educação Física',
];

export default async function globalSetup() {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/liveaula_test?schema=public';

  const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
  });
  try {
    await Promise.all(
      SUBJECTS.map(name =>
        prisma.subject.upsert({ where: { name }, update: {}, create: { name } })
      )
    );
  } finally {
    await prisma.$disconnect();
  }
}
