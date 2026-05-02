import { PrismaClient } from '@prisma/client';

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  avatarUrl: true,
  bio: true,
  isActive: true,
  planStatus: true,
  createdAt: true,
} as const;

export function createUserRepository(prisma: PrismaClient) {
  return {
    async findByEmail(email: string) {
      return prisma.user.findUnique({
        where: { email },
        select: { ...USER_SELECT, passwordHash: true, refreshToken: true },
      });
    },

    async findById(id: string) {
      return prisma.user.findUnique({
        where: { id },
        select: USER_SELECT,
      });
    },

    async create(data: {
      email: string;
      passwordHash: string;
      name: string;
      role: 'PROFESSOR' | 'PARENT' | 'ADMIN';
    }) {
      return prisma.user.create({
        data,
        select: USER_SELECT,
      });
    },

    async updateRefreshToken(id: string, refreshToken: string | null) {
      return prisma.user.update({
        where: { id },
        data: { refreshToken },
        select: { id: true },
      });
    },

    async findByRefreshToken(refreshToken: string) {
      return prisma.user.findFirst({
        where: { refreshToken },
        select: { ...USER_SELECT, refreshToken: true },
      });
    },
  };
}
