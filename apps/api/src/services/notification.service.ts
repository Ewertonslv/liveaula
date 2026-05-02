import { PrismaClient } from '@prisma/client';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN || undefined,
  useFcmV1: true,
});

export function createNotificationService(prisma: PrismaClient) {
  return {
    async getValidTokensForStudent(studentId: string): Promise<string[]> {
      const parents = await prisma.studentParent.findMany({
        where: { studentId },
        include: {
          parent: {
            include: {
              deviceTokens: { where: { isValid: true } },
            },
          },
        },
      });

      return parents.flatMap(p => p.parent.deviceTokens.map(dt => dt.token));
    },

    async sendPushToParent(studentId: string, lesson: {
      id: string;
      whatWasDone: string;
      subject: { name: string };
      student: { name: string };
    }): Promise<void> {
      const parents = await prisma.studentParent.findMany({
        where: { studentId },
        include: {
          parent: {
            include: { deviceTokens: { where: { isValid: true } } },
          },
        },
      });

      if (parents.length === 0) return;

      const title = `Nova aula de ${lesson.subject.name}`;
      const body = lesson.whatWasDone.slice(0, 100) + (lesson.whatWasDone.length > 100 ? '...' : '');

      // Persist notification log for all parent recipients
      await prisma.pushNotificationLog.createMany({
        data: parents.map(p => ({
          recipientId: p.parentId,
          lessonId: lesson.id,
          title,
          body,
        })),
        skipDuplicates: true,
      });

      const tokens = parents.flatMap(p => p.parent.deviceTokens.map(dt => dt.token));
      const validTokens = tokens.filter(t => Expo.isExpoPushToken(t));
      if (validTokens.length === 0) return;

      const messages: ExpoPushMessage[] = validTokens.map(token => ({
        to: token,
        title,
        body,
        data: { lessonId: lesson.id, type: 'NEW_LESSON', studentName: lesson.student.name },
        sound: 'default',
      }));

      try {
        const chunks = expo.chunkPushNotifications(messages);
        for (const chunk of chunks) {
          await expo.sendPushNotificationsAsync(chunk);
        }
      } catch (err) {
        console.error('Push notification error:', err);
      }
    },
  };
}
