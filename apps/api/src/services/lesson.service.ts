import { FastifyInstance } from 'fastify';
import { LessonEmotion } from '@prisma/client';
import { createLessonRepository } from '../repositories/lesson.repository';
import { createNotificationService } from './notification.service';

export function createLessonService(app: FastifyInstance) {
  const lessonRepo = createLessonRepository(app.prisma);
  const notificationService = createNotificationService(app.prisma);

  return {
    async createLesson(data: {
      professorId: string;
      studentId: string;
      subjectId: string;
      durationMin: number;
      whatWasDone: string;
      observation?: string;
      emotion?: LessonEmotion;
    }) {
      // Verify student ownership
      const student = await app.prisma.student.findFirst({
        where: { id: data.studentId, professorId: data.professorId },
        include: { subject: true },
      });
      if (!student) {
        throw { statusCode: 403, message: 'Aluno não pertence a este professor' };
      }

      const lessonRaw = await lessonRepo.create(data);
      const lesson = lessonRaw as typeof lessonRaw & {
        subject: { id: string; name: string };
        student: { id: string; name: string; gradeLevel: string; avatarUrl: string | null };
      };

      // Fire-and-forget push — does not block response
      setImmediate(async () => {
        try {
          await notificationService.sendPushToParent(data.studentId, {
            id: lesson.id,
            whatWasDone: lesson.whatWasDone,
            subject: lesson.subject,
            student: lesson.student,
          });
          await lessonRepo.updateNotifiedAt(lesson.id);
        } catch {
          // Silently ignore push failures
        }
      });

      return lesson;
    },

    lessonRepo,
  };
}
