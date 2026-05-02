import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SUBJECTS = [
  'Matemática', 'Português', 'Física', 'Química', 'Biologia',
  'História', 'Geografia', 'Inglês', 'Artes', 'Educação Física',
  'Redação', 'Literatura', 'Filosofia', 'Sociologia', 'Informática',
  'Música', 'Espanhol', 'Francês', 'Libras', 'Robótica',
];

async function main() {
  const subjects = await Promise.all(
    SUBJECTS.map(name =>
      prisma.subject.upsert({ where: { name }, update: {}, create: { name } })
    )
  );

  const adminHash = await bcrypt.hash('Admin@secure1', 12);
  await prisma.user.upsert({
    where: { email: 'admin@liveaula.com' },
    update: {},
    create: { email: 'admin@liveaula.com', passwordHash: adminHash, role: Role.ADMIN, name: 'Admin liveaula' },
  });

  const profHash = await bcrypt.hash('Test@1234', 12);
  const professors = await Promise.all(
    Array.from({ length: 5 }, (_, i) =>
      prisma.user.upsert({
        where: { email: `professor${i + 1}@test.com` },
        update: {},
        create: { email: `professor${i + 1}@test.com`, passwordHash: profHash, role: Role.PROFESSOR, name: `Professor ${i + 1}` },
      })
    )
  );

  const mathSubject = subjects.find(s => s.name === 'Matemática')!;
  const portSubject = subjects.find(s => s.name === 'Português')!;

  const students = await Promise.all(
    professors.flatMap((prof, pi) =>
      [0, 1].map(si =>
        prisma.student.create({
          data: {
            name: `Aluno ${pi * 2 + si + 1}`,
            gradeLevel: `${si + 6}º EF`,
            professorId: prof.id,
            subjectId: si === 0 ? mathSubject.id : portSubject.id,
          },
        })
      )
    )
  );

  await Promise.all(
    students.flatMap(student =>
      [0, 1].map(li =>
        prisma.lesson.create({
          data: {
            studentId: student.id,
            subjectId: student.subjectId,
            professorId: student.professorId,
            durationMin: 60,
            whatWasDone: `Aula ${li + 1}: revisão de conteúdo programático.`,
            createdAt: new Date(Date.now() - (li + 1) * 24 * 60 * 60 * 1000),
          },
        })
      )
    )
  );
}

main().catch(console.error).finally(() => prisma.$disconnect());
